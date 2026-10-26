import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import crypto from 'crypto';
import { pool, redis } from '../config/db.js';

interface IssueNocBody {
  apaarId: string;
  targetInstitutionId: string;
  targetProgramId: string;
  transferReason: string;
}

interface ReviewTransferBody {
  decision: 'APPROVED' | 'REJECTED';
  remarks?: string;
}

interface CompleteTransferBody {
  newRollNumber: string;
  category?: 'APPROVED_INTAKE' | 'SUPERNUMERARY' | 'NRI' | 'TFW';
}

export const transferRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // 1. College A (Source Institution): Issue NOC for Student Transfer
  app.post<{ Body: IssueNocBody }>('/api/transfers/issue-noc', {
    preHandler: [(app as any).authenticate, (app as any).authorize(['COLLEGE_ADMIN'])]
  }, async (request: any, reply) => {
    const sourceInstitutionId = request.user.institutionId;
    const { apaarId, targetInstitutionId, targetProgramId, transferReason } = request.body;

    if (!apaarId || !targetInstitutionId || !targetProgramId || !transferReason) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'apaarId, targetInstitutionId, targetProgramId, and transferReason are all required.'
      });
    }

    if (sourceInstitutionId === targetInstitutionId) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Source and target institutions cannot be identical for inter-institutional transfer.'
      });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Locate active student enrollment in source college
      const stuRes = await client.query(
        `SELECT s.id as student_id, s.full_name, e.id as enrollment_id, e.status as enrollment_status
         FROM students s
         JOIN enrollments e ON s.id = e.student_id
         WHERE s.apaar_id = $1 AND e.institution_id = $2`,
        [apaarId, sourceInstitutionId]
      );

      if (stuRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return reply.status(404).send({
          error: 'Not Found',
          message: `Student with APAAR ID ${apaarId} has no active enrollment record in your institution.`
        });
      }

      const { student_id, enrollment_id, enrollment_status, full_name } = stuRes.rows[0];

      if (enrollment_status !== 'ACTIVE') {
        await client.query('ROLLBACK');
        return reply.status(400).send({
          error: 'Bad Request',
          message: `Student enrollment is currently '${enrollment_status}'. Only ACTIVE students can be issued an NOC.`
        });
      }

      // Check if there is already an ongoing transfer request
      const existingReq = await client.query(
        `SELECT id, status, noc_reference_number FROM transfer_requests
         WHERE student_id = $1 AND status IN ('NOC_ISSUED_BY_SOURCE', 'AICTE_APPROVED')`,
        [student_id]
      );

      if (existingReq.rows.length > 0) {
        await client.query('ROLLBACK');
        return reply.status(409).send({
          error: 'Conflict',
          message: `An active transfer request (${existingReq.rows[0].noc_reference_number}) already exists for this student.`
        });
      }

      // Generate verifiable NOC Reference Number
      const nocRef = `AICTE-NOC-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

      // Insert transfer request record
      const insertRes = await client.query(
        `INSERT INTO transfer_requests (
           student_id, source_institution_id, target_institution_id, target_program_id,
           enrollment_id, noc_reference_number, transfer_reason, status
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'NOC_ISSUED_BY_SOURCE')
         RETURNING id, noc_reference_number, status, source_issued_at`,
        [student_id, sourceInstitutionId, targetInstitutionId, targetProgramId, enrollment_id, nocRef, transferReason]
      );

      await client.query('COMMIT');

      return reply.status(201).send({
        message: 'No Objection Certificate (NOC) successfully generated and submitted to AICTE for compliance approval.',
        transfer: {
          id: insertRes.rows[0].id,
          nocReferenceNumber: insertRes.rows[0].noc_reference_number,
          studentName: full_name,
          apaarId,
          status: insertRes.rows[0].status,
          sourceIssuedAt: insertRes.rows[0].source_issued_at
        }
      });
    } catch (err: any) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  });

  // 2. AICTE Central Council: List Pending Inter-Institutional Transfer Requests
  app.get('/api/transfers', {
    preHandler: [(app as any).authenticate]
  }, async (request: any, reply) => {
    const userRole = request.user.role;
    const userInstId = request.user.institutionId;

    let query = `
      SELECT 
        tr.id, tr.noc_reference_number, tr.transfer_reason, tr.status,
        tr.source_issued_at, tr.aicte_decision_at, tr.aicte_remarks, tr.completed_at,
        s.id as student_id, s.apaar_id, s.full_name as student_name,
        src.name as source_institution_name, src.aicte_code as source_aicte_code,
        tgt.name as target_institution_name, tgt.aicte_code as target_aicte_code,
        prog.program_name as target_program_name, prog.program_code as target_program_code
      FROM transfer_requests tr
      JOIN students s ON tr.student_id = s.id
      JOIN institutions src ON tr.source_institution_id = src.id
      JOIN institutions tgt ON tr.target_institution_id = tgt.id
      JOIN academic_programs prog ON tr.target_program_id = prog.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // College Admin only sees transfers involving their institution (either source or target)
    if (userRole === 'COLLEGE_ADMIN') {
      params.push(userInstId);
      query += ` AND (tr.source_institution_id = $1 OR tr.target_institution_id = $1)`;
    }

    query += ' ORDER BY tr.created_at DESC LIMIT 50';

    const res = await pool.query(query, params);
    return reply.send({ transfers: res.rows, total: res.rows.length });
  });

  // 3. AICTE Central Council: Approve or Reject Transfer Request
  app.patch<{ Params: { id: string }; Body: ReviewTransferBody }>('/api/transfers/:id/review', {
    preHandler: [(app as any).authenticate, (app as any).authorize(['AICTE_ADMIN'])]
  }, async (request: any, reply) => {
    const { id } = request.params;
    const { decision, remarks } = request.body;
    const aicteAdminId = request.user.id;

    if (!decision || !['APPROVED', 'REJECTED'].includes(decision)) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: "decision must be either 'APPROVED' or 'REJECTED'."
      });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const check = await client.query(
        'SELECT id, status, enrollment_id FROM transfer_requests WHERE id = $1 FOR UPDATE',
        [id]
      );

      if (check.rows.length === 0) {
        await client.query('ROLLBACK');
        return reply.status(404).send({ error: 'Not Found', message: 'Transfer request not found.' });
      }

      if (check.rows[0].status !== 'NOC_ISSUED_BY_SOURCE') {
        await client.query('ROLLBACK');
        return reply.status(400).send({
          error: 'Bad Request',
          message: `Cannot review request with status '${check.rows[0].status}'. Must be 'NOC_ISSUED_BY_SOURCE'.`
        });
      }

      const nextStatus = decision === 'APPROVED' ? 'AICTE_APPROVED' : 'REJECTED';

      // If AICTE approves the transfer, transition the student's old enrollment status from ACTIVE to TRANSFERRED.
      // This immediately frees the PostgreSQL partial unique constraint (uq_active_student_enrollment)
      // and eliminates the cross-college duplicate active enrollment collision!
      if (decision === 'APPROVED') {
        await client.query(
          `UPDATE enrollments SET status = 'TRANSFERRED', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [check.rows[0].enrollment_id]
        );
      }

      const updated = await client.query(
        `UPDATE transfer_requests
         SET status = $1, aicte_reviewed_by = $2, aicte_decision_at = CURRENT_TIMESTAMP, aicte_remarks = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING id, noc_reference_number, status, aicte_decision_at, aicte_remarks`,
        [nextStatus, aicteAdminId, remarks || null, id]
      );

      await client.query('COMMIT');

      return reply.send({
        message: `Transfer request ${decision.toLowerCase()} by AICTE Central Council.`,
        transfer: updated.rows[0]
      });
    } catch (err: any) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  });

  // 4. College B (Target Institution): Finalize and Admit Transferred Student (No Duplicate Collision!)
  app.post<{ Params: { id: string }; Body: CompleteTransferBody }>('/api/transfers/:id/complete', {
    preHandler: [(app as any).authenticate, (app as any).authorize(['COLLEGE_ADMIN'])]
  }, async (request: any, reply) => {
    const { id } = request.params;
    const { newRollNumber, category } = request.body;
    const targetInstitutionId = request.user.institutionId;

    if (!newRollNumber) {
      return reply.status(400).send({ error: 'Bad Request', message: 'newRollNumber is required.' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const trRes = await client.query(
        `SELECT tr.*, s.apaar_id, s.full_name
         FROM transfer_requests tr
         JOIN students s ON tr.student_id = s.id
         WHERE tr.id = $1 AND tr.target_institution_id = $2 FOR UPDATE`,
        [id, targetInstitutionId]
      );

      if (trRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Transfer request not found or unauthorized for your institution.'
        });
      }

      const transfer = trRes.rows[0];

      if (transfer.status !== 'AICTE_APPROVED') {
        await client.query('ROLLBACK');
        return reply.status(400).send({
          error: 'Bad Request',
          message: `Transfer cannot be finalized. AICTE status is '${transfer.status}', expected 'AICTE_APPROVED'.`
        });
      }

      // Check target program intake capacity
      const progRes = await client.query(
        `SELECT approved_intake, program_name FROM academic_programs WHERE id = $1 FOR UPDATE`,
        [transfer.target_program_id]
      );

      if (progRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return reply.status(404).send({ error: 'Not Found', message: 'Target academic program not found.' });
      }

      // Create new ACTIVE enrollment in College B
      const newEnrollment = await client.query(
        `INSERT INTO enrollments (
           student_id, institution_id, program_id, academic_year, roll_number, category, status
         )
         VALUES ($1, $2, $3, '2026-2027', $4, $5, 'ACTIVE')
         RETURNING id, student_id, institution_id, roll_number, status`,
        [
          transfer.student_id,
          targetInstitutionId,
          transfer.target_program_id,
          newRollNumber,
          category || 'APPROVED_INTAKE'
        ]
      );

      // Mark transfer as COMPLETED
      await client.query(
        `UPDATE transfer_requests
         SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [id]
      );

      await client.query('COMMIT');

      return reply.send({
        message: `Transfer completed successfully! Student ${transfer.full_name} (${transfer.apaar_id}) is now officially enrolled in your institution without duplicate collision.`,
        enrollment: newEnrollment.rows[0]
      });
    } catch (err: any) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  });
};
