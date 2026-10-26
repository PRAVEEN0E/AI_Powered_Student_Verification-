import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  console.log('--- Ensuring Programs and Real Test Data for All 50 Institutions ---');

  // 1. Get all institutions without programs
  const instRes = await pool.query(`
    SELECT i.id, i.name 
    FROM institutions i
    LEFT JOIN academic_programs p ON i.id = p.institution_id
    WHERE p.id IS NULL
  `);

  console.log(`Found ${instRes.rows.length} institutions without programs. Adding core engineering programs...`);

  for (const inst of instRes.rows) {
    const programs = [
      { name: 'B.Tech Computer Science & Engineering', code: 'CSE', approved: 120, super: 12, nri: 6 },
      { name: 'B.Tech Electronics & Communication', code: 'ECE', approved: 120, super: 12, nri: 6 },
      { name: 'B.Tech Information Technology', code: 'IT', approved: 60, super: 6, nri: 3 },
      { name: 'B.Tech Mechanical Engineering', code: 'MECH', approved: 60, super: 6, nri: 3 }
    ];

    for (const p of programs) {
      await pool.query(
        `INSERT INTO academic_programs (institution_id, program_name, program_code, degree_level, academic_year, approved_intake, supernumerary_intake, nri_quota)
         VALUES ($1, $2, $3, 'UG', '2025-2026', $4, $5, $6)`,
        [inst.id, p.name, p.code, p.approved, p.super, p.nri]
      );
    }
  }

  // 2. Ensure student 987654321012 exists (the default demo student)
  const kecRes = await pool.query(`SELECT id FROM institutions WHERE name LIKE '%Kongu%' LIMIT 1`);
  const kecId = kecRes.rows[0]?.id;

  if (kecId) {
    const progRes = await pool.query(`SELECT id FROM academic_programs WHERE institution_id = $1 LIMIT 1`, [kecId]);
    const progId = progRes.rows[0]?.id;

    // Check if student exists
    const stuCheck = await pool.query(`SELECT id FROM students WHERE apaar_id = '987654321012'`);
    let studentId;
    if (stuCheck.rows.length === 0) {
      const insStu = await pool.query(
        `INSERT INTO students (apaar_id, abc_account_id, full_name, dob, gender, father_or_guardian_name, email, phone)
         VALUES ('987654321012', 'ABC-KEC-999', 'Pravin Kumar K', '2004-08-15', 'Male', 'Krishnan K', 'pravin.student@gmail.com', '9876543210')
         RETURNING id`
      );
      studentId = insStu.rows[0].id;
    } else {
      studentId = stuCheck.rows[0].id;
    }

    // Check enrollment
    const enrCheck = await pool.query(`SELECT id FROM enrollments WHERE student_id = $1`, [studentId]);
    if (enrCheck.rows.length === 0 && progId) {
      await pool.query(
        `INSERT INTO enrollments (student_id, institution_id, program_id, academic_year, roll_number, category, status, admission_date, cgpa)
         VALUES ($1, $2, $3, '2025-2026', '23ADR042', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 8.94)`,
        [studentId, kecId, progId]
      );
    }
  }

  // 3. Ensure student user exists in users table with Admin@1234
  const userCheck = await pool.query(`SELECT id FROM users WHERE email = 'pravin.student@gmail.com'`);
  if (userCheck.rows.length === 0) {
    const hash = '$2b$10$RqccgISJ4Uzz8PQTbmxSi.xiNkhMIiZgTr46JwGkoQw0opGFU1Lci';
    await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, institution_id, is_active)
       VALUES ('pravin.student@gmail.com', $1, 'Pravin Kumar K', 'STUDENT', $2, TRUE)`,
      [hash, kecId]
    );
  }

  console.log('Database enhanced successfully!');
  await pool.end();
}

run().catch(console.error);
