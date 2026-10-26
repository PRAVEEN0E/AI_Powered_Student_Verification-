import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { pool } from '../config/db.js';

export const institutionRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // 1. List all AICTE approved institutions with search & filtering
  app.get('/api/institutions', async (request: any, reply) => {
    const { search, state, limit = 100, offset = 0 } = request.query as any;

    let query = `
      SELECT 
        i.id,
        i.aicte_code,
        i.name,
        i.state,
        i.district,
        i.address,
        i.contact_email,
        i.contact_phone,
        i.is_active,
        COUNT(p.id) as programs_count
      FROM institutions i
      LEFT JOIN academic_programs p ON i.id = p.institution_id
      WHERE i.is_active = TRUE
    `;
    const params: any[] = [];

    if (search) {
      params.push(`%${search.trim()}%`);
      query += ` AND (i.name ILIKE $${params.length} OR i.aicte_code ILIKE $${params.length} OR i.district ILIKE $${params.length})`;
    }

    if (state) {
      params.push(state.trim());
      query += ` AND i.state = $${params.length}`;
    }

    query += `
      GROUP BY i.id, i.aicte_code, i.name, i.state, i.district, i.address, i.contact_email, i.contact_phone, i.is_active
      ORDER BY i.name ASC
    `;

    params.push(Math.min(Number(limit) || 100, 500));
    query += ` LIMIT $${params.length}`;

    params.push(Number(offset) || 0);
    query += ` OFFSET $${params.length}`;

    const result = await pool.query(query, params);

    const totalCountRes = await pool.query(`SELECT COUNT(*) FROM institutions WHERE is_active = TRUE`);

    return reply.send({
      total: Number(totalCountRes.rows[0].count),
      count: result.rows.length,
      institutions: result.rows
    });
  });

  // 2. Get Single Institution with its Academic Programs
  app.get('/api/institutions/:id', async (request: any, reply) => {
    const { id } = request.params;

    const instRes = await pool.query(
      `SELECT id, aicte_code, name, state, district, address, contact_email, contact_phone, is_active
       FROM institutions WHERE id = $1`,
      [id]
    );

    if (instRes.rows.length === 0) {
      return reply.status(404).send({ error: 'Not Found', message: 'Institution not found.' });
    }

    const progRes = await pool.query(
      `SELECT id, program_name, program_code, degree_level, academic_year, approved_intake, supernumerary_intake, nri_quota
       FROM academic_programs
       WHERE institution_id = $1
       ORDER BY program_name ASC`,
      [id]
    );

    return reply.send({
      institution: instRes.rows[0],
      programs: progRes.rows
    });
  });

  // 3. Get Programs for a specific institution
  app.get('/api/institutions/:id/programs', async (request: any, reply) => {
    const { id } = request.params;

    const progRes = await pool.query(
      `SELECT id, program_name, program_code, degree_level, academic_year, approved_intake, supernumerary_intake, nri_quota
       FROM academic_programs
       WHERE institution_id = $1
       ORDER BY program_name ASC`,
      [id]
    );

    return reply.send({
      programs: progRes.rows
    });
  });
};
