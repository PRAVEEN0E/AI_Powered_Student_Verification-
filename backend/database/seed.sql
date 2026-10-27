-- ============================================================================
-- APAAR AICTE Platform — Comprehensive Seed Data
-- 50+ Real AICTE-Approved Institutions across India
-- ============================================================================

-- Clear existing data (order matters for FK constraints)
TRUNCATE TABLE verification_logs, transfer_requests, bulk_upload_logs, enrollments, students, academic_programs, users, institutions RESTART IDENTITY CASCADE;

-- ============================================================================
-- 1. INSTITUTIONS (50 Real AICTE-Approved Colleges)
-- ============================================================================
INSERT INTO institutions (id, aicte_code, name, state, district, address, contact_email, contact_phone, is_active) VALUES
-- Tamil Nadu
('11111111-0001-0001-0001-000000000001', '1-432891901', 'Kongu Engineering College', 'Tamil Nadu', 'Erode', 'Perundurai, Erode - 638060', 'principal@kongu.ac.in', '04294-226000', TRUE),
('11111111-0002-0002-0002-000000000002', '1-432891902', 'PSG College of Technology', 'Tamil Nadu', 'Coimbatore', 'Peelamedu, Coimbatore - 641004', 'principal@psgtech.ac.in', '0422-4344000', TRUE),
('11111111-0003-0003-0003-000000000003', '1-432891903', 'Sri Venkateswara College of Engineering', 'Tamil Nadu', 'Kancheepuram', 'Pennalur, Sriperumbudur - 602117', 'info@svce.ac.in', '044-27152000', TRUE),
('11111111-0004-0004-0004-000000000004', '1-432891904', 'Kumaraguru College of Technology', 'Tamil Nadu', 'Coimbatore', 'Chinnavedampatti, Coimbatore - 641049', 'principal@kct.ac.in', '0422-2668777', TRUE),
('11111111-0005-0005-0005-000000000005', '1-432891905', 'Thiagarajar College of Engineering', 'Tamil Nadu', 'Madurai', 'Thiruparankundram, Madurai - 625015', 'principal@tce.edu', '0452-2482240', TRUE),
('11111111-0006-0006-0006-000000000006', '1-432891906', 'Coimbatore Institute of Technology', 'Tamil Nadu', 'Coimbatore', 'Civil Aerodrome Post, Coimbatore - 641014', 'principal@cit.edu.in', '0422-2574071', TRUE),
('11111111-0007-0007-0007-000000000007', '1-432891907', 'SSN College of Engineering', 'Tamil Nadu', 'Chennai', 'Kalavakkam, Chennai - 603110', 'principal@ssn.edu.in', '044-27469700', TRUE),
('11111111-0051-0051-0051-000000000051', '1-432891950', 'Velalar College of Engineering and Technology', 'Tamil Nadu', 'Erode', 'Perundurai Road, Thindal, Erode, Tamil Nadu 638012', 'principal@velalarengg.ac.in', '0424-2244201', TRUE),

-- Maharashtra
('11111111-0008-0008-0008-000000000008', '1-532891001', 'College of Engineering Pune', 'Maharashtra', 'Pune', 'Wellesly Road, Shivajinagar, Pune - 411005', 'director@coep.ac.in', '020-25507000', TRUE),
('11111111-0009-0009-0009-000000000009', '1-532891002', 'Vishwakarma Institute of Technology', 'Maharashtra', 'Pune', '666 Upper Indiranagar, Bibwewadi, Pune - 411037', 'principal@vit.edu', '020-24265000', TRUE),
('11111111-0010-0010-0010-000000000010', '1-532891003', 'KJ Somaiya College of Engineering', 'Maharashtra', 'Mumbai', 'Vidyanagar, Vidyavihar East, Mumbai - 400077', 'principal@somaiya.edu', '022-67283000', TRUE),
('11111111-0011-0011-0011-000000000011', '1-532891004', 'Institute of Chemical Technology', 'Maharashtra', 'Mumbai', 'Matunga East, Mumbai - 400019', 'info@ictmumbai.edu.in', '022-33612000', TRUE),
('11111111-0012-0012-0012-000000000012', '1-532891005', 'Pune Institute of Computer Technology', 'Maharashtra', 'Pune', 'Survey No. 27, Near Trimurti Chowk, Pune - 411043', 'principal@pict.edu', '020-25465257', TRUE),

-- Karnataka
('11111111-0013-0013-0013-000000000013', '1-632891001', 'RV College of Engineering', 'Karnataka', 'Bengaluru', 'Mysore Road, RV Vidyanikethan Post, Bengaluru - 560059', 'principal@rvce.edu.in', '080-67178000', TRUE),
('11111111-0014-0014-0014-000000000014', '1-632891002', 'BMS College of Engineering', 'Karnataka', 'Bengaluru', 'P.O. Box 1908, Bull Temple Road, Bengaluru - 560019', 'principal@bmsce.ac.in', '080-26622130', TRUE),
('11111111-0015-0015-0015-000000000015', '1-632891003', 'PES University', 'Karnataka', 'Bengaluru', '100 Feet Ring Road, BSK III Stage, Bengaluru - 560085', 'info@pes.edu', '080-26721983', TRUE),
('11111111-0016-0016-0016-000000000016', '1-632891004', 'MS Ramaiah Institute of Technology', 'Karnataka', 'Bengaluru', 'MSRIT Post, MSR Nagar, Bengaluru - 560054', 'principal@msrit.edu', '080-23600822', TRUE),
('11111111-0017-0017-0017-000000000017', '1-632891005', 'Dayananda Sagar College of Engineering', 'Karnataka', 'Bengaluru', 'Shavige Malleshwara Hills, Kumaraswamy Layout, Bengaluru - 560111', 'principal@dayanandasagar.edu', '080-42161700', TRUE),

-- Andhra Pradesh & Telangana
('11111111-0018-0018-0018-000000000018', '1-732891001', 'JNTU College of Engineering Hyderabad', 'Telangana', 'Hyderabad', 'Kukatpally, Hyderabad - 500085', 'principal@jntuh.ac.in', '040-23156114', TRUE),
('11111111-0019-0019-0019-000000000019', '1-732891002', 'BITS Pilani Hyderabad Campus', 'Telangana', 'Hyderabad', 'Jawahar Nagar, Shameerpet Mandal, Hyderabad - 500078', 'info@hyderabad.bits-pilani.ac.in', '040-66303535', TRUE),
('11111111-0020-0020-0020-000000000020', '1-732891003', 'CVR College of Engineering', 'Telangana', 'Hyderabad', 'Mangalpally Village, Ibrahimpatnam, Hyderabad - 501510', 'info@cvr.ac.in', '040-27821000', TRUE),
('11111111-0021-0021-0021-000000000021', '1-832891001', 'GITAM University', 'Andhra Pradesh', 'Visakhapatnam', 'Gandhi Institute of Technology and Management, Rushikonda, Vizag - 530045', 'info@gitam.edu', '0891-2790101', TRUE),
('11111111-0022-0022-0022-000000000022', '1-832891002', 'Andhra University College of Engineering', 'Andhra Pradesh', 'Visakhapatnam', 'Visakhapatnam - 530003', 'principal@auce.ac.in', '0891-2844000', TRUE),

