-- ============================================================================
-- APAAR ID-Based Student Data Management & Verification Platform (AICTE)
-- PostgreSQL Database Schema & Constraints
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enums
CREATE TYPE user_role AS ENUM ('AICTE_ADMIN', 'COLLEGE_ADMIN', 'STUDENT', 'VERIFIER');
CREATE TYPE seat_category AS ENUM (
    'APPROVED_INTAKE', 
    'SUPERNUMERARY', 
    'NRI', 
    'OCI', 
    'FOREIGN_NATIONAL', 
    'TFW', 
    'EWS'
);
CREATE TYPE enrollment_status AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'SUSPENDED', 'TRANSFERRED', 'FLAGGED_DUPLICATE');
CREATE TYPE verification_status AS ENUM ('VERIFIED', 'REJECTED', 'PENDING_AUDIT');

-- 2. Institutions Table
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aicte_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    address TEXT,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Users Table (RBAC)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role user_role NOT NULL,
    institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
    organization_name VARCHAR(255), -- For Verifiers (e.g., Zoho, Infosys)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Academic Programs & Approved Intake Quota
CREATE TABLE IF NOT EXISTS academic_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    program_name VARCHAR(150) NOT NULL, -- e.g., 'B.Tech Computer Science & Engineering'
    program_code VARCHAR(50) NOT NULL, -- e.g., 'CSE'
    degree_level VARCHAR(50) NOT NULL, -- 'UG', 'PG', 'DIPLOMA'
    academic_year VARCHAR(15) NOT NULL, -- e.g., '2026-2027'
    approved_intake INT NOT NULL CHECK (approved_intake > 0),
    supernumerary_intake INT DEFAULT 0 CHECK (supernumerary_intake >= 0),
    nri_quota INT DEFAULT 0 CHECK (nri_quota >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_institution_program_year UNIQUE (institution_id, program_code, academic_year)
);

-- 5. Students Registry Table
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- 12-digit APAAR ID validation check
    apaar_id CHAR(12) UNIQUE NOT NULL CHECK (apaar_id ~ '^[0-9]{12}$'),
    abc_account_id VARCHAR(50), -- Academic Bank of Credits ID
    full_name VARCHAR(150) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    father_or_guardian_name VARCHAR(150),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    aadhaar_hash CHAR(64), -- SHA-256 for privacy-preserving identity checks
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Student Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE RESTRICT,
    program_id UUID NOT NULL REFERENCES academic_programs(id) ON DELETE RESTRICT,
    academic_year VARCHAR(15) NOT NULL,
    roll_number VARCHAR(100) NOT NULL,
    category seat_category NOT NULL DEFAULT 'APPROVED_INTAKE',
    status enrollment_status NOT NULL DEFAULT 'ACTIVE',
    admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completion_year INT,
    cgpa NUMERIC(4, 2) CHECK (cgpa >= 0.00 AND cgpa <= 10.00),
    degree_awarded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_institution_roll UNIQUE (institution_id, roll_number)
);

-- Partial Unique Index: A student can only have ONE ACTIVE enrollment at any institution simultaneously!
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_student_enrollment 
ON enrollments (student_id) 
WHERE status = 'ACTIVE';

-- 7. Bulk Upload Audit Logs
CREATE TABLE IF NOT EXISTS bulk_upload_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    program_id UUID REFERENCES academic_programs(id) ON DELETE SET NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    total_records INT NOT NULL DEFAULT 0,
    successful_records INT NOT NULL DEFAULT 0,
    failed_records INT NOT NULL DEFAULT 0,
    error_summary JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Verification Audit Trails (For recruiter & external verifier queries)
CREATE TABLE IF NOT EXISTS verification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    verifier_id UUID REFERENCES users(id) ON DELETE SET NULL,
    searched_apaar_id CHAR(12) NOT NULL,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    is_valid BOOLEAN NOT NULL,
    client_ip VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_students_apaar_id ON students(apaar_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_program_category ON enrollments(program_id, category);
CREATE INDEX IF NOT EXISTS idx_academic_programs_inst ON academic_programs(institution_id, academic_year);

-- 9. Institutional Transfer & No Objection Certificate (NOC) Workflow
CREATE TYPE transfer_request_status AS ENUM (
    'NOC_ISSUED_BY_SOURCE', 
    'AICTE_APPROVED', 
    'COMPLETED', 
    'REJECTED', 
    'CANCELLED'
);

CREATE TABLE IF NOT EXISTS transfer_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    source_institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    target_institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    target_program_id UUID NOT NULL REFERENCES academic_programs(id) ON DELETE CASCADE,
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    noc_reference_number VARCHAR(100) UNIQUE NOT NULL,
    transfer_reason TEXT NOT NULL,
    status transfer_request_status NOT NULL DEFAULT 'NOC_ISSUED_BY_SOURCE',
    source_issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    aicte_reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    aicte_decision_at TIMESTAMP WITH TIME ZONE,
    aicte_remarks TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transfers_student ON transfer_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_transfers_source ON transfer_requests(source_institution_id);
CREATE INDEX IF NOT EXISTS idx_transfers_target ON transfer_requests(target_institution_id);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfer_requests(status);

