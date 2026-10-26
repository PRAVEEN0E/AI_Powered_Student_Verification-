import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  const seedSql = readFileSync(join(__dirname, '../../database/seed.sql'), 'utf-8');
  const client = await pool.connect();
  try {
    console.log('🌱 Starting database seed...');
    await client.query('BEGIN');
    await client.query(seedSql);
    await client.query('COMMIT');
    console.log('✅ Database seeded successfully!');
    
    // Verify counts
    const counts = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM institutions) as institutions,
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM academic_programs) as programs,
        (SELECT COUNT(*) FROM students) as students,
        (SELECT COUNT(*) FROM enrollments) as enrollments,
        (SELECT COUNT(*) FROM verification_logs) as verifications
    `);
    console.log('\n📊 Database Summary:');
    console.table(counts.rows[0]);
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err?.message ?? err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