-- Delhi & NCR
('11111111-0023-0023-0023-000000000023', '1-932891001', 'Delhi Technological University', 'Delhi', 'Delhi', 'Shahbad Daulatpur, Bawana Road, Delhi - 110042', 'vc@dtu.ac.in', '011-27871018', TRUE),
('11111111-0024-0024-0024-000000000024', '1-932891002', 'Netaji Subhas University of Technology', 'Delhi', 'Delhi', 'Sector III, Dwarka, New Delhi - 110078', 'vc@nsut.ac.in', '011-25099042', TRUE),
('11111111-0025-0025-0025-000000000025', '1-932891003', 'Indraprastha Institute of Information Technology', 'Delhi', 'Delhi', 'Okhla Phase III, New Delhi - 110020', 'info@iiitd.ac.in', '011-26907400', TRUE),

-- Rajasthan & Gujarat
('11111111-0026-0026-0026-000000000026', '1-132891001', 'Malaviya National Institute of Technology', 'Rajasthan', 'Jaipur', 'J.L.N. Marg, Jaipur - 302017', 'director@mnit.ac.in', '0141-2529087', TRUE),
('11111111-0027-0027-0027-000000000027', '1-132891002', 'LNM Institute of Information Technology', 'Rajasthan', 'Jaipur', 'Rupa ki Nangal, Post - Sumel, Via - Jamdoli, Jaipur - 302031', 'info@lnmiit.ac.in', '0141-3949200', TRUE),
('11111111-0028-0028-0028-000000000028', '1-242891001', 'Dhirubhai Ambani Institute of Information and Communication Technology', 'Gujarat', 'Gandhinagar', 'Near Indroda Circle, Gandhinagar - 382007', 'info@daiict.ac.in', '079-68261000', TRUE),
('11111111-0029-0029-0029-000000000029', '1-242891002', 'Nirma University Institute of Technology', 'Gujarat', 'Ahmedabad', 'Sarkhej-Gandhinagar Highway, Chharodi, Ahmedabad - 382481', 'director@nirmauni.ac.in', '02717-241911', TRUE),
('11111111-0030-0030-0030-000000000030', '1-242891003', 'Sardar Vallabhbhai National Institute of Technology', 'Gujarat', 'Surat', 'Ichchhanath, Surat - 395007', 'director@svnit.ac.in', '0261-2201532', TRUE),

-- West Bengal & East India
('11111111-0031-0031-0031-000000000031', '1-332891001', 'Jadavpur University Faculty of Engineering', 'West Bengal', 'Kolkata', 'Raja SC Mallick Road, Jadavpur, Kolkata - 700032', 'vc@jadavpuruniversity.in', '033-24146000', TRUE),
('11111111-0032-0032-0032-000000000032', '1-332891002', 'Heritage Institute of Technology', 'West Bengal', 'Kolkata', 'Chowbaga Road, Anandapur, Kolkata - 700107', 'principal@heritageit.edu', '033-24930636', TRUE),
('11111111-0033-0033-0033-000000000033', '1-332891003', 'Institute of Engineering and Management', 'West Bengal', 'Kolkata', 'University Area, Plot No - IIF/2, Action Area III, New Town, Kolkata - 700160', 'info@iemcal.com', '033-40200200', TRUE),
('11111111-0034-0034-0034-000000000034', '1-442891001', 'NIT Rourkela', 'Odisha', 'Rourkela', 'Rourkela - 769008', 'director@nitrkl.ac.in', '0661-2462022', TRUE),

-- Madhya Pradesh & Chhattisgarh
('11111111-0035-0035-0035-000000000035', '1-232891001', 'SGSITS Indore', 'Madhya Pradesh', 'Indore', '23 Park Road, Indore - 452003', 'principal@sgsits.ac.in', '0731-2700262', TRUE),
('11111111-0036-0036-0036-000000000036', '1-232891002', 'Maulana Azad National Institute of Technology', 'Madhya Pradesh', 'Bhopal', 'Link Road No. 3, Near Shahpura, Bhopal - 462003', 'director@manit.ac.in', '0755-2670337', TRUE),

-- Uttar Pradesh
('11111111-0037-0037-0037-000000000037', '1-552891001', 'Harcourt Butler Technical University', 'Uttar Pradesh', 'Kanpur', 'Nawabganj, Kanpur - 208002', 'registrar@hbtu.ac.in', '0512-2533537', TRUE),
('11111111-0038-0038-0038-000000000038', '1-552891002', 'GLA University', 'Uttar Pradesh', 'Mathura', '17km Stone, NH-2, Mathura - Agra Road, Mathura - 281406', 'info@gla.ac.in', '05662-250909', TRUE),
('11111111-0039-0039-0039-000000000039', '1-552891003', 'Amity School of Engineering and Technology', 'Uttar Pradesh', 'Noida', 'Amity University Campus, Sector 125, Noida - 201313', 'info@amity.edu', '0120-4392000', TRUE),

-- Kerala
('11111111-0040-0040-0040-000000000040', '1-672891001', 'College of Engineering Trivandrum', 'Kerala', 'Thiruvananthapuram', 'Sreekaryam, Thiruvananthapuram - 695016', 'principal@cet.ac.in', '0471-2598474', TRUE),
('11111111-0041-0041-0041-000000000041', '1-672891002', 'Government Engineering College Thrissur', 'Kerala', 'Thrissur', 'Ramavarmapuram, Thrissur - 680009', 'principal@gecthrissur.ac.in', '0487-2334747', TRUE),
('11111111-0042-0042-0042-000000000042', '1-672891003', 'Mar Athanasius College of Engineering', 'Kerala', 'Ernakulam', 'Kothamangalam, Ernakulam - 686666', 'principal@mace.ac.in', '0485-2822363', TRUE),

-- Punjab & Haryana
('11111111-0043-0043-0043-000000000043', '1-782891001', 'Thapar Institute of Engineering and Technology', 'Punjab', 'Patiala', 'Thapar University Campus, Bhadson Road, Patiala - 147004', 'registrar@thapar.edu', '0175-2393021', TRUE),
('11111111-0044-0044-0044-000000000044', '1-782891002', 'Punjab Engineering College', 'Punjab', 'Chandigarh', 'Sector 12, Chandigarh - 160012', 'director@pec.edu.in', '0172-2753052', TRUE),
('11111111-0045-0045-0045-000000000045', '1-882891001', 'YMCA University of Science and Technology', 'Haryana', 'Faridabad', 'Faridabad - 121006', 'registrar@ymcaust.ac.in', '0129-2310100', TRUE),

-- Vellore Institute of Technology (flagship)
('11111111-0046-0046-0046-000000000046', '1-432891910', 'Vellore Institute of Technology', 'Tamil Nadu', 'Vellore', 'Tiruvalam Road, Katpadi, Vellore - 632014', 'vit@vit.ac.in', '0416-2243091', TRUE),

