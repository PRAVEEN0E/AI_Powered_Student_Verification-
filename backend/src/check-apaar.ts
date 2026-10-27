import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function checkStudents() {
  try {
    const res = await pool.query(`
      SELECT 
        s.id as student_id,
        s.apaar_id,
        s.full_name,
        s.email,
        e.id as enrollment_id,
        e.institution_id,
        i.name as institution_name,
        p.program_name,
        e.status as enrollment_status,
        e.academic_year
      FROM students s
      LEFT JOIN enrollments e ON s.id = e.student_id
      LEFT JOIN institutions i ON e.institution_id = i.id
      LEFT JOIN academic_programs p ON e.program_id = p.id
      WHERE s.apaar_id IN ('918675569147', '918675569148')
    `);

    console.log('--- FOUND STUDENTS ---');
    console.log(JSON.stringify(res.rows, null, 2));

    if (res.rows.length === 0) {
      console.log('No students found with those APAAR IDs. Checking recent students:');
      const recent = await pool.query(`
        SELECT s.id, s.apaar_id, s.full_name, s.created_at, e.institution_id, i.name as inst_name
        FROM students s
        LEFT JOIN enrollments e ON s.id = e.student_id
        LEFT JOIN institutions i ON e.institution_id = i.id
        ORDER BY s.created_at DESC
        LIMIT 10
      `);
      console.log(JSON.stringify(recent.rows, null, 2));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkStudents();
