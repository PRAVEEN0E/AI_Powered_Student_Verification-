import { pool } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('🔄 Connecting to PostgreSQL database...');
  const schemaPath = path.join(__dirname, '../../database/schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const client = await pool.connect();
  try {
    console.log('📦 Executing schema migrations...');
    await client.query(sql);
    console.log('✅ PostgreSQL Schema migrated successfully!');

    // Check if initial admin institutions and users exist, if not, create seed
    const instRes = await client.query('SELECT COUNT(*) FROM institutions');
    if (parseInt(instRes.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding initial AICTE institutions & academic programs...');
      
      const kec = await client.query(`
        INSERT INTO institutions (aicte_code, name, state, district, contact_email)
        VALUES ('1-432891901', 'Kongu Engineering College (Autonomous)', 'Tamil Nadu', 'Erode', 'principal@kec.edu')
        RETURNING id
      `);
      const kecId = kec.rows[0].id;

      const vcet = await client.query(`
        INSERT INTO institutions (aicte_code, name, state, district, contact_email)
        VALUES ('1-432899999', 'Velammal College of Engineering & Technology', 'Tamil Nadu', 'Madurai', 'principal@vcet.edu')
        RETURNING id
      `);
      const vcetId = vcet.rows[0].id;

      // Programs
      const cseProg = await client.query(`
        INSERT INTO academic_programs (institution_id, program_name, program_code, degree_level, academic_year, approved_intake, supernumerary_intake, nri_quota)
        VALUES ($1, 'B.Tech Computer Science & Engineering', 'CSE', 'UG', '2026-2027', 180, 18, 9)
        RETURNING id
      `, [kecId]);

      const itProg = await client.query(`
        INSERT INTO academic_programs (institution_id, program_name, program_code, degree_level, academic_year, approved_intake, supernumerary_intake, nri_quota)
        VALUES ($1, 'B.Tech Information Technology', 'IT', 'UG', '2026-2027', 120, 12, 6)
        RETURNING id
      `, [kecId]);

      // Seed a verified student with 987654321012
      const stu = await client.query(`
        INSERT INTO students (apaar_id, full_name, dob, gender, email, abc_account_id)
        VALUES ('987654321012', 'Ananya Ramesh', '2004-05-14', 'Female', 'ananya.ramesh@gmail.com', 'ABC-9921-2026')
        RETURNING id
      `);
      const stuId = stu.rows[0].id;

      await client.query(`
        INSERT INTO enrollments (student_id, institution_id, program_id, academic_year, roll_number, category, status, cgpa)
        VALUES ($1, $2, $3, '2026-2027', '23IT042', 'APPROVED_INTAKE', 'ACTIVE', 8.92)
      `, [stuId, kecId, itProg.rows[0].id]);

      console.log('✅ Demo seed records initialized in PostgreSQL!');
    } else {
      console.log(`ℹ️ Database already contains ${instRes.rows[0].count} institutions. Skipping seed.`);
    }
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