-- More South India
('11111111-0047-0047-0047-000000000047', '1-432891911', 'Sri Krishna College of Engineering and Technology', 'Tamil Nadu', 'Coimbatore', 'Kuniamuthur, Coimbatore - 641008', 'principal@skcet.ac.in', '0422-2666555', TRUE),
('11111111-0048-0048-0048-000000000048', '1-432891912', 'Bannari Amman Institute of Technology', 'Tamil Nadu', 'Erode', 'Sathyamangalam, Erode - 638401', 'principal@bitsathy.ac.in', '04295-226000', TRUE),
('11111111-0049-0049-0049-000000000049', '1-632891010', 'Nitte Meenakshi Institute of Technology', 'Karnataka', 'Bengaluru', 'P.B. No. 6429, Yelahanka, Bengaluru - 560064', 'principal@nmit.ac.in', '080-22167000', TRUE),
('11111111-0050-0050-0050-000000000050', '1-832891010', 'Sreenidhi Institute of Science and Technology', 'Telangana', 'Hyderabad', 'Yamnampet, Ghatkesar, Hyderabad - 501301', 'principal@sreenidhi.edu.in', '040-65965623', TRUE);

-- ============================================================================
-- 2. USERS (AICTE Admin + College Admins per institution)
-- ============================================================================
-- Password for all users: Admin@1234 (bcrypt hash below)
INSERT INTO users (id, email, password_hash, full_name, role, institution_id, is_active) VALUES
-- AICTE National Admin
('22222222-0001-0001-0001-000000000001', 'national.admin@aicte-india.gov.in', '$2b$10$RqccgISJ4Uzz8PQTbmxSi.xiNkhMIiZgTr46JwGkoQw0opGFU1Lci', 'Dr. R. Ramanathan, Member Secretary', 'AICTE_ADMIN', NULL, TRUE),
('22222222-0002-0002-0002-000000000002', 'compliance.head@aicte-india.gov.in', '$2b$10$RqccgISJ4Uzz8PQTbmxSi.xiNkhMIiZgTr46JwGkoQw0opGFU1Lci', 'Dr. Priya Sharma, Compliance Head', 'AICTE_ADMIN', NULL, TRUE),

-- College Admins
('22222222-0010-0010-0010-000000000010', 'principal@kongu.ac.in', '$2b$10$RqccgISJ4Uzz8PQTbmxSi.xiNkhMIiZgTr46JwGkoQw0opGFU1Lci', 'Dr. S. Salivahanan, Principal KEC', 'COLLEGE_ADMIN', '11111111-0001-0001-0001-000000000001', TRUE),
('22222222-0011-0011-0011-000000000011', 'principal@psgtech.ac.in', '$2b$10$RqccgISJ4Uzz8PQTbmxSi.xiNkhMIiZgTr46JwGkoQw0opGFU1Lci', 'Dr. R. Rudramoorthy, Principal PSG', 'COLLEGE_ADMIN', '11111111-0002-0002-0002-000000000002', TRUE),
('22222222-0012-0012-0012-000000000012', 'principal@rvce.edu.in', '$2b$10$RqccgISJ4Uzz8PQTbmxSi.xiNkhMIiZgTr46JwGkoQw0opGFU1Lci', 'Dr. K.N. Subramanya, Principal RVCE', 'COLLEGE_ADMIN', '11111111-0013-0013-0013-000000000013', TRUE),
('22222222-0013-0013-0013-000000000013', 'principal@bmsce.ac.in', '$2b$10$RqccgISJ4Uzz8PQTbmxSi.xiNkhMIiZgTr46JwGkoQw0opGFU1Lci', 'Dr. Guruprasad, Principal BMSCE', 'COLLEGE_ADMIN', '11111111-0014-0014-0014-000000000014', TRUE),
('22222222-0014-0014-0014-000000000014', 'director@coep.ac.in', '$2b$10$RqccgISJ4Uzz8PQTbmxSi.xiNkhMIiZgTr46JwGkoQw0opGFU1Lci', 'Dr. S. S. Pande, Director COEP', 'COLLEGE_ADMIN', '11111111-0008-0008-0008-000000000008', TRUE),
('22222222-0015-0015-0015-000000000015', 'vit@vit.ac.in', '$2b$10$RqccgISJ4Uzz8PQTbmxSi.xiNkhMIiZgTr46JwGkoQw0opGFU1Lci', 'Dr. G. Viswanathan, Chancellor VIT', 'COLLEGE_ADMIN', '11111111-0046-0046-0046-000000000046', TRUE),
('22222222-0016-0016-0016-000000000016', 'principal@velalarengg.ac.in', '$2b$10$RqccgISJ4Uzz8PQTbmxSi.xiNkhMIiZgTr46JwGkoQw0opGFU1Lci', 'Dr. M. Jayaraman, Principal VCET', 'COLLEGE_ADMIN', '11111111-0051-0051-0051-000000000051', TRUE),

-- Verifiers (Recruiters)
('22222222-0050-0050-0050-000000000050', 'talent@zoho.com', '$2b$10$RqccgISJ4Uzz8PQTbmxSi.xiNkhMIiZgTr46JwGkoQw0opGFU1Lci', 'Priya Sharma, Senior Campus Partner - Zoho', 'VERIFIER', NULL, TRUE),
('22222222-0051-0051-0051-000000000051', 'campus@infosys.com', '$2b$10$RqccgISJ4Uzz8PQTbmxSi.xiNkhMIiZgTr46JwGkoQw0opGFU1Lci', 'Rajesh Iyer, Campus Recruiter - Infosys', 'VERIFIER', NULL, TRUE),
('22222222-0052-0052-0052-000000000052', 'hr@tcs.com', '$2b$10$RqccgISJ4Uzz8PQTbmxSi.xiNkhMIiZgTr46JwGkoQw0opGFU1Lci', 'Ananya Krishnan, HR Lead - TCS', 'VERIFIER', NULL, TRUE);

-- ============================================================================
-- 3. ACADEMIC PROGRAMS (Programs for key institutions)
-- ============================================================================
INSERT INTO academic_programs (id, institution_id, program_name, program_code, degree_level, academic_year, approved_intake, supernumerary_intake, nri_quota) VALUES
-- KEC Programs
('33333333-0001-0001-0001-000000000001', '11111111-0001-0001-0001-000000000001', 'B.Tech Computer Science & Engineering', 'CSE', 'UG', '2025-2026', 180, 18, 9),
('33333333-0001-0002-0002-000000000002', '11111111-0001-0001-0001-000000000001', 'B.Tech Information Technology', 'IT', 'UG', '2025-2026', 120, 12, 6),
('33333333-0001-0003-0003-000000000003', '11111111-0001-0001-0001-000000000001', 'B.Tech Electronics & Communication', 'ECE', 'UG', '2025-2026', 180, 18, 9),
('33333333-0001-0004-0004-000000000004', '11111111-0001-0001-0001-000000000001', 'B.Tech Mechanical Engineering', 'MECH', 'UG', '2025-2026', 60, 6, 3),
('33333333-0001-0005-0005-000000000005', '11111111-0001-0001-0001-000000000001', 'M.Tech Computer Science & Engineering', 'MCSE', 'PG', '2025-2026', 24, 2, 0),

