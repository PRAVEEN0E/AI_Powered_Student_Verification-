import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';

interface RegisterBody {
  email: string;
  password: string;
  fullName: string;
  role: 'AICTE_ADMIN' | 'COLLEGE_ADMIN' | 'STUDENT' | 'VERIFIER';
  institutionId?: string;
  organizationName?: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export const authRoutes: FastifyPluginAsync = async (app: FastifyInstance) => {
  // 1. User Registration
  app.post<{ Body: RegisterBody }>('/api/auth/register', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password', 'fullName', 'role'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          fullName: { type: 'string', minLength: 2 },
          role: { type: 'string', enum: ['AICTE_ADMIN', 'COLLEGE_ADMIN', 'STUDENT', 'VERIFIER'] },
          institutionId: { type: 'string' },
          organizationName: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const { email, password, fullName, role, institutionId, organizationName } = request.body;

    // Check existing
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return reply.status(409).send({ error: 'Conflict', message: 'User with this email already exists' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // AICTE_ADMIN is root authority; COLLEGE_ADMIN and VERIFIER (Employer) require approval before activation
    const isActive = role === 'AICTE_ADMIN';

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, institution_id, organization_name, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, full_name, role, institution_id, organization_name, is_active, created_at`,
      [email, passwordHash, fullName, role, institutionId || null, organizationName || null, isActive]
    );

    const user = result.rows[0];

    return reply.status(201).send({
      message: isActive
        ? 'Registration successful! You can now log in.'
        : 'Registration submitted successfully! Your account is pending review & approval by AICTE National Admin. Once approved, you can log in.',
      requiresApproval: !isActive,
      user
    });
  });

  // 2. User Login
  app.post<{ Body: LoginBody }>('/api/auth/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const { email, password } = request.body;

    const result = await pool.query(
      `SELECT u.id, u.email, u.password_hash, u.full_name, u.role, u.institution_id, u.organization_name, u.is_active,
              i.name as institution_name, i.aicte_code
       FROM users u
       LEFT JOIN institutions i ON u.institution_id = i.id
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return reply.status(403).send({
        error: 'Pending Approval',
        message: 'Your registration is awaiting approval from AICTE National Admin. You will be able to log in once approved.'
      });
    }

    const token = app.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
      institutionId: user.institution_id,
      institutionName: user.institution_name,
      aicteCode: user.aicte_code
    });

    delete user.password_hash;
    let apaarId: string | undefined = undefined;
    if (user.role === 'STUDENT') {
      const stu = await pool.query('SELECT apaar_id FROM students WHERE email = $1', [user.email]);
      if (stu.rows.length > 0) {
        apaarId = stu.rows[0].apaar_id;
      }
    }

    const formattedUser = {
      ...user,
      fullName: user.full_name,
      institutionId: user.institution_id,
      institutionName: user.institution_name,
      aicteCode: user.aicte_code,
      organizationName: user.organization_name,
      apaarId
    };

    return reply.send({
      message: 'Login successful',
      token,
      user: formattedUser
    });
  });

  // 3. Current User Profile
  app.get('/api/auth/me', {
    preHandler: [(app as any).authenticate]
  }, async (request: any, reply) => {
    const userId = request.user.id;
    const result = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.role, u.institution_id, u.organization_name,
              i.name as institution_name, i.aicte_code
       FROM users u
       LEFT JOIN institutions i ON u.institution_id = i.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return reply.status(404).send({ error: 'User not found' });
    }

    return reply.send({ user: result.rows[0] });
  });

  // 4. List Pending Approvals (AICTE National Admin only)
  app.get('/api/auth/pending-approvals', {
    preHandler: [(app as any).authenticate, (app as any).authorize(['AICTE_ADMIN'])]
  }, async (request, reply) => {
    const result = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.role, u.organization_name, u.created_at,
              i.name as institution_name, i.aicte_code
       FROM users u
       LEFT JOIN institutions i ON u.institution_id = i.id
       WHERE u.is_active = FALSE
       ORDER BY u.created_at DESC`
    );
    return reply.send({ pendingUsers: result.rows });
  });

  // 5. Approve or Reject Pending User (AICTE National Admin only)
  app.patch<{ Params: { id: string }; Body: { action: 'APPROVE' | 'REJECT' } }>('/api/auth/pending-approvals/:id', {
    preHandler: [(app as any).authenticate, (app as any).authorize(['AICTE_ADMIN'])],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string' } }
      },
      body: {
        type: 'object',
        required: ['action'],
        properties: {
          action: { type: 'string', enum: ['APPROVE', 'REJECT'] }
        }
      }
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const { action } = request.body;

    if (action === 'APPROVE') {
      const res = await pool.query(
        `UPDATE users SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, email, full_name, role`,
        [id]
      );
      if (res.rows.length === 0) {
        return reply.status(404).send({ error: 'Not Found', message: 'User not found.' });
      }
      return reply.send({ message: `User ${res.rows[0].email} approved and activated successfully!`, user: res.rows[0] });
    } else {
      const res = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING id, email`, [id]);
      if (res.rows.length === 0) {
        return reply.status(404).send({ error: 'Not Found', message: 'User not found.' });
      }
      return reply.send({ message: `Registration for ${res.rows[0].email} rejected and removed.` });
    }
  });
};
