import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { pool, redis } from '../config/db.js';
import csv from 'csv-parser';
import { Readable } from 'stream';

interface StudentAdmissionInput {
  apaarId: string;
  fullName: string;
  dob: string;
  gender: string;
  fatherOrGuardianName?: string;
  email?: string;
  phone?: string;
  abcAccountId?: string;
  programId: string;
  academicYear: string;
  rollNumber: string;
  category: 'APPROVED_INTAKE' | 'SUPERNUMERARY' | 'NRI' | 'OCI' | 'FOREIGN_NATIONAL' | 'TFW' | 'EWS';
}

export const studentRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // 1. Single Student Registration with Automated Compliance Engine
  app.post<{ Body: StudentAdmissionInput }>('/api/students/register', {
    preHandler: [(app as any).authenticate, (app as any).authorize(['COLLEGE_ADMIN', 'AICTE_ADMIN'])],
    schema: {
      body: {
        type: 'object',
        required: ['apaarId', 'fullName', 'dob', 'gender', 'programId', 'academicYear', 'rollNumber', 'category'],
        properties: {
          apaarId: { type: 'string', pattern: '^[0-9]{12}$' },
          fullName: { type: 'string', minLength: 2 },
          dob: { type: 'string', format: 'date' },
          gender: { type: 'string' },
          fatherOrGuardianName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          abcAccountId: { type: 'string' },
          programId: { type: 'string' },
          academicYear: { type: 'string' },
          rollNumber: { type: 'string' },
          category: {
            type: 'string',
            enum: ['APPROVED_INTAKE', 'SUPERNUMERARY', 'NRI', 'OCI', 'FOREIGN_NATIONAL', 'TFW', 'EWS']
          }
        }
      }
    }
  }, async (request: any, reply) => {
    const institutionId = request.user.institutionId;
    if (!institutionId && request.user.role !== 'AICTE_ADMIN') {
      return reply.status(403).send({ error: 'Forbidden', message: 'No institution associated with this admin' });
    }

    const {
      apaarId, fullName, dob, gender, fatherOrGuardianName,
      email, phone, abcAccountId, programId, academicYear,
      rollNumber, category
    } = request.body;

    const lockKey = `lock:enrollment:${apaarId}`;
    let lockAcquired = false;

    try {
      if (redis.status === 'ready') {
        const res = await redis.set(lockKey, 'locked', 'PX', 5000, 'NX');
        if (!res) {
          return reply.status(429).send({
            error: 'Conflict',
            message: 'Enrollment process for this APAAR ID is currently being processed elsewhere. Try again shortly.'
          });
        }
        lockAcquired = true;
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Validate Approved Program & Intake Capacity
        const progRes = await client.query(
          `SELECT approved_intake, supernumerary_intake, nri_quota, program_name
           FROM academic_programs
           WHERE id = $1 AND institution_id = $2 AND academic_year = $3 FOR UPDATE`,
          [programId, institutionId, academicYear]
        );

        if (progRes.rows.length === 0) {
          await client.query('ROLLBACK');
          return reply.status(404).send({
            error: 'Not Found',
            message: 'Academic program not found or unapproved for this institution in this academic year.'
          });
        }

        const program = progRes.rows[0];

        // Count current active admissions by category
        const countRes = await client.query(
          `SELECT category, COUNT(*) as count
           FROM enrollments
           WHERE program_id = $1 AND academic_year = $2 AND status = 'ACTIVE'
           GROUP BY category`,
          [programId, academicYear]
        );

        let currentApprovedCount = 0;
        let currentSupernumeraryCount = 0;
        let currentNriCount = 0;

        for (const row of countRes.rows) {
          if (row.category === 'APPROVED_INTAKE') currentApprovedCount = parseInt(row.count, 10);
          if (row.category === 'SUPERNUMERARY' || row.category === 'TFW' || row.category === 'EWS') {
            currentSupernumeraryCount += parseInt(row.count, 10);
          }
          if (row.category === 'NRI' || row.category === 'OCI' || row.category === 'FOREIGN_NATIONAL') {
            currentNriCount += parseInt(row.count, 10);
          }
        }

        // Compliance checks against quota
        if (category === 'APPROVED_INTAKE' && currentApprovedCount >= program.approved_intake) {
          await client.query('ROLLBACK');
          return reply.status(400).send({
            error: 'Intake Limit Exceeded',
            message: `Approved intake quota limit (${program.approved_intake}) reached for ${program.program_name}. Admission rejected.`
          });
        }

        if (
          (category === 'SUPERNUMERARY' || category === 'TFW' || category === 'EWS') &&
          currentSupernumeraryCount >= (program.supernumerary_intake || 0)
        ) {
          await client.query('ROLLBACK');
          return reply.status(400).send({
            error: 'Intake Limit Exceeded',
            message: `Supernumerary quota limit (${program.supernumerary_intake}) reached for this program.`
          });
        }

        // Verify Cross-Institution Duplicate Active Enrollment
        const dupCheck = await client.query(
          `SELECT e.id, i.name as institution_name, e.academic_year, e.status
           FROM enrollments e
           JOIN students s ON e.student_id = s.id
           JOIN institutions i ON e.institution_id = i.id
           WHERE s.apaar_id = $1 AND e.status = 'ACTIVE'`,
          [apaarId]
        );

        if (dupCheck.rows.length > 0) {
          await client.query('ROLLBACK');
          const existing = dupCheck.rows[0];
          return reply.status(409).send({
            error: 'Duplicate Enrollment Violation',
            message: `Student with APAAR ID ${apaarId} is already actively enrolled in ${existing.institution_name} (${existing.academic_year}). Simultaneous enrollment is strictly prohibited by AICTE norms.`
          });
        }

        let studentId: string;
        const studentExist = await client.query(
          'SELECT id FROM students WHERE apaar_id = $1',
          [apaarId]
        );

        if (studentExist.rows.length > 0) {
          studentId = studentExist.rows[0].id;
        } else {
          const newStudent = await client.query(
            `INSERT INTO students (apaar_id, full_name, dob, gender, father_or_guardian_name, email, phone, abc_account_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            [apaarId, fullName, dob, gender, fatherOrGuardianName || null, email || null, phone || null, abcAccountId || null]
          );
          studentId = newStudent.rows[0].id;
        }

        const enrollment = await client.query(
          `INSERT INTO enrollments (student_id, institution_id, program_id, academic_year, roll_number, category, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE')
           RETURNING id, student_id, institution_id, program_id, academic_year, roll_number, category, status, admission_date`,
          [studentId, institutionId, programId, academicYear, rollNumber, category]
        );

        await client.query('COMMIT');

        return reply.status(201).send({
          message: 'Student admitted and verified successfully',
          enrollment: enrollment.rows[0]
        });
      } catch (err: any) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } finally {
      if (lockAcquired && redis.status === 'ready') {
        await redis.del(lockKey).catch(() => {});
      }
    }
  });

  // 2. Real CSV Bulk Upload with Transactional Processing & Row-Level Error Reports
  app.post('/api/students/bulk-upload', {
    preHandler: [(app as any).authenticate, (app as any).authorize(['COLLEGE_ADMIN', 'AICTE_ADMIN'])]
  }, async (request: any, reply) => {
    const institutionId = request.user.institutionId;
    if (!institutionId && request.user.role !== 'AICTE_ADMIN') {
      return reply.status(403).send({ error: 'Forbidden', message: 'No institution associated with this admin' });
    }

    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'Bad Request', message: 'CSV file is required' });
    }

    const buffer = await data.toBuffer();
    const rows: any[] = [];

    // Parse CSV buffer
    await new Promise((resolve, reject) => {
      Readable.from(buffer)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    if (rows.length === 0) {
      return reply.status(400).send({ error: 'Bad Request', message: 'Uploaded CSV file contains no data rows.' });
    }

    const successfulRows: any[] = [];
    const errorReports: Array<{ row: number; apaarId?: string; error: string }> = [];

    const client = await pool.connect();
    try {
      let rowIndex = 1;
      for (const row of rows) {
        rowIndex++;
        const apaarId = (row.apaarId || row.apaar_id || '').trim();
        const fullName = (row.fullName || row.full_name || '').trim();
        const dob = (row.dob || '').trim();
        const gender = (row.gender || '').trim();
        const rollNumber = (row.rollNumber || row.roll_number || '').trim();
        const programId = (row.programId || row.program_id || '').trim();
        const academicYear = (row.academicYear || row.academic_year || '2026-2027').trim();
        const category = (row.category || 'APPROVED_INTAKE').trim();

        // 1. Format Validation: 12-digit numeric APAAR check
        if (!/^\d{12}$/.test(apaarId)) {
          errorReports.push({
            row: rowIndex,
            apaarId,
            error: 'Invalid APAAR ID: Must be exactly 12 numeric digits.'
          });
          continue;
        }

        if (!fullName || !dob || !rollNumber || !programId) {
          errorReports.push({
            row: rowIndex,
            apaarId,
            error: 'Missing required fields (fullName, dob, rollNumber, or programId).'
          });
          continue;
        }

        // 2. Cross-Institution Duplicate Check
        const dupRes = await client.query(
          `SELECT i.name as institution_name
           FROM enrollments e
           JOIN students s ON e.student_id = s.id
           JOIN institutions i ON e.institution_id = i.id
           WHERE s.apaar_id = $1 AND e.status = 'ACTIVE'`,
          [apaarId]
        );

        if (dupRes.rows.length > 0) {
          errorReports.push({
            row: rowIndex,
            apaarId,
            error: `Cross-Institution Conflict: Already actively enrolled in ${dupRes.rows[0].institution_name}.`
          });
          continue;
        }

        // 3. Insert or Find Student
        try {
          await client.query('BEGIN');
          let studentId: string;
          const sRes = await client.query('SELECT id FROM students WHERE apaar_id = $1', [apaarId]);
          if (sRes.rows.length > 0) {
            studentId = sRes.rows[0].id;
          } else {
            const insRes = await client.query(
              `INSERT INTO students (apaar_id, full_name, dob, gender)
               VALUES ($1, $2, $3, $4) RETURNING id`,
              [apaarId, fullName, dob, gender]
            );
            studentId = insRes.rows[0].id;
          }

          // Insert enrollment
          await client.query(
            `INSERT INTO enrollments (student_id, institution_id, program_id, academic_year, roll_number, category, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE')`,
            [studentId, institutionId, programId, academicYear, rollNumber, category]
          );

          await client.query('COMMIT');
          successfulRows.push({ row: rowIndex, apaarId, fullName, rollNumber });
        } catch (dbErr: any) {
          await client.query('ROLLBACK');
          errorReports.push({
            row: rowIndex,
            apaarId,
            error: `Database rejection: ${dbErr.message}`
          });
        }
      }

      // Record audit log
      await client.query(
        `INSERT INTO bulk_upload_logs (institution_id, uploaded_by, file_name, total_records, successful_records, failed_records, error_summary)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          institutionId,
          request.user.id,
          data.filename,
          rows.length,
          successfulRows.length,
          errorReports.length,
          JSON.stringify(errorReports)
        ]
      ).catch(() => {});

      return reply.send({
        message: 'Bulk enrollment file processed',
        summary: {
          fileName: data.filename,
          totalRecords: rows.length,
          admittedCount: successfulRows.length,
          rejectedCount: errorReports.length,
          complianceRate: `${((successfulRows.length / rows.length) * 100).toFixed(1)}%`
        },
        errors: errorReports
      });
    } finally {
      client.release();
    }
  });

  // 3. Institutional Student Directory with Filtering & Quota Tracking
  app.get('/api/students', {
    preHandler: [(app as any).authenticate]
  }, async (request: any, reply) => {
    const institutionId = request.user.institutionId;
    const { programId, academicYear, category, search } = request.query as any;

    let query = `
      SELECT s.id as student_id, s.apaar_id, s.full_name, s.dob, s.gender, s.email, s.phone,
             e.id as enrollment_id, e.roll_number, e.category, e.status, e.admission_date,
             p.program_name, p.program_code, i.name as institution_name
      FROM enrollments e
      JOIN students s ON e.student_id = s.id
      JOIN academic_programs p ON e.program_id = p.id
      JOIN institutions i ON e.institution_id = i.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Enforce data isolation between institutions
    if (request.user.role === 'COLLEGE_ADMIN') {
      params.push(institutionId);
      query += ` AND e.institution_id = $${params.length}`;
    }

    if (programId) {
      params.push(programId);
      query += ` AND e.program_id = $${params.length}`;
    }

    if (academicYear) {
      params.push(academicYear);
      query += ` AND e.academic_year = $${params.length}`;
    }

    if (category) {
      params.push(category);
      query += ` AND e.category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (s.full_name ILIKE $${params.length} OR s.apaar_id ILIKE $${params.length} OR e.roll_number ILIKE $${params.length})`;
    }

    query += ' ORDER BY e.created_at DESC LIMIT 100';

    const result = await pool.query(query, params);
    return reply.send({ students: result.rows, total: result.rows.length });
  });
};