-- PSG Tech Programs
('33333333-0002-0001-0001-000000000006', '11111111-0002-0002-0002-000000000002', 'B.Tech Computer Science & Engineering', 'CSE', 'UG', '2025-2026', 240, 24, 12),
('33333333-0002-0002-0002-000000000007', '11111111-0002-0002-0002-000000000002', 'B.Tech Electronics & Communication', 'ECE', 'UG', '2025-2026', 240, 24, 12),
('33333333-0002-0003-0003-000000000008', '11111111-0002-0002-0002-000000000002', 'B.Tech Mechanical Engineering', 'MECH', 'UG', '2025-2026', 180, 18, 9),
('33333333-0002-0004-0004-000000000009', '11111111-0002-0002-0002-000000000002', 'B.Tech Civil Engineering', 'CIVIL', 'UG', '2025-2026', 120, 12, 6),

-- RVCE Programs
('33333333-0013-0001-0001-000000000010', '11111111-0013-0013-0013-000000000013', 'B.Tech Computer Science & Engineering', 'CSE', 'UG', '2025-2026', 240, 24, 12),
('33333333-0013-0002-0002-000000000011', '11111111-0013-0013-0013-000000000013', 'B.Tech Information Science & Engineering', 'ISE', 'UG', '2025-2026', 180, 18, 9),
('33333333-0013-0003-0003-000000000012', '11111111-0013-0013-0013-000000000013', 'B.Tech Electronics & Communication', 'ECE', 'UG', '2025-2026', 240, 24, 12),
('33333333-0013-0004-0004-000000000013', '11111111-0013-0013-0013-000000000013', 'B.Tech Electrical & Electronics', 'EEE', 'UG', '2025-2026', 120, 12, 6),

-- VIT Programs
('33333333-0046-0001-0001-000000000014', '11111111-0046-0046-0046-000000000046', 'B.Tech Computer Science & Engineering', 'CSE', 'UG', '2025-2026', 360, 36, 18),
('33333333-0046-0002-0002-000000000015', '11111111-0046-0046-0046-000000000046', 'B.Tech Information Technology', 'IT', 'UG', '2025-2026', 300, 30, 15),
('33333333-0046-0003-0003-000000000016', '11111111-0046-0046-0046-000000000046', 'B.Tech Electronics & Communication', 'ECE', 'UG', '2025-2026', 300, 30, 15),
('33333333-0046-0004-0004-000000000017', '11111111-0046-0046-0046-000000000046', 'B.Tech Mechanical Engineering', 'MECH', 'UG', '2025-2026', 240, 24, 12),

-- COEP Programs
('33333333-0008-0001-0001-000000000018', '11111111-0008-0008-0008-000000000008', 'B.Tech Computer Engineering', 'COMP', 'UG', '2025-2026', 120, 12, 6),
('33333333-0008-0002-0002-000000000019', '11111111-0008-0008-0008-000000000008', 'B.Tech Mechanical Engineering', 'MECH', 'UG', '2025-2026', 120, 12, 6),
('33333333-0008-0003-0003-000000000020', '11111111-0008-0008-0008-000000000008', 'B.Tech Civil Engineering', 'CIVIL', 'UG', '2025-2026', 90, 9, 4),

-- BMSCE Programs
('33333333-0014-0001-0001-000000000021', '11111111-0014-0014-0014-000000000014', 'B.Tech Computer Science & Engineering', 'CSE', 'UG', '2025-2026', 180, 18, 9),
('33333333-0014-0002-0002-000000000022', '11111111-0014-0014-0014-000000000014', 'B.Tech Information Science & Engineering', 'ISE', 'UG', '2025-2026', 120, 12, 6),
('33333333-0014-0003-0003-000000000023', '11111111-0014-0014-0014-000000000014', 'B.Tech Electronics & Communication', 'ECE', 'UG', '2025-2026', 180, 18, 9),

-- DTU Programs
('33333333-0023-0001-0001-000000000024', '11111111-0023-0023-0023-000000000023', 'B.Tech Computer Science & Engineering', 'CSE', 'UG', '2025-2026', 210, 21, 10),
('33333333-0023-0002-0002-000000000025', '11111111-0023-0023-0023-000000000023', 'B.Tech Electronics & Communication', 'ECE', 'UG', '2025-2026', 180, 18, 9),
('33333333-0023-0003-0003-000000000026', '11111111-0023-0023-0023-000000000023', 'B.Tech Mechanical Engineering', 'MECH', 'UG', '2025-2026', 150, 15, 7),

-- Thapar Programs
('33333333-0043-0001-0001-000000000027', '11111111-0043-0043-0043-000000000043', 'B.Tech Computer Science & Engineering', 'CSE', 'UG', '2025-2026', 180, 18, 9),
('33333333-0043-0002-0002-000000000028', '11111111-0043-0043-0043-000000000043', 'B.Tech Electronics & Communication', 'ECE', 'UG', '2025-2026', 150, 15, 7),
('33333333-0043-0003-0003-000000000029', '11111111-0043-0043-0043-000000000043', 'B.Tech Mechanical Engineering', 'MECH', 'UG', '2025-2026', 120, 12, 6),

-- JNTU Hyderabad
('33333333-0018-0001-0001-000000000030', '11111111-0018-0018-0018-000000000018', 'B.Tech Computer Science & Engineering', 'CSE', 'UG', '2025-2026', 300, 30, 15),
('33333333-0018-0002-0002-000000000031', '11111111-0018-0018-0018-000000000018', 'B.Tech Electronics & Communication', 'ECE', 'UG', '2025-2026', 240, 24, 12),
('33333333-0018-0003-0003-000000000032', '11111111-0018-0018-0018-000000000018', 'B.Tech Electrical & Electronics', 'EEE', 'UG', '2025-2026', 180, 18, 9),

-- Jadavpur University
('33333333-0031-0001-0001-000000000033', '11111111-0031-0031-0031-000000000031', 'B.Tech Computer Science & Engineering', 'CSE', 'UG', '2025-2026', 120, 12, 6),
('33333333-0031-0002-0002-000000000034', '11111111-0031-0031-0031-000000000031', 'B.Tech Electronics & Telecommunication', 'ETCE', 'UG', '2025-2026', 120, 12, 6),

-- CET Trivandrum
('33333333-0040-0001-0001-000000000035', '11111111-0040-0040-0040-000000000040', 'B.Tech Computer Science & Engineering', 'CSE', 'UG', '2025-2026', 60, 6, 3),
('33333333-0040-0002-0002-000000000036', '11111111-0040-0040-0040-000000000040', 'B.Tech Electronics & Communication', 'ECE', 'UG', '2025-2026', 60, 6, 3);

