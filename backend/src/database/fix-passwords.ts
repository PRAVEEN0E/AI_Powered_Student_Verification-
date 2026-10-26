import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  const hash = '$2b$10$RqccgISJ4Uzz8PQTbmxSi.xiNkhMIiZgTr46JwGkoQw0opGFU1Lci';
  const res = await pool.query('UPDATE users SET password_hash = $1', [hash]);
  console.log('Successfully updated password hashes for users:', res.rowCount);
  const users = await pool.query('SELECT email, role, full_name FROM users');
  console.log('Users in DB:', users.rows);
  await pool.end();
}

run().catch(console.error);
