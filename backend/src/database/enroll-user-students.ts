import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function enrollStudents() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get VCET institution
    const instRes = await client.query("SELECT id FROM institutions WHERE name ILIKE '%Velalar%' LIMIT 1");
    if (instRes.rows.length === 0) {
      console.error('VCET not found!');
      return;
    }
    const instId = instRes.rows[0].id;

    // 2. Get CSE program for VCET
    const progRes = await client.query("SELECT id FROM academic_programs WHERE institution_id = $1 AND program_code = 'CSE' LIMIT 1", [instId]);
    if (progRes.rows.length === 0) {
      console.error('CSE program not found for VCET!');
      return;
    }
    const progId = progRes.rows[0].id;

    const studentsToEnroll = [
      {
        apaarId: '918675569147',
        fullName: 'Karthik S',
        dob: '2004-05-14',
        gender: 'Male',
        email: 'karthik.s@velalarengg.ac.in',
        phone: '9876543210',
        rollNumber: '22CS045',
        abcAccountId: 'ABC-918675569147'
      },
      {
        apaarId: '918675569148',
        fullName: 'Kavya R',
        dob: '2004-08-22',
        gender: 'Female',
        email: 'kavya.r@velalarengg.ac.in',
        phone: '9876543211',
        rollNumber: '22CS046',
        abcAccountId: 'ABC-918675569148'
      }
    ];

    for (const s of studentsToEnroll) {
      // Upsert Student
      const studentRes = await client.query(`
        INSERT INTO students (apaar_id, full_name, dob, gender, email, phone, abc_account_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (apaar_id) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          dob = EXCLUDED.dob,
          gender = EXCLUDED.gender,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone
        RETURNING id
      `, [s.apaarId, s.fullName, s.dob, s.gender, s.email, s.phone, s.abcAccountId]);

      const studentId = studentRes.rows[0].id;

      // Upsert Enrollment
      await client.query(`
        INSERT INTO enrollments (student_id, institution_id, program_id, academic_year, roll_number, category, status)
        VALUES ($1, $2, $3, '2025-2026', $4, 'APPROVED_INTAKE', 'ACTIVE')
        ON CONFLICT DO NOTHING
      `, [studentId, instId, progId, s.rollNumber]);

      console.log(`✅ Enrolled APAAR ${s.apaarId} (${s.fullName}) into VCET CSE`);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error enrolling students:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

enrollStudents();