-- ============================================================================
-- 4. STUDENTS (200 realistic students with 12-digit APAAR IDs)
-- ============================================================================
INSERT INTO students (id, apaar_id, abc_account_id, full_name, dob, gender, father_or_guardian_name, email, phone) VALUES
-- Tamil Nadu students
('44444444-0001-0001-0001-000000000001', '100000000001', 'ABC-KEC-001', 'Aarav Krishnamurthy', '2004-05-15', 'Male', 'Ramesh Krishnamurthy', 'aarav.k@gmail.com', '9876501001'),
('44444444-0002-0002-0002-000000000002', '100000000002', 'ABC-KEC-002', 'Ananya Subramaniam', '2004-07-22', 'Female', 'Suresh Subramaniam', 'ananya.s@gmail.com', '9876501002'),
('44444444-0003-0003-0003-000000000003', '100000000003', 'ABC-KEC-003', 'Arjun Venkatesh', '2004-03-10', 'Male', 'Venkatesh Iyer', 'arjun.v@gmail.com', '9876501003'),
('44444444-0004-0004-0004-000000000004', '100000000004', 'ABC-KEC-004', 'Kavya Rajasekar', '2004-09-18', 'Female', 'Rajasekar Murugan', 'kavya.r@gmail.com', '9876501004'),
('44444444-0005-0005-0005-000000000005', '100000000005', 'ABC-KEC-005', 'Kiran Palani', '2004-11-30', 'Male', 'Palani Selvam', 'kiran.p@gmail.com', '9876501005'),
('44444444-0006-0006-0006-000000000006', '100000000006', 'ABC-KEC-006', 'Meera Natarajan', '2005-01-14', 'Female', 'Natarajan Sundar', 'meera.n@gmail.com', '9876501006'),
('44444444-0007-0007-0007-000000000007', '100000000007', 'ABC-KEC-007', 'Naveen Chandrasekhar', '2004-06-25', 'Male', 'Chandrasekhar Ravi', 'naveen.c@gmail.com', '9876501007'),
('44444444-0008-0008-0008-000000000008', '100000000008', 'ABC-KEC-008', 'Priya Balasubramanian', '2004-08-12', 'Female', 'Balasubramanian R', 'priya.b@gmail.com', '9876501008'),
('44444444-0009-0009-0009-000000000009', '100000000009', 'ABC-KEC-009', 'Rahul Selvaraj', '2004-04-05', 'Male', 'Selvaraj Murugan', 'rahul.s@gmail.com', '9876501009'),
('44444444-0010-0010-0010-000000000010', '100000000010', 'ABC-KEC-010', 'Sneha Maheshwari', '2005-02-28', 'Female', 'Maheshwari K', 'sneha.m@gmail.com', '9876501010'),
-- PSG Tech students
('44444444-0011-0011-0011-000000000011', '100000000011', 'ABC-PSG-001', 'Aditya Ramachandran', '2004-12-07', 'Male', 'Ramachandran S', 'aditya.r@gmail.com', '9876502001'),
('44444444-0012-0012-0012-000000000012', '100000000012', 'ABC-PSG-002', 'Bhavana Sridhar', '2004-10-19', 'Female', 'Sridhar Anand', 'bhavana.s@gmail.com', '9876502002'),
('44444444-0013-0013-0013-000000000013', '100000000013', 'ABC-PSG-003', 'Deepak Periyasamy', '2005-03-22', 'Male', 'Periyasamy R', 'deepak.p@gmail.com', '9876502003'),
('44444444-0014-0014-0014-000000000014', '100000000014', 'ABC-PSG-004', 'Gayatri Mohan', '2004-07-14', 'Female', 'Mohan Krishnan', 'gayatri.m@gmail.com', '9876502004'),
('44444444-0015-0015-0015-000000000015', '100000000015', 'ABC-PSG-005', 'Harish Balakrishnan', '2004-05-28', 'Male', 'Balakrishnan N', 'harish.b@gmail.com', '9876502005'),
-- RVCE students
('44444444-0021-0021-0021-000000000021', '100000000021', 'ABC-RVCE-001', 'Akash Hegde', '2004-04-17', 'Male', 'Hegde Suresh', 'akash.h@gmail.com', '9876503001'),
('44444444-0022-0022-0022-000000000022', '100000000022', 'ABC-RVCE-002', 'Bindhu Rao', '2004-08-09', 'Female', 'Rao Narayana', 'bindhu.r@gmail.com', '9876503002'),
('44444444-0023-0023-0023-000000000023', '100000000023', 'ABC-RVCE-003', 'Chetan Gowda', '2005-01-31', 'Male', 'Gowda Prabhu', 'chetan.g@gmail.com', '9876503003'),
('44444444-0024-0024-0024-000000000024', '100000000024', 'ABC-RVCE-004', 'Divya Prakash', '2004-09-23', 'Female', 'Prakash Shivakumar', 'divya.p@gmail.com', '9876503004'),
('44444444-0025-0025-0025-000000000025', '100000000025', 'ABC-RVCE-005', 'Eshan Nair', '2004-06-11', 'Male', 'Nair Rajan', 'eshan.n@gmail.com', '9876503005'),
-- VIT students
('44444444-0031-0031-0031-000000000031', '100000000031', 'ABC-VIT-001', 'Aishwarya Chandran', '2004-11-05', 'Female', 'Chandran Mohan', 'aishwarya.c@gmail.com', '9876504001'),
('44444444-0032-0032-0032-000000000032', '100000000032', 'ABC-VIT-002', 'Bhuvan Shankar', '2004-07-17', 'Male', 'Shankar Kumar', 'bhuvan.s@gmail.com', '9876504002'),
('44444444-0033-0033-0033-000000000033', '100000000033', 'ABC-VIT-003', 'Chaitra Narayan', '2005-02-13', 'Female', 'Narayan Srinivasan', 'chaitra.n@gmail.com', '9876504003'),
('44444444-0034-0034-0034-000000000034', '100000000034', 'ABC-VIT-004', 'Dhruv Mehta', '2004-03-29', 'Male', 'Mehta Ravi', 'dhruv.m@gmail.com', '9876504004'),
('44444444-0035-0035-0035-000000000035', '100000000035', 'ABC-VIT-005', 'Eesha Pillai', '2004-10-01', 'Female', 'Pillai Krishnan', 'eesha.p@gmail.com', '9876504005'),
-- COEP students
('44444444-0041-0041-0041-000000000041', '100000000041', 'ABC-COEP-001', 'Anurag Desai', '2004-05-20', 'Male', 'Desai Ramesh', 'anurag.d@gmail.com', '9876505001'),
('44444444-0042-0042-0042-000000000042', '100000000042', 'ABC-COEP-002', 'Bhagyashri Kulkarni', '2004-08-14', 'Female', 'Kulkarni Suresh', 'bhagya.k@gmail.com', '9876505002'),
('44444444-0043-0043-0043-000000000043', '100000000043', 'ABC-COEP-003', 'Chirag Joshi', '2005-01-08', 'Male', 'Joshi Pradeep', 'chirag.j@gmail.com', '9876505003'),
('44444444-0044-0044-0044-000000000044', '100000000044', 'ABC-COEP-004', 'Deepika Patil', '2004-09-16', 'Female', 'Patil Ashok', 'deepika.p@gmail.com', '9876505004'),
('44444444-0045-0045-0045-000000000045', '100000000045', 'ABC-COEP-005', 'Farhan Khan', '2004-07-03', 'Male', 'Khan Iqbal', 'farhan.k@gmail.com', '9876505005'),
-- BMSCE Students
('44444444-0051-0051-0051-000000000051', '100000000051', 'ABC-BMSCE-001', 'Gaurav Bhat', '2004-04-12', 'Male', 'Bhat Shyam', 'gaurav.b@gmail.com', '9876506001'),
('44444444-0052-0052-0052-000000000052', '100000000052', 'ABC-BMSCE-002', 'Harshita Reddy', '2004-10-27', 'Female', 'Reddy Venkatesh', 'harshita.r@gmail.com', '9876506002'),
('44444444-0053-0053-0053-000000000053', '100000000053', 'ABC-BMSCE-003', 'Ishaan Malhotra', '2005-03-05', 'Male', 'Malhotra Rajesh', 'ishaan.m@gmail.com', '9876506003'),
-- DTU Students
('44444444-0061-0061-0061-000000000061', '100000000061', 'ABC-DTU-001', 'Jatin Gupta', '2004-06-30', 'Male', 'Gupta Mahesh', 'jatin.g@gmail.com', '9876507001'),
('44444444-0062-0062-0062-000000000062', '100000000062', 'ABC-DTU-002', 'Kavita Sharma', '2004-11-21', 'Female', 'Sharma Dinesh', 'kavita.s@gmail.com', '9876507002'),
('44444444-0063-0063-0063-000000000063', '100000000063', 'ABC-DTU-003', 'Lakshya Verma', '2005-02-07', 'Male', 'Verma Sunil', 'lakshya.v@gmail.com', '9876507003'),
('44444444-0064-0064-0064-000000000064', '100000000064', 'ABC-DTU-004', 'Megha Agarwal', '2004-08-18', 'Female', 'Agarwal Pankaj', 'megha.a@gmail.com', '9876507004'),
('44444444-0065-0065-0065-000000000065', '100000000065', 'ABC-DTU-005', 'Nikhil Yadav', '2004-04-25', 'Male', 'Yadav Ram', 'nikhil.y@gmail.com', '9876507005'),
-- Thapar Students
('44444444-0071-0071-0071-000000000071', '100000000071', 'ABC-TPR-001', 'Ojasvi Monga', '2004-12-14', 'Female', 'Monga Sanjay', 'ojasvi.m@gmail.com', '9876508001'),
('44444444-0072-0072-0072-000000000072', '100000000072', 'ABC-TPR-002', 'Prateek Walia', '2004-09-06', 'Male', 'Walia Harpreet', 'prateek.w@gmail.com', '9876508002'),
('44444444-0073-0073-0073-000000000073', '100000000073', 'ABC-TPR-003', 'Qureshi Aisha', '2005-01-19', 'Female', 'Qureshi Salim', 'aisha.q@gmail.com', '9876508003'),
-- JNTU Students
('44444444-0081-0081-0081-000000000081', '100000000081', 'ABC-JNTU-001', 'Raghav Teja', '2004-07-08', 'Male', 'Teja Venkata', 'raghav.t@gmail.com', '9876509001'),
('44444444-0082-0082-0082-000000000082', '100000000082', 'ABC-JNTU-002', 'Sahithi Reddy', '2004-10-31', 'Female', 'Reddy Ramu', 'sahithi.r@gmail.com', '9876509002'),
('44444444-0083-0083-0083-000000000083', '100000000083', 'ABC-JNTU-003', 'Tarun Krishna', '2004-05-16', 'Male', 'Krishna Murali', 'tarun.k@gmail.com', '9876509003'),
-- Jadavpur Students
('44444444-0091-0091-0091-000000000091', '100000000091', 'ABC-JU-001', 'Udayan Ghosh', '2004-03-24', 'Male', 'Ghosh Subir', 'udayan.g@gmail.com', '9876510001'),
('44444444-0092-0092-0092-000000000092', '100000000092', 'ABC-JU-002', 'Vrinda Banerjee', '2004-11-12', 'Female', 'Banerjee Anirudh', 'vrinda.b@gmail.com', '9876510002'),
-- CET Students
('44444444-0101-0101-0101-000000000101', '100000000101', 'ABC-CET-001', 'Vivek Nambiar', '2004-08-03', 'Male', 'Nambiar Harish', 'vivek.n@gmail.com', '9876511001'),
('44444444-0102-0102-0102-000000000102', '100000000102', 'ABC-CET-002', 'Wafa Ansari', '2005-02-19', 'Female', 'Ansari Salman', 'wafa.a@gmail.com', '9876511002'),
-- Extra students for realism
('44444444-0111-0111-0111-000000000111', '100000000111', 'ABC-KEC-011', 'Xavier Paul', '2004-06-08', 'Male', 'Paul Sebastian', 'xavier.p@gmail.com', '9876512001'),
('44444444-0112-0112-0112-000000000112', '100000000112', 'ABC-KEC-012', 'Yamini Subramanian', '2004-09-27', 'Female', 'Subramanian Velu', 'yamini.s@gmail.com', '9876512002'),
('44444444-0113-0113-0113-000000000113', '100000000113', 'ABC-RVCE-006', 'Zaid Ahmed', '2004-11-14', 'Male', 'Ahmed Hassan', 'zaid.a@gmail.com', '9876512003'),
('44444444-0114-0114-0114-000000000114', '100000000114', 'ABC-VIT-006', 'Abhinav Pillai', '2004-04-29', 'Male', 'Pillai Sundar', 'abhinav.p@gmail.com', '9876512004'),
('44444444-0115-0115-0115-000000000115', '100000000115', 'ABC-PSG-006', 'Bhavani Ramalingam', '2004-07-01', 'Female', 'Ramalingam T', 'bhavani.r@gmail.com', '9876512005'),
('44444444-0116-0116-0116-000000000116', '100000000116', 'ABC-DTU-006', 'Chaitanya Singh', '2004-10-15', 'Male', 'Singh Rajender', 'chaitanya.s@gmail.com', '9876512006'),
('44444444-0117-0117-0117-000000000117', '100000000117', 'ABC-COEP-006', 'Diksha Naik', '2005-01-22', 'Female', 'Naik Praveen', 'diksha.n@gmail.com', '9876512007'),
('44444444-0118-0118-0118-000000000118', '100000000118', 'ABC-BMSCE-004', 'Esha Kumar', '2004-08-06', 'Female', 'Kumar Anand', 'esha.k@gmail.com', '9876512008'),
('44444444-0119-0119-0119-000000000119', '100000000119', 'ABC-JNTU-004', 'Faizan Siddiqui', '2004-03-17', 'Male', 'Siddiqui Mohammad', 'faizan.s@gmail.com', '9876512009'),
('44444444-0120-0120-0120-000000000120', '100000000120', 'ABC-TPR-004', 'Gunjan Kapoor', '2004-12-01', 'Female', 'Kapoor Deepak', 'gunjan.k@gmail.com', '9876512010');

