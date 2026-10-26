import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { pool } from '../config/db.js';

export const dashboardRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // 1. AICTE National-level Live Analytics
  app.get('/api/analytics/national', {
    preHandler: [(app as any).authenticate, (app as any).authorize(['AICTE_ADMIN'])]
  }, async (request, reply) => {
    // Total Institutions, Total Students, Active Enrollments
    const totals = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM institutions WHERE is_active = TRUE) as total_institutions,
        (SELECT COUNT(*) FROM students) as total_students,
        (SELECT COUNT(*) FROM enrollments WHERE status = 'ACTIVE') as active_enrollments,
        (SELECT COUNT(*) FROM verification_logs) as total_verifications
    `);

    // Category breakdown
    const categoryStats = await pool.query(`
      SELECT category, COUNT(*) as count
      FROM enrollments
      WHERE status = 'ACTIVE'
      GROUP BY category
    `);

    // State-wise institution & enrollment distribution
    const stateStats = await pool.query(`
      SELECT i.state, COUNT(DISTINCT i.id) as institutions_count, COUNT(e.id) as enrollments_count
      FROM institutions i
      LEFT JOIN enrollments e ON i.id = e.institution_id AND e.status = 'ACTIVE'
      GROUP BY i.state
      ORDER BY enrollments_count DESC
      LIMIT 10
    `);

    // Quota utilization and excess capacity alerts
    const quotaAlerts = await pool.query(`
      SELECT 
        i.name as institution_name,
        p.program_name,
        p.academic_year,
        p.approved_intake,
        COUNT(e.id) as actual_enrollment,
        ROUND((COUNT(e.id)::numeric / p.approved_intake::numeric) * 100, 1) as utilization_pct
      FROM academic_programs p
      JOIN institutions i ON p.institution_id = i.id
      LEFT JOIN enrollments e ON p.id = e.program_id AND e.status = 'ACTIVE' AND e.category = 'APPROVED_INTAKE'
      GROUP BY i.name, p.program_name, p.academic_year, p.approved_intake
      HAVING COUNT(e.id) > p.approved_intake * 0.9
      ORDER BY utilization_pct DESC
      LIMIT 15
    `);

    // AI / Intelligent Anomaly & Ghost Student Detection Engine
    const anomalyChecks = await pool.query(`
      SELECT 
        i.name as institution_name,
        i.aicte_code,
        p.program_name,
        p.approved_intake,
        COUNT(e.id) as enrolled_count,
        COUNT(c.id) as certificates_count,
        ROUND((COUNT(e.id)::numeric / p.approved_intake::numeric) * 100, 1) as utilization_pct
      FROM academic_programs p
      JOIN institutions i ON p.institution_id = i.id
      LEFT JOIN enrollments e ON p.id = e.program_id AND e.status = 'ACTIVE'
      LEFT JOIN student_certificates c ON e.student_id = c.student_id
      GROUP BY i.name, i.aicte_code, p.program_name, p.approved_intake
      HAVING COUNT(e.id) > p.approved_intake OR (COUNT(e.id) > 10 AND COUNT(c.id) = 0)
      LIMIT 10
    `).catch(() => ({ rows: [] }));

    const aiAnomalies = anomalyChecks.rows.map((row: any) => {
      let riskLevel = 'MEDIUM';
      let reason = 'Audit Check Flagged';

      if (Number(row.enrolled_count) > Number(row.approved_intake)) {
        riskLevel = 'HIGH';
        reason = `Excess Admissions: Enrolled ${row.enrolled_count} students against ${row.approved_intake} approved intake (+${Number(row.enrolled_count) - Number(row.approved_intake)} quota violation)`;
      } else if (Number(row.enrolled_count) >= 10 && Number(row.certificates_count) === 0) {
        riskLevel = 'CRITICAL';
        reason = `Potential Ghost Enrollment: ${row.enrolled_count} active students recorded with 0 verified academic certificates in vault`;
      }

      return {
        institutionName: row.institution_name,
        aicteCode: row.aicte_code,
        programName: row.program_name,
        enrolledCount: Number(row.enrolled_count),
        approvedIntake: Number(row.approved_intake),
        riskLevel,
        reason,
        timestamp: new Date().toISOString()
      };
    });

    return reply.send({
      overview: totals.rows[0],
      categoryDistribution: categoryStats.rows,
      stateDistribution: stateStats.rows,
      quotaUtilizationAlerts: quotaAlerts.rows,
      aiAnomalies
    });
  });

  // 1.1 AICTE Official Regulatory & Accreditation CSV Export (Requirement 9)
  app.get('/api/reports/compliance-export', {
    preHandler: [(app as any).authenticate, (app as any).authorize(['AICTE_ADMIN'])]
  }, async (request, reply) => {
    const quotaAlerts = await pool.query(`
      SELECT 
        i.name as institution_name,
        i.aicte_code,
        i.state,
        p.program_name,
        p.program_code,
        p.academic_year,
        p.approved_intake,
        p.supernumerary_intake,
        p.nri_quota,
        COUNT(CASE WHEN e.category = 'APPROVED_INTAKE' THEN 1 END) as approved_enrolled,
        COUNT(CASE WHEN e.category IN ('SUPERNUMERARY', 'TFW', 'EWS') THEN 1 END) as supernumerary_enrolled,
        COUNT(CASE WHEN e.category IN ('NRI', 'OCI', 'FOREIGN_NATIONAL') THEN 1 END) as nri_enrolled,
        COUNT(e.id) as total_enrolled,
        ROUND((COUNT(e.id)::numeric / p.approved_intake::numeric) * 100, 1) as utilization_pct
      FROM academic_programs p
      JOIN institutions i ON p.institution_id = i.id
      LEFT JOIN enrollments e ON p.id = e.program_id AND e.status = 'ACTIVE'
      GROUP BY i.name, i.aicte_code, i.state, p.program_name, p.program_code, p.academic_year, p.approved_intake, p.supernumerary_intake, p.nri_quota
      ORDER BY i.name, p.program_name
    `);

    // Build CSV content
    const headers = [
      'Institution Name', 'AICTE Code', 'State', 'Program', 'Academic Year',
      'Approved Intake', 'Supernumerary Quota', 'Approved Enrolled', 'Supernumerary Enrolled',
      'Total Enrolled', 'Capacity Utilization (%)', 'Compliance Status'
    ];

    const csvRows = [headers.join(',')];

    for (const r of quotaAlerts.rows) {
      const status = Number(r.utilization_pct) > 100 ? 'EXCEEDED (SANCTION REQUIRED)' : 'COMPLIANT';
      const row = [
        `"${r.institution_name}"`,
        `"${r.aicte_code}"`,
        `"${r.state}"`,
        `"${r.program_name}"`,
        `"${r.academic_year}"`,
        r.approved_intake,
        r.supernumerary_intake,
        r.approved_enrolled,
        r.supernumerary_enrolled,
        r.total_enrolled,
        `${r.utilization_pct}%`,
        `"${status}"`
      ];
      csvRows.push(row.join(','));
    }

    const csvData = csvRows.join('\n');
    const filename = `AICTE-Regulatory-Compliance-Report-${new Date().toISOString().slice(0, 10)}.csv`;

    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', `attachment; filename="${filename}"`);
    return reply.send(csvData);
  });

  // 2. College Admin Institutional Analytics
  app.get('/api/analytics/institution', {
    preHandler: [(app as any).authenticate, (app as any).authorize(['COLLEGE_ADMIN'])]
  }, async (request: any, reply) => {
    const institutionId = request.user.institutionId;

    // Department-wise Intake vs Actual Enrollment
    const deptStats = await pool.query(`
      SELECT 
        p.id as program_id,
        p.program_name,
        p.program_code,
        p.academic_year,
        p.approved_intake,
        p.supernumerary_intake,
        p.nri_quota,
        COUNT(CASE WHEN e.category = 'APPROVED_INTAKE' THEN 1 END) as approved_admitted,
        COUNT(CASE WHEN e.category IN ('SUPERNUMERARY', 'TFW', 'EWS') THEN 1 END) as supernumerary_admitted,
        COUNT(CASE WHEN e.category IN ('NRI', 'OCI', 'FOREIGN_NATIONAL') THEN 1 END) as nri_admitted,
        COUNT(e.id) as total_admitted
      FROM academic_programs p
      LEFT JOIN enrollments e ON p.id = e.program_id AND e.status = 'ACTIVE'
      WHERE p.institution_id = $1
      GROUP BY p.id, p.program_name, p.program_code, p.academic_year, p.approved_intake, p.supernumerary_intake, p.nri_quota
      ORDER BY p.program_name
    `, [institutionId]);

    return reply.send({
      departments: deptStats.rows
    });
  });
};
