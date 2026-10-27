import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function addVCET() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Check if VCET exists
    const check = await client.query("SELECT id FROM institutions WHERE aicte_code = '1-432891950' OR name ILIKE '%Velalar%'");
    let institutionId: string;

    if (check.rows.length > 0) {
      institutionId = check.rows[0].id;
      console.log('VCET already exists with ID:', institutionId);
    } else {
      const instRes = await client.query(`
        INSERT INTO institutions (
          aicte_code,
          name,
          state,
          district,
          address,
          contact_email,
          contact_phone,
          is_active
        ) VALUES (
          '1-432891950',
          'Velalar College of Engineering and Technology',
          'Tamil Nadu',
          'Erode',
          'Perundurai Road, Thindal, Erode, Tamil Nadu 638012',
          'principal@velalarengg.ac.in',
          '0424-2244201',
          TRUE
        ) RETURNING id
      `);
      institutionId = instRes.rows[0].id;
      console.log('Inserted VCET with ID:', institutionId);
    }

    // 2. Insert Academic Programs for VCET
    const programs = [
      { name: 'B.Tech Computer Science & Engineering', code: 'CSE', level: 'UG', intake: 180, super: 18, nri: 9 },
      { name: 'B.Tech Information Technology', code: 'IT', level: 'UG', intake: 120, super: 12, nri: 6 },
      { name: 'B.Tech Artificial Intelligence & Data Science', code: 'AI&DS', level: 'UG', intake: 120, super: 12, nri: 6 },
      { name: 'B.Tech Electronics & Communication Engineering', code: 'ECE', level: 'UG', intake: 180, super: 18, nri: 9 },
      { name: 'B.Tech Electrical & Electronics Engineering', code: 'EEE', level: 'UG', intake: 60, super: 6, nri: 3 },
      { name: 'B.Tech Mechanical Engineering', code: 'MECH', level: 'UG', intake: 60, super: 6, nri: 3 },
      { name: 'B.Tech Medical Electronics', code: 'MDE', level: 'UG', intake: 60, super: 6, nri: 3 },
      { name: 'Master of Business Administration', code: 'MBA', level: 'PG', intake: 60, super: 6, nri: 0 },
      { name: 'Master of Computer Applications', code: 'MCA', level: 'PG', intake: 60, super: 6, nri: 0 }
    ];

    for (const prog of programs) {
      await client.query(`
        INSERT INTO academic_programs (
          institution_id,
          program_name,
          program_code,
          degree_level,
          academic_year,
          approved_intake,
          supernumerary_intake,
          nri_quota
        ) VALUES ($1, $2, $3, $4, '2025-2026', $5, $6, $7)
        ON CONFLICT DO NOTHING
      `, [institutionId, prog.name, prog.code, prog.level, prog.intake, prog.super, prog.nri]);
    }

    // 3. Insert / update Principal / College Admin user for VCET (password: Admin@1234)
    const passwordHash = '$2b$10$RqccgISJ4Uzz8PQTbmxSi.xiNkhMIiZgTr46JwGkoQw0opGFU1Lci';
    await client.query(`
      INSERT INTO users (
        email,
        password_hash,
        full_name,
        role,
        institution_id,
        is_active
      ) VALUES (
        'principal@velalarengg.ac.in',
        $1,
        'Dr. M. Jayaraman, Principal VCET',
        'COLLEGE_ADMIN',
        $2,
        TRUE
      )
      ON CONFLICT (email) DO UPDATE SET
        institution_id = $2,
        role = 'COLLEGE_ADMIN',
        password_hash = $1
    `, [passwordHash, institutionId]);

    await client.query('COMMIT');
    console.log('✅ Velalar College of Engineering and Technology (VCET) successfully added with programs & college admin user!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding VCET:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

addVCET();