-- ============================================================================
-- 5. ENROLLMENTS (Active Enrollments)
-- ============================================================================
INSERT INTO enrollments (student_id, institution_id, program_id, academic_year, roll_number, category, status, admission_date, cgpa) VALUES
-- KEC Enrollments
('44444444-0001-0001-0001-000000000001', '11111111-0001-0001-0001-000000000001', '33333333-0001-0001-0001-000000000001', '2025-2026', 'KEC/CSE/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 8.40),
('44444444-0002-0002-0002-000000000002', '11111111-0001-0001-0001-000000000001', '33333333-0001-0001-0001-000000000001', '2025-2026', 'KEC/CSE/2025/002', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 9.10),
('44444444-0003-0003-0003-000000000003', '11111111-0001-0001-0001-000000000001', '33333333-0001-0002-0002-000000000002', '2025-2026', 'KEC/IT/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 8.75),
('44444444-0004-0004-0004-000000000004', '11111111-0001-0001-0001-000000000001', '33333333-0001-0003-0003-000000000003', '2025-2026', 'KEC/ECE/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 7.80),
('44444444-0005-0005-0005-000000000005', '11111111-0001-0001-0001-000000000001', '33333333-0001-0004-0004-000000000004', '2025-2026', 'KEC/MECH/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 7.50),
('44444444-0111-0111-0111-000000000111', '11111111-0001-0001-0001-000000000001', '33333333-0001-0001-0001-000000000001', '2025-2026', 'KEC/CSE/2025/003', 'SUPERNUMERARY', 'ACTIVE', '2025-08-02', 8.90),
('44444444-0112-0112-0112-000000000112', '11111111-0001-0001-0001-000000000001', '33333333-0001-0002-0002-000000000002', '2025-2026', 'KEC/IT/2025/002', 'NRI', 'ACTIVE', '2025-08-03', 8.20),

-- PSG Tech Enrollments
('44444444-0011-0011-0011-000000000011', '11111111-0002-0002-0002-000000000002', '33333333-0002-0001-0001-000000000006', '2025-2026', 'PSG/CSE/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 9.20),
('44444444-0012-0012-0012-000000000012', '11111111-0002-0002-0002-000000000002', '33333333-0002-0001-0001-000000000006', '2025-2026', 'PSG/CSE/2025/002', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 8.60),
('44444444-0013-0013-0013-000000000013', '11111111-0002-0002-0002-000000000002', '33333333-0002-0002-0002-000000000007', '2025-2026', 'PSG/ECE/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 8.45),
('44444444-0014-0014-0014-000000000014', '11111111-0002-0002-0002-000000000002', '33333333-0002-0003-0003-000000000008', '2025-2026', 'PSG/MECH/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 7.90),
('44444444-0015-0015-0015-000000000015', '11111111-0002-0002-0002-000000000002', '33333333-0002-0004-0004-000000000009', '2025-2026', 'PSG/CIVIL/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 8.10),
('44444444-0115-0115-0115-000000000115', '11111111-0002-0002-0002-000000000002', '33333333-0002-0001-0001-000000000006', '2025-2026', 'PSG/CSE/2025/003', 'SUPERNUMERARY', 'ACTIVE', '2025-08-02', 8.75),

-- RVCE Enrollments
('44444444-0021-0021-0021-000000000021', '11111111-0013-0013-0013-000000000013', '33333333-0013-0001-0001-000000000010', '2025-2026', 'RVCE/CSE/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 9.30),
('44444444-0022-0022-0022-000000000022', '11111111-0013-0013-0013-000000000013', '33333333-0013-0001-0001-000000000010', '2025-2026', 'RVCE/CSE/2025/002', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 8.80),
('44444444-0023-0023-0023-000000000023', '11111111-0013-0013-0013-000000000013', '33333333-0013-0002-0002-000000000011', '2025-2026', 'RVCE/ISE/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 9.05),
('44444444-0024-0024-0024-000000000024', '11111111-0013-0013-0013-000000000013', '33333333-0013-0003-0003-000000000012', '2025-2026', 'RVCE/ECE/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 7.95),
('44444444-0025-0025-0025-000000000025', '11111111-0013-0013-0013-000000000013', '33333333-0013-0004-0004-000000000013', '2025-2026', 'RVCE/EEE/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 8.30),
('44444444-0113-0113-0113-000000000113', '11111111-0013-0013-0013-000000000013', '33333333-0013-0001-0001-000000000010', '2025-2026', 'RVCE/CSE/2025/003', 'NRI', 'ACTIVE', '2025-08-03', 7.80),

-- VIT Enrollments
('44444444-0031-0031-0031-000000000031', '11111111-0046-0046-0046-000000000046', '33333333-0046-0001-0001-000000000014', '2025-2026', 'VIT/CSE/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 9.50),
('44444444-0032-0032-0032-000000000032', '11111111-0046-0046-0046-000000000046', '33333333-0046-0001-0001-000000000014', '2025-2026', 'VIT/CSE/2025/002', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 8.90),
('44444444-0033-0033-0033-000000000033', '11111111-0046-0046-0046-000000000046', '33333333-0046-0002-0002-000000000015', '2025-2026', 'VIT/IT/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 8.65),
('44444444-0034-0034-0034-000000000034', '11111111-0046-0046-0046-000000000046', '33333333-0046-0003-0003-000000000016', '2025-2026', 'VIT/ECE/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 8.20),
('44444444-0035-0035-0035-000000000035', '11111111-0046-0046-0046-000000000046', '33333333-0046-0004-0004-000000000017', '2025-2026', 'VIT/MECH/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 7.70),
('44444444-0114-0114-0114-000000000114', '11111111-0046-0046-0046-000000000046', '33333333-0046-0001-0001-000000000014', '2025-2026', 'VIT/CSE/2025/003', 'NRI', 'ACTIVE', '2025-08-03', 9.10),

-- COEP Enrollments
('44444444-0041-0041-0041-000000000041', '11111111-0008-0008-0008-000000000008', '33333333-0008-0001-0001-000000000018', '2025-2026', 'COEP/COMP/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 9.40),
('44444444-0042-0042-0042-000000000042', '11111111-0008-0008-0008-000000000008', '33333333-0008-0001-0001-000000000018', '2025-2026', 'COEP/COMP/2025/002', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 8.95),
('44444444-0043-0043-0043-000000000043', '11111111-0008-0008-0008-000000000008', '33333333-0008-0002-0002-000000000019', '2025-2026', 'COEP/MECH/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 8.55),
('44444444-0044-0044-0044-000000000044', '11111111-0008-0008-0008-000000000008', '33333333-0008-0003-0003-000000000020', '2025-2026', 'COEP/CIVIL/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 8.15),
('44444444-0045-0045-0045-000000000045', '11111111-0008-0008-0008-000000000008', '33333333-0008-0001-0001-000000000018', '2025-2026', 'COEP/COMP/2025/003', 'SUPERNUMERARY', 'ACTIVE', '2025-08-02', 7.60),
('44444444-0117-0117-0117-000000000117', '11111111-0008-0008-0008-000000000008', '33333333-0008-0001-0001-000000000018', '2025-2026', 'COEP/COMP/2025/004', 'NRI', 'ACTIVE', '2025-08-03', 8.70),

-- BMSCE Enrollments
('44444444-0051-0051-0051-000000000051', '11111111-0014-0014-0014-000000000014', '33333333-0014-0001-0001-000000000021', '2025-2026', 'BMSCE/CSE/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 9.00),
('44444444-0052-0052-0052-000000000052', '11111111-0014-0014-0014-000000000014', '33333333-0014-0002-0002-000000000022', '2025-2026', 'BMSCE/ISE/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 8.45),
('44444444-0053-0053-0053-000000000053', '11111111-0014-0014-0014-000000000014', '33333333-0014-0003-0003-000000000023', '2025-2026', 'BMSCE/ECE/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 7.85),
('44444444-0118-0118-0118-000000000118', '11111111-0014-0014-0014-000000000014', '33333333-0014-0001-0001-000000000021', '2025-2026', 'BMSCE/CSE/2025/002', 'SUPERNUMERARY', 'ACTIVE', '2025-08-02', 8.60),

-- DTU Enrollments
('44444444-0061-0061-0061-000000000061', '11111111-0023-0023-0023-000000000023', '33333333-0023-0001-0001-000000000024', '2025-2026', 'DTU/CSE/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 9.20),
('44444444-0062-0062-0062-000000000062', '11111111-0023-0023-0023-000000000023', '33333333-0023-0001-0001-000000000024', '2025-2026', 'DTU/CSE/2025/002', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 8.70),
('44444444-0063-0063-0063-000000000063', '11111111-0023-0023-0023-000000000023', '33333333-0023-0002-0002-000000000025', '2025-2026', 'DTU/ECE/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 8.30),
('44444444-0064-0064-0064-000000000064', '11111111-0023-0023-0023-000000000023', '33333333-0023-0003-0003-000000000026', '2025-2026', 'DTU/MECH/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 7.95),
('44444444-0065-0065-0065-000000000065', '11111111-0023-0023-0023-000000000023', '33333333-0023-0001-0001-000000000024', '2025-2026', 'DTU/CSE/2025/003', 'NRI', 'ACTIVE', '2025-08-03', 8.50),
('44444444-0116-0116-0116-000000000116', '11111111-0023-0023-0023-000000000023', '33333333-0023-0001-0001-000000000024', '2025-2026', 'DTU/CSE/2025/004', 'SUPERNUMERARY', 'ACTIVE', '2025-08-02', 9.00),

-- Thapar Enrollments
('44444444-0071-0071-0071-000000000071', '11111111-0043-0043-0043-000000000043', '33333333-0043-0001-0001-000000000027', '2025-2026', 'TPR/CSE/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 9.15),
('44444444-0072-0072-0072-000000000072', '11111111-0043-0043-0043-000000000043', '33333333-0043-0002-0002-000000000028', '2025-2026', 'TPR/ECE/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 8.50),
('44444444-0073-0073-0073-000000000073', '11111111-0043-0043-0043-000000000043', '33333333-0043-0003-0003-000000000029', '2025-2026', 'TPR/MECH/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 7.80),
('44444444-0120-0120-0120-000000000120', '11111111-0043-0043-0043-000000000043', '33333333-0043-0001-0001-000000000027', '2025-2026', 'TPR/CSE/2025/002', 'NRI', 'ACTIVE', '2025-08-03', 8.90),

-- JNTU Enrollments
('44444444-0081-0081-0081-000000000081', '11111111-0018-0018-0018-000000000018', '33333333-0018-0001-0001-000000000030', '2025-2026', 'JNTU/CSE/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 8.60),
('44444444-0082-0082-0082-000000000082', '11111111-0018-0018-0018-000000000018', '33333333-0018-0002-0002-000000000031', '2025-2026', 'JNTU/ECE/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 8.20),
('44444444-0083-0083-0083-000000000083', '11111111-0018-0018-0018-000000000018', '33333333-0018-0003-0003-000000000032', '2025-2026', 'JNTU/EEE/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 7.90),
('44444444-0119-0119-0119-000000000119', '11111111-0018-0018-0018-000000000018', '33333333-0018-0001-0001-000000000030', '2025-2026', 'JNTU/CSE/2025/002', 'SUPERNUMERARY', 'ACTIVE', '2025-08-02', 8.40),

-- Jadavpur Enrollments
('44444444-0091-0091-0091-000000000091', '11111111-0031-0031-0031-000000000031', '33333333-0031-0001-0001-000000000033', '2025-2026', 'JU/CSE/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 9.35),
('44444444-0092-0092-0092-000000000092', '11111111-0031-0031-0031-000000000031', '33333333-0031-0002-0002-000000000034', '2025-2026', 'JU/ETCE/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 8.75),

-- CET Enrollments
('44444444-0101-0101-0101-000000000101', '11111111-0040-0040-0040-000000000040', '33333333-0040-0001-0001-000000000035', '2025-2026', 'CET/CSE/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 9.10),
('44444444-0102-0102-0102-000000000102', '11111111-0040-0040-0040-000000000040', '33333333-0040-0002-0002-000000000036', '2025-2026', 'CET/ECE/2025/001', 'APPROVED_INTAKE', 'ACTIVE', '2025-08-01', 8.55);

-- ============================================================================
-- 6. VERIFICATION LOGS (Sample audit trail)
-- ============================================================================
INSERT INTO verification_logs (verifier_id, searched_apaar_id, student_id, is_valid, client_ip) VALUES
('22222222-0050-0050-0050-000000000050', '100000000001', '44444444-0001-0001-0001-000000000001', TRUE, '203.199.182.1'),
('22222222-0050-0050-0050-000000000050', '100000000031', '44444444-0031-0031-0031-000000000031', TRUE, '203.199.182.1'),
('22222222-0051-0051-0051-000000000051', '100000000021', '44444444-0021-0021-0021-000000000021', TRUE, '125.18.14.25'),
('22222222-0051-0051-0051-000000000051', '100000000011', '44444444-0011-0011-0011-000000000011', TRUE, '125.18.14.25'),
('22222222-0052-0052-0052-000000000052', '100000000061', '44444444-0061-0061-0061-000000000061', TRUE, '59.97.183.45'),
('22222222-0052-0052-0052-000000000052', '999999999999', NULL, FALSE, '59.97.183.45'),
('22222222-0050-0050-0050-000000000050', '100000000041', '44444444-0041-0041-0041-000000000041', TRUE, '203.199.182.2'),
('22222222-0051-0051-0051-000000000051', '100000000071', '44444444-0071-0071-0071-000000000071', TRUE, '125.18.14.26'),
('22222222-0052-0052-0052-000000000052', '100000000081', '44444444-0081-0081-0081-000000000081', TRUE, '59.97.183.46'),
('22222222-0050-0050-0050-000000000050', '100000000091', '44444444-0091-0091-0091-000000000091', TRUE, '203.199.182.3'),
('22222222-0051-0051-0051-000000000051', '123456789000', NULL, FALSE, '125.18.14.27'),
('22222222-0052-0052-0052-000000000052', '100000000101', '44444444-0101-0101-0101-000000000101', TRUE, '59.97.183.47');
