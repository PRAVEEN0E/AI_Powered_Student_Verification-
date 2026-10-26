import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { pool } from '../config/db.js';

const CREDENTIAL_SIGNING_SECRET = process.env.CREDENTIAL_SIGNING_SECRET || 'aicte-production-edupass-signing-key-sec-256';

export interface CredentialPayload {
  sub: string; // student UUID
  apaarIdHash: string; // SHA-256 hash of APAAR ID to prevent cleartext exposure
  fullName: string;
  institutionName: string;
  aicteCode: string;
  programName: string;
  degreeLevel: string;
  academicYear: string;
  cgpa?: number;
  degreeAwarded: boolean;
  issuedAt: string;
  credentialId: string;
}

export const credentialRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // 1. Issue a Tamper-Proof Digitally Signed Academic Credential & QR Code
  app.post<{ Body: { enrollmentId: string } }>('/api/credentials/issue', {
    preHandler: [(app as any).authenticate, (app as any).authorize(['COLLEGE_ADMIN', 'AICTE_ADMIN'])],
    schema: {
      body: {
        type: 'object',
        required: ['enrollmentId'],
        properties: {
          enrollmentId: { type: 'string' }
        }
      }
    }
  }, async (request: any, reply) => {
    const { enrollmentId } = request.body;
    const userRole = request.user.role;
    const userInstId = request.user.institutionId;

    let query = `
      SELECT 
        e.id as enrollment_id, e.institution_id, e.roll_number, e.academic_year, e.cgpa, e.degree_awarded,
        s.id as student_id, s.apaar_id, s.full_name,
        i.name as institution_name, i.aicte_code,
        p.program_name, p.degree_level
      FROM enrollments e
      JOIN students s ON e.student_id = s.id
      JOIN institutions i ON e.institution_id = i.id
      JOIN academic_programs p ON e.program_id = p.id
      WHERE e.id = $1
    `;
    const params = [enrollmentId];

    // Enforce Institution Isolation
    if (userRole === 'COLLEGE_ADMIN') {
      query += ` AND e.institution_id = $2`;
      params.push(userInstId);
    }

    const res = await pool.query(query, params);
    if (res.rows.length === 0) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Enrollment record not found or access unauthorized for your institution.'
      });
    }

    const rec = res.rows[0];
    const credentialId = `AICTE-CERT-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const apaarIdHash = crypto.createHash('sha256').update(rec.apaar_id).digest('hex');

    const payload: CredentialPayload = {
      sub: rec.student_id,
      apaarIdHash,
      fullName: rec.full_name,
      institutionName: rec.institution_name,
      aicteCode: rec.aicte_code,
      programName: rec.program_name,
      degreeLevel: rec.degree_level,
      academicYear: rec.academic_year,
      cgpa: rec.cgpa ? parseFloat(rec.cgpa) : undefined,
      degreeAwarded: rec.degree_awarded,
      issuedAt: new Date().toISOString(),
      credentialId
    };

    // Digitally sign payload
    const token = jwt.sign(payload, CREDENTIAL_SIGNING_SECRET, {
      algorithm: 'HS256',
      expiresIn: '10y'
    });

    // Public QR Verification URL — does NOT leak cleartext APAAR ID
    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${frontendBaseUrl}/verify/credential?token=${token}`;

    // Generate high-resolution QR data URL
    const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320
    });

    return reply.send({
      message: 'Academic credential successfully minted & signed',
      credentialId,
      verifyUrl,
      token,
      qrCodeDataUrl,
      payload
    });
  });

  // 2. Validate Signed Academic Credential Token & Detect Tampering
  app.get<{ Querystring: { token: string } }>('/api/credentials/verify', {
    schema: {
      querystring: {
        type: 'object',
        required: ['token'],
        properties: {
          token: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const { token } = request.query;

    try {
      const decoded = jwt.verify(token, CREDENTIAL_SIGNING_SECRET, {
        algorithms: ['HS256']
      }) as CredentialPayload;

      return reply.send({
        authentic: true,
        tampered: false,
        message: 'Cryptographic signature verified by AICTE Central Root Authority',
        credential: {
          credentialId: decoded.credentialId,
          fullName: decoded.fullName,
          institutionName: decoded.institutionName,
          aicteCode: decoded.aicteCode,
          programName: decoded.programName,
          degreeLevel: decoded.degreeLevel,
          academicYear: decoded.academicYear,
          cgpa: decoded.cgpa,
          degreeAwarded: decoded.degreeAwarded,
          issuedAt: decoded.issuedAt
        }
      });
    } catch (err: any) {
      return reply.status(400).send({
        authentic: false,
        tampered: true,
        error: 'Invalid or Tampered Credential Signature',
        message: 'The digital signature does not match or payload has been altered! AICTE authenticity validation failed.'
      });
    }
  });

  // 3. Upload Student Certificate Document (Degree, Marksheet, Transfer Certificate, etc.)
  app.post('/api/credentials/upload', {
    preHandler: [(app as any).authenticate, (app as any).authorize(['COLLEGE_ADMIN', 'AICTE_ADMIN'])]
  }, async (request: any, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'Bad Request', message: 'No certificate file uploaded.' });
    }

    const fields: Record<string, string> = {};
    for (const key in data.fields) {
      const field = data.fields[key];
      fields[key] = (field as any).value;
    }

    const { apaarId, certificateType, title } = fields;
    if (!apaarId || !certificateType || !title) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'apaarId, certificateType, and title are required.'
      });
    }

    // Verify student exists
    const stuRes = await pool.query('SELECT id, full_name FROM students WHERE apaar_id = $1', [apaarId]);
    if (stuRes.rows.length === 0) {
      return reply.status(404).send({ error: 'Not Found', message: `No student found with APAAR ID ${apaarId}` });
    }
    const student = stuRes.rows[0];

    const institutionId = request.user.institutionId;
    if (!institutionId && request.user.role !== 'AICTE_ADMIN') {
      return reply.status(403).send({ error: 'Forbidden', message: 'No college institution associated with user.' });
    }

    // Convert file buffer to base64 Data URL for secure, portable storage & instant inline rendering
    const buffer = await data.toBuffer();
    const base64Data = `data:${data.mimetype};base64,${buffer.toString('base64')}`;

    const insertRes = await pool.query(`
      INSERT INTO student_certificates (
        student_id, institution_id, certificate_type, title, file_name, file_data, mime_type, file_size
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, student_id, certificate_type, title, file_name, mime_type, file_size, uploaded_at
    `, [
      student.id,
      institutionId,
      certificateType,
      title,
      data.filename,
      base64Data,
      data.mimetype,
      buffer.length
    ]);

    return reply.send({
      message: 'Certificate uploaded successfully!',
      certificate: insertRes.rows[0],
      student: {
        id: student.id,
        apaarId,
        fullName: student.full_name
      }
    });
  });

  // 4. Get Certificates for a Student (by APAAR ID or student ID)
  app.get<{ Params: { apaarId: string } }>('/api/credentials/student/:apaarId', {
    preHandler: [(app as any).authenticate]
  }, async (request: any, reply) => {
    const { apaarId } = request.params;

    const stuRes = await pool.query('SELECT id, full_name, apaar_id FROM students WHERE apaar_id = $1 OR id::text = $1', [apaarId]);
    if (stuRes.rows.length === 0) {
      return reply.status(404).send({ error: 'Not Found', message: 'Student not found.' });
    }
    const student = stuRes.rows[0];

    const certRes = await pool.query(`
      SELECT c.id, c.certificate_type, c.title, c.file_name, c.file_data, c.mime_type, c.file_size, c.uploaded_at,
             i.name as institution_name, i.aicte_code
      FROM student_certificates c
      JOIN institutions i ON c.institution_id = i.id
      WHERE c.student_id = $1
      ORDER BY c.uploaded_at DESC
    `, [student.id]);

    return reply.send({
      student,
      certificates: certRes.rows
    });
  });
};
