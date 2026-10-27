import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function createVcetUser() {
  const client = await pool.connect();
  try {
    // 1. Get Velalar College Institution ID
    const instRes = await client.query("SELECT id FROM institutions WHERE name ILIKE '%Velalar%' LIMIT 1");
    if (instRes.rows.length === 0) {
      console.error('VCET institution not found!');
      return;
    }
    const instId = instRes.rows[0].id;

    // 2. Hash Pass@123
    const passwordHash = await bcrypt.hash('Pass@123', 10);

    // 3. Insert or update vcet@gmail.com
    const result = await client.query(`
      INSERT INTO users (
        email,
        password_hash,
        full_name,
        role,
        institution_id,
        is_active
      ) VALUES (
        'vcet@gmail.com',
        $1,
        'Velalar College Admin',
        'COLLEGE_ADMIN',
        $2,
        TRUE
      )
      ON CONFLICT (email) DO UPDATE SET
        password_hash = $1,
        role = 'COLLEGE_ADMIN',
        institution_id = $2,
        is_active = TRUE
      RETURNING id, email, role, full_name, is_active
    `, [passwordHash, instId]);

    console.log('✅ User successfully created/updated:', result.rows[0]);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

createVcetUser();
