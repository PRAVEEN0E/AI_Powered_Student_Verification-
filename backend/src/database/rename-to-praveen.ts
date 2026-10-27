import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function updateToPraveen() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      UPDATE students
      SET full_name = 'Praveen'
      WHERE apaar_id IN ('918675569147', '918675569148')
      RETURNING id, apaar_id, full_name;
    `);

    console.log('✅ Updated students to Praveen:', res.rows);
  } catch (err) {
    console.error('Error updating names:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

updateToPraveen();
