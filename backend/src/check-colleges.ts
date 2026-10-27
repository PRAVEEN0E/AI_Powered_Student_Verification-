import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const res = await pool.query("SELECT id, aicte_code, name, state FROM institutions WHERE name ILIKE '%Velalar%' OR name ILIKE '%Synthetic%' ORDER BY name");
  console.log('Results:', res.rows);
  await pool.end();
}

main().catch(console.error);
