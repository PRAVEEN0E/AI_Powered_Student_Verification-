'use client';

import React, { useEffect, useState } from 'react';
import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/context/AuthContext';
import { api, VerificationResponse } from '@/lib/api';
import {
  UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle, Users, Building2,
  UserPlus, AlertOctagon, RefreshCw, Loader2, Search, GraduationCap,
  ShieldCheck, X, CheckCircle2, School, ExternalLink, Award, FileCheck, FileText, Download, Eye, Printer,
  CreditCard, QrCode
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';

interface DeptStat {
  program_id: string;
  program_name: string;
  program_code: string;
  academic_year: string;
  approved_intake: number;
  supernumerary_intake: number;
  nri_quota: number;
  approved_admitted: number;
  supernumerary_admitted: number;
  nri_admitted: number;
  total_admitted: number;
}

interface EnrolledStudent {
  student_id: string;
  apaar_id: string;
  full_name: string;
  dob: string;
  gender: string;
  email?: string;
  roll_number: string;
  category: string;
  status: string;
  admission_date: string;
  program_name: string;
  program_code: string;
}

export default function CollegeDashboardPage() {
  const { session } = useAuth();
  const [departments, setDepartments] = useState<DeptStat[]>([]);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');

  // Single Student Registration Form State
  const [apaarId, setApaarId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [programId, setProgramId] = useState('');
  const [category, setCategory] = useState('APPROVED_INTAKE');
  const [rollNumber, setRollNumber] = useState('');
  const [regFeedback, setRegFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  // Bulk Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  // Verification Modal / Lookup State
  const [quickVerifyApaar, setQuickVerifyApaar] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerificationResponse | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Certificate Upload State
  const [certApaarId, setCertApaarId] = useState('');
  const [certType, setCertType] = useState('DEGREE_CERTIFICATE');
  const [certTitle, setCertTitle] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certUploading, setCertUploading] = useState(false);
  const [certFeedback, setCertFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // View Certificates Modal State
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [viewingCertStudent, setViewingCertStudent] = useState<any>(null);
  const [studentCertificates, setStudentCertificates] = useState<any[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(false);
  const [printingStudent, setPrintingStudent] = useState<EnrolledStudent | null>(null);
  const [viewingIdCardStudent, setViewingIdCardStudent] = useState<EnrolledStudent | null>(null);

  const handleUploadCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certFile) {
      setCertFeedback({ type: 'error', message: 'Please select a certificate file (PDF/Image).' });
      return;
    }
    if (!/^\d{12}$/.test(certApaarId)) {
      setCertFeedback({ type: 'error', message: 'APAAR ID must be exactly 12 numeric digits.' });
      return;
    }

    setCertUploading(true);
    setCertFeedback(null);
    const authStr = typeof window !== 'undefined' ? localStorage.getItem('apaar_auth') : null;
    const token = authStr ? JSON.parse(authStr).token : session?.token || '';

    try {
      await api.uploadStudentCertificate(token, {
        apaarId: certApaarId,
        certificateType: certType,
        title: certTitle || certType.replace(/_/g, ' '),
        file: certFile
      });
      setCertFeedback({
        type: 'success',
        message: `✅ Certificate "${certTitle || certType}" uploaded successfully for APAAR: ${certApaarId}`
      });
      setCertTitle('');
      setCertFile(null);
    } catch (err: any) {
      setCertFeedback({
        type: 'error',
        message: err?.message || 'Certificate upload failed. Please verify student APAAR ID exists.'
      });
    } finally {
      setCertUploading(false);
    }
  };

  const handleViewCertificates = async (student: EnrolledStudent) => {
    setViewingCertStudent(student);
    setIsCertModalOpen(true);
    setLoadingCerts(true);
    const authStr = typeof window !== 'undefined' ? localStorage.getItem('apaar_auth') : null;
    const token = authStr ? JSON.parse(authStr).token : session?.token || '';

    try {
      const res = await api.getStudentCertificates(token, student.apaar_id);
      setStudentCertificates(res.certificates || []);
    } catch {
      setStudentCertificates([]);
    } finally {
      setLoadingCerts(false);
    }
  };

  const handleVerifyStudent = async (targetApaarId: string) => {
    if (!/^\d{12}$/.test(targetApaarId)) {
      setVerifyError('Invalid APAAR ID! Must be exactly 12 numeric digits.');
      setVerifyResult(null);
      setIsModalOpen(true);
      return;
    }

    setVerifying(true);
    setVerifyError(null);
    setVerifyResult(null);
    setIsModalOpen(true);

    try {
      const data = await api.verifyApaarId(targetApaarId);
      if (!data.verified) {
        setVerifyError(data.message || 'Student not verified in national AICTE APAAR registry.');
      } else {
        setVerifyResult(data);
      }
    } catch {
      setVerifyError('Unable to connect to verification server. Please verify backend is active.');
    } finally {
      setVerifying(false);
    }
  };

  const fetchDeptData = () => {
    setLoading(true);
    setError(null);
    const authStr = typeof window !== 'undefined' ? localStorage.getItem('apaar_auth') : null;
    const token = authStr ? JSON.parse(authStr).token : session?.token || '';
    
    if (!token) {
      setLoading(false);
      return;
    }

    api.getInstitutionAnalytics(token)
      .then((res: any) => {
        setDepartments(res.departments || []);
        setLoading(false);
        if (res.departments?.length > 0) {
          setProgramId(res.departments[0].program_id);
        }
      })
      .catch((err: any) => {
        setError('Could not load department data. Make sure you are logged in as a College Admin.');
        setLoading(false);
      });
  };

  const fetchStudents = (query?: string) => {
    setStudentsLoading(true);
    const authStr = typeof window !== 'undefined' ? localStorage.getItem('apaar_auth') : null;
    const token = authStr ? JSON.parse(authStr).token : session?.token || '';

    if (!token) {
      setStudentsLoading(false);
      return;
    }

    api.getStudents(token, query)
      .then((res: any) => {
        setStudents(res.students || []);
      })
      .catch((err) => {
        console.error('Failed to fetch students:', err);
      })
      .finally(() => {
        setStudentsLoading(false);
      });
  };

  useEffect(() => {
    fetchDeptData();
    fetchStudents();
  }, [session]);

  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegFeedback(null);
    setRegLoading(true);

    if (!/^\d{12}$/.test(apaarId)) {
      setRegFeedback({ type: 'error', message: 'Invalid APAAR ID! Must be exactly 12 numeric digits.' });
      setRegLoading(false);
      return;
    }

    const authStr = typeof window !== 'undefined' ? localStorage.getItem('apaar_auth') : null;
    const token = authStr ? JSON.parse(authStr).token : session?.token || '';

    try {
      const res = await api.admitStudent(token, {
        apaarId,
        fullName: studentName,
        dob,
        gender,
        programId,
        category,
        rollNumber,
        admissionDate: new Date().toISOString().slice(0, 10),
      });
      setRegFeedback({
        type: 'success',
        message: `✅ ${studentName} (APAAR: ${apaarId}) successfully enrolled under ${category}. Enrollment ID: ${res.enrollmentId}`
      });
      setApaarId('');
      setStudentName('');
      setDob('');
      setRollNumber('');
      fetchDeptData(); // refresh dept stats
      fetchStudents(); // refresh student directory
    } catch (err: any) {
      const msg = err?.message || 'Enrollment failed.';
      setRegFeedback({ type: 'error', message: `❌ ${msg}` });
    } finally {
      setRegLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const authStr = typeof window !== 'undefined' ? localStorage.getItem('apaar_auth') : null;
    const token = authStr ? JSON.parse(authStr).token : session?.token || '';
    try {
      const res = await api.uploadBulkCsv(token, selectedFile);
      setUploadStatus({
        success: true,
        message: res.message || 'File processed successfully',
        details: {
          total: res.summary?.totalRecords,
          successful: res.summary?.admittedCount,
          rejected: res.summary?.rejectedCount,
          errors: res.errors?.map((e: any) => `Row ${e.row}: ${e.error}`) || []
        }
      });
      fetchDeptData();
      fetchStudents();
    } catch (err: any) {
      setUploadStatus({
        success: false,
        message: err?.message || 'Upload failed. Please check the CSV format.',
        details: { errors: [] }
      });
    }
  };

  const chartData = departments.map(d => ({
    name: d.program_code,
    'Approved Intake': d.approved_intake,
    'Total Admitted': d.total_admitted,
    'Vacancy': Math.max(0, d.approved_intake - d.total_admitted),
  }));

  return (
    <RoleGuard allowedRoles={['COLLEGE_ADMIN']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Institutional Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              <span>College Admin Portal — AICTE Compliance Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {session?.user?.institutionName || 'Institution Portal'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {session?.user?.aicteCode && (
                <>AICTE Permanent ID: <strong className="font-mono text-slate-700">{session.user.aicteCode}</strong> • </>
              )}
              Academic Year: 2025-2026
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { fetchDeptData(); fetchStudents(); }}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-full">
              AICTE Compliance: Active
            </span>
          </div>
        </div>

        {/* Quick APAAR Student Record Verification Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Instant Student Verification</span>
              </div>
              <h2 className="text-xl font-bold">National APAAR Registry Verification</h2>
              <p className="text-xs text-blue-200 mt-1 max-w-xl">
                Verify student academic credentials, ABC Account link, previous college enrollments, and graduation status directly from AICTE records.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyStudent(quickVerifyApaar);
              }}
              className="flex items-center gap-2 w-full md:w-auto"
            >
              <input
                type="text"
                maxLength={12}
                value={quickVerifyApaar}
                onChange={(e) => setQuickVerifyApaar(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 12-digit APAAR ID"
                className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300 text-xs font-mono focus:ring-2 focus:ring-emerald-400 focus:outline-none w-full md:w-60"
              />
              <button
                type="submit"
                disabled={verifying}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
              >
                {verifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                Verify Record
              </button>
            </form>
          </div>
        </div>

        {/* Department Quota Table — Live from DB */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Department Intake Quota vs. Actual Enrollment (Live)</h3>
            <span className="text-xs text-slate-400">Real-time from Database</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-slate-400 text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading department data...
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500 text-sm">
              <AlertCircle className="w-6 h-6 mx-auto mb-2" />
              {error}
            </div>
          ) : departments.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">No programs found for this institution.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3">Code</th>
                    <th className="px-5 py-3">Department Name</th>
                    <th className="px-5 py-3">Approved Intake</th>
                    <th className="px-5 py-3">Supernumerary</th>
                    <th className="px-5 py-3">NRI Quota</th>
                    <th className="px-5 py-3">Total Enrolled</th>
                    <th className="px-5 py-3">Vacancy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departments.map((d) => {
                    const vacancy = d.approved_intake - d.total_admitted;
                    const pct = Math.round((d.total_admitted / d.approved_intake) * 100);
                    return (
                      <tr key={d.program_id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-800">{d.program_code}</td>
                        <td className="px-5 py-3.5 font-medium text-slate-700">{d.program_name}</td>
                        <td className="px-5 py-3.5 font-mono">{d.approved_intake}</td>
                        <td className="px-5 py-3.5 font-mono">{d.supernumerary_intake}</td>
                        <td className="px-5 py-3.5 font-mono">{d.nri_quota}</td>
                        <td className="px-5 py-3.5">
                          <span className={`font-mono font-bold ${pct >= 100 ? 'text-red-600' : 'text-blue-600'}`}>
                            {d.total_admitted}
                          </span>
                          <span className="text-slate-400 ml-1">({pct}%)</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            vacancy <= 0
                              ? 'bg-red-100 text-red-700'
                              : vacancy <= 5
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {vacancy <= 0 ? 'Full' : `${vacancy} seats`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bar Chart */}
        {!loading && departments.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Intake vs. Enrollment Overview</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={4}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Approved Intake" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Total Admitted" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Single Student Admission Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-600" />
              <span>Admit Student (Instant Compliance Check)</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Real-time validation: 12-digit APAAR, quota cap, cross-college duplicate detection.
            </p>

            {regFeedback && (
              <div className={`mb-4 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                regFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {regFeedback.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertOctagon className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                )}
                <span>{regFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleRegisterStudent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">12-Digit APAAR ID</label>
                <input
                  type="text"
                  maxLength={12}
                  value={apaarId}
                  onChange={(e) => setApaarId(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 100000000001"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Student Full Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Ananya Krishnan"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Program</label>
                  <select
                    value={programId}
                    onChange={(e) => setProgramId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    {departments.map(d => (
                      <option key={d.program_id} value={d.program_id}>
                        {d.program_code} — {d.program_name.slice(0, 30)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="APPROVED_INTAKE">Approved Intake</option>
                    <option value="SUPERNUMERARY">Supernumerary</option>
                    <option value="NRI">NRI Quota</option>
                    <option value="TFW">TFW</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Roll Number</label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. KEC/CSE/2025/099"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2"
              >
                {regLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                {regLoading ? 'Validating & Registering...' : 'Validate & Register Admission'}
              </button>
            </form>
          </div>

          {/* Bulk Upload CSV */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span>Bulk CSV Student Enrollment</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Batch ingest admissions with automated duplicate rejection and compliance audit.
              </p>

              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Choose CSV batch file</p>
                <p className="text-[10px] text-slate-400 mt-1">Format: apaar_id, full_name, dob, gender, roll_number, category</p>
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  className="hidden"
                  id="batch-file"
                />
                <label
                  htmlFor="batch-file"
                  className="mt-3 inline-block bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer shadow-sm"
                >
                  {selectedFile ? selectedFile.name : 'Select admissions.csv'}
                </label>
              </div>

              {selectedFile && (
                <button
                  onClick={handleUpload}
                  className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-xl text-xs transition"
                >
                  Run Compliance Batch Audit
                </button>
              )}
            </div>

            {uploadStatus && (
              <div className={`mt-4 p-3 rounded-xl text-xs border ${uploadStatus.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
                <div className="flex items-center gap-2 font-semibold">
                  {uploadStatus.success ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertOctagon className="w-4 h-4 text-red-600" />}
                  <span>{uploadStatus.message}</span>
                </div>
                {uploadStatus.details?.errors?.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-red-600 space-y-1">
                    {uploadStatus.details.errors.map((err: string, i: number) => (
                      <p key={i}>⚠️ {err}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Student Certificate & Academic Document Upload Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  <span>Student Certificate & Document Vault Upload</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload official academic certificates (Degree, Marksheet, Provisional, TC) linked to student APAAR ID.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 self-start sm:self-auto">
                AICTE Academic Repository
              </span>
            </div>

            {certFeedback && (
              <div className={`mb-4 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                certFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {certFeedback.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertOctagon className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                )}
                <span>{certFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleUploadCertificate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Student APAAR ID</label>
                <input
                  type="text"
                  maxLength={12}
                  value={certApaarId}
                  onChange={(e) => setCertApaarId(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 987654321012"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Certificate Type</label>
                <select
                  value={certType}
                  onChange={(e) => setCertType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="DEGREE_CERTIFICATE">Degree Certificate</option>
                  <option value="PROVISIONAL_CERTIFICATE">Provisional Certificate</option>
                  <option value="MARKSHEET_HSC">12th / HSC Marksheet</option>
                  <option value="MARKSHEET_SEMESTER">Consolidated Semester Marksheet</option>
                  <option value="TRANSFER_CERTIFICATE">Transfer Certificate (TC)</option>
                  <option value="MIGRATION_CERTIFICATE">Migration Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Document Title / Label</label>
                <input
                  type="text"
                  value={certTitle}
                  onChange={(e) => setCertTitle(e.target.value)}
                  placeholder="e.g. B.Tech Degree Certificate (2025)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Select PDF or Image</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="cert-file-input"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setCertFile(e.target.files ? e.target.files[0] : null)}
                    className="hidden"
                  />
                  <label
                    htmlFor="cert-file-input"
                    className="flex-1 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-700 truncate cursor-pointer text-center font-medium"
                  >
                    {certFile ? certFile.name : 'Choose File...'}
                  </label>
                  <button
                    type="submit"
                    disabled={certUploading || !certFile}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                  >
                    {certUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                    <span>Upload</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Live Enrolled Students Directory */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span>Live Enrolled Students Directory</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time active student registrations authenticated via national APAAR registry.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search name, APAAR or roll..."
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    fetchStudents(e.target.value);
                  }}
                  className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none w-56 font-mono"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                {students.length} Enrolled
              </span>
            </div>
          </div>

          {studentsLoading ? (
            <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs">Loading registered students...</span>
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-600">No students found matching your criteria</p>
              <p className="text-slate-400 mt-1">Enroll a student above using their 12-digit APAAR ID.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="px-6 py-3.5">Roll Number</th>
                    <th className="px-6 py-3.5">Student Name</th>
                    <th className="px-6 py-3.5">APAAR ID</th>
                    <th className="px-6 py-3.5">Program / Branch</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => (
                    <tr key={s.student_id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-3.5 font-mono font-bold text-slate-900">{s.roll_number}</td>
                      <td className="px-6 py-3.5 font-semibold text-slate-800">{s.full_name}</td>
                      <td className="px-6 py-3.5 font-mono text-blue-700 font-semibold">{s.apaar_id}</td>
                      <td className="px-6 py-3.5 text-slate-600">{s.program_name}</td>
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {s.category}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setViewingIdCardStudent(s)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 rounded-lg font-semibold text-[11px] transition"
                          title="Generate & Download Digital APAAR ID Card (EduPass)"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-blue-700" />
                          <span>EduPass Card</span>
                        </button>
                        <button
                          onClick={() => setPrintingStudent(s)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg font-semibold text-[11px] transition"
                          title="Generate & Print Degree Certificate with APAAR ID"
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-700" />
                          <span>Print Degree</span>
                        </button>
                        <button
                          onClick={() => handleViewCertificates(s)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-semibold text-[11px] transition"
                          title="View / Download Student Certificates"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Certificates</span>
                        </button>
                        <button
                          onClick={() => handleVerifyStudent(s.apaar_id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-semibold text-[11px] transition"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>Verify</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Real-Time Student Verification Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-sm tracking-wide">National AICTE APAAR Student Verification</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {verifying && (
                  <div className="py-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="font-semibold text-sm">Querying National APAAR Registry...</p>
                    <p className="text-xs text-slate-400 mt-1">Cross-referencing ABC Account and enrollment records</p>
                  </div>
                )}

                {verifyError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Verification Failed</p>
                      <p className="mt-0.5">{verifyError}</p>
                    </div>
                  </div>
                )}

                {verifyResult && verifyResult.verified && (
                  <div className="space-y-5">
                    {/* Verified Status Banner */}
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <div>
                          <p className="font-bold text-emerald-900 text-sm">{verifyResult.fullName}</p>
                          <p className="text-xs text-emerald-700 font-mono">APAAR ID: {verifyResult.apaarId}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-200 text-emerald-900 rounded-full font-bold text-[10px] uppercase tracking-wider">
                        AICTE Verified
                      </span>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">ABC Account ID</span>
                        <span className="font-mono font-bold text-slate-800">{verifyResult.abcAccountId || 'Active Linked'}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Verified Date</span>
                        <span className="font-medium text-slate-800">
                          {verifyResult.verificationTimestamp ? new Date(verifyResult.verificationTimestamp).toLocaleDateString() : 'Today'}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Enrollments Logged</span>
                        <span className="font-bold text-blue-600">{verifyResult.enrollments?.length || 1} Institution(s)</span>
                      </div>
                    </div>

                    {/* Enrollments History */}
                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-500 mb-2.5 flex items-center gap-1.5">
                        <School className="w-3.5 h-3.5 text-blue-600" />
                        <span>Institution & Degree Enrollment History</span>
                      </h4>

                      <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                        {verifyResult.enrollments && verifyResult.enrollments.map((enr) => (
                          <div key={enr.enrollmentId} className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">{enr.institutionName}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                                {enr.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                              <span><strong>Program:</strong> {enr.programName} ({enr.degreeLevel})</span>
                              <span><strong>Year:</strong> {enr.academicYear}</span>
                              <span><strong>AICTE Code:</strong> <span className="font-mono">{enr.aicteCode}</span></span>
                              {enr.cgpa && <span><strong>CGPA:</strong> {enr.cgpa} / 10.0</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">Digitally signed by AICTE National Gateway</span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student Certificates & Document Vault Modal */}
        {isCertModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="font-bold text-sm tracking-wide">
                      Academic Documents — {viewingCertStudent?.full_name}
                    </h3>
                    <p className="text-[11px] text-slate-300 font-mono">APAAR ID: {viewingCertStudent?.apaar_id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCertModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                {loadingCerts ? (
                  <div className="py-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
                    <p className="font-semibold text-xs">Loading verified student certificates...</p>
                  </div>
                ) : studentCertificates.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-sm">No certificates uploaded yet</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Use the &quot;Student Certificate &amp; Document Vault Upload&quot; form above with APAAR{' '}
                      <strong className="font-mono text-slate-600">{viewingCertStudent?.apaar_id}</strong> to upload one.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {studentCertificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-300 transition"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                            <FileCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{cert.title}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Type: <span className="font-semibold text-slate-700">{cert.certificate_type.replace(/_/g, ' ')}</span> • {cert.file_name}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Uploaded: {new Date(cert.uploaded_at).toLocaleDateString()} • {cert.institution_name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {cert.file_data && (
                            <>
                              <a
                                href={cert.file_data}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-600" />
                                <span>Preview</span>
                              </a>
                              <a
                                href={cert.file_data}
                                download={cert.file_name}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">Encrypted institutional document storage</span>
                <button
                  onClick={() => setIsCertModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Requirement 10: Official Degree Certificate with APAAR ID & Institutional Roll ID */}
        {printingStudent && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8">
              {/* Modal Toolbar (hidden when printing) */}
              <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-xs uppercase tracking-wider text-amber-300">
                    Official Degree Certificate Preview (AICTE Requirement 10)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg text-xs shadow transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Save as PDF</span>
                  </button>
                  <button
                    onClick={() => setPrintingStudent(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Printable Document Container */}
              <div className="p-8 sm:p-12 bg-white text-slate-900 font-serif border-[12px] border-double border-amber-800/80 m-4 sm:m-6 rounded-lg relative overflow-hidden shadow-inner">
                {/* AICTE Watermark Background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                  <ShieldCheck className="w-[450px] h-[450px] text-slate-900" />
                </div>

                {/* Certificate Header */}
                <div className="text-center space-y-2 border-b-2 border-amber-800/40 pb-6 mb-8">
                  <div className="flex items-center justify-center gap-3">
                    <div className="p-2.5 bg-amber-100 rounded-full text-amber-800">
                      <GraduationCap className="w-8 h-8" />
                    </div>
                  </div>
                  <h2 className="text-sm font-sans font-bold uppercase tracking-widest text-slate-500">
                    All India Council for Technical Education (AICTE)
                  </h2>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase tracking-tight">
                    {session?.user?.institutionName || 'AICTE Approved Institution'}
                  </h1>
                  <p className="text-xs font-sans text-slate-500">
                    AICTE Permanent Institute Code: <span className="font-mono font-bold text-slate-800">{session?.user?.aicteCode || '1-432891901'}</span>
                  </p>
                </div>

                {/* National Academic Identity Badges (Requirement 10 Core) */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-amber-50/70 border border-amber-200 rounded-xl p-4 font-sans mb-8">
                  <div className="text-center sm:text-left">
                    <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">National Academic Identifier</p>
                    <p className="text-base font-extrabold font-mono text-blue-800 mt-0.5 tracking-wider">
                      APAAR ID: {printingStudent.apaar_id}
                    </p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">Institutional Student ID</p>
                    <p className="text-base font-extrabold font-mono text-slate-900 mt-0.5 tracking-wider">
                      ROLL NO: {printingStudent.roll_number}
                    </p>
                  </div>
                </div>

                {/* Certificate Body Text */}
                <div className="text-center space-y-6 max-w-2xl mx-auto py-4">
                  <p className="text-base italic text-slate-600">
                    This is to formally certify that
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-wide font-serif underline decoration-amber-600/40 underline-offset-8">
                    {printingStudent.full_name}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed font-sans">
                    having successfully completed the prescribed curriculum and fulfilled all academic requirements has been duly awarded the degree of
                  </p>
                  <p className="text-xl sm:text-2xl font-extrabold text-blue-900 uppercase tracking-wide font-sans">
                    {printingStudent.program_name}
                  </p>
                  <p className="text-xs text-slate-500 font-sans">
                    Seat Category: <span className="font-semibold text-slate-700">{printingStudent.category.replace(/_/g, ' ')}</span> • Academic Year: <span className="font-semibold text-slate-700">2025-2026</span>
                  </p>
                </div>

                {/* Footer Signatures & QR Code */}
                <div className="pt-10 mt-8 border-t border-amber-800/20 grid grid-cols-3 items-end text-center font-sans">
                  <div>
                    <div className="h-10 flex items-center justify-center">
                      <span className="font-serif italic text-sm text-slate-700 font-bold">Controller of Exams</span>
                    </div>
                    <div className="border-t border-slate-400 mt-2 pt-1 text-[11px] font-semibold text-slate-500">
                      Controller of Examinations
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="p-1.5 bg-white border border-slate-300 rounded-lg shadow-sm">
                      {/* Stylized QR placeholder with APAAR ID embedded */}
                      <ShieldCheck className="w-10 h-10 text-emerald-600" />
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono mt-1">AICTE Digital Seal</span>
                  </div>

                  <div>
                    <div className="h-10 flex items-center justify-center">
                      <span className="font-serif italic text-sm text-slate-700 font-bold">Principal / Dean</span>
                    </div>
                    <div className="border-t border-slate-400 mt-2 pt-1 text-[11px] font-semibold text-slate-500">
                      Head of the Institution
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Digital APAAR Student ID Card ("EduPass" Wallet Card) */}
        {viewingIdCardStudent && (
          <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Card Actions Bar */}
              <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-xs uppercase tracking-wider text-blue-200">
                    AICTE Digital EduPass Card
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Card</span>
                  </button>
                  <button
                    onClick={() => setViewingIdCardStudent(null)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Physical Card Simulation (Aadhaar / Driving License Spec) */}
              <div className="p-6 bg-slate-100 flex justify-center">
                <div className="w-full max-w-[360px] bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-xl border-2 border-amber-400/50 relative overflow-hidden">
                  {/* Subtle Background Watermark */}
                  <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
                    <ShieldCheck className="w-48 h-48 text-white" />
                  </div>

                  {/* Top Bar: National AICTE Emblem */}
                  <div className="flex items-center justify-between border-b border-white/20 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-slate-900 font-extrabold text-xs shadow">
                        🇮🇳
                      </div>
                      <div>
                        <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-amber-300">
                          AICTE National EduPass
                        </h4>
                        <p className="text-[9px] text-slate-300">Ministry of Education, Govt of India</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold">
                      VERIFIED
                    </span>
                  </div>

                  {/* Card Content Grid */}
                  <div className="flex gap-4 items-center mb-4">
                    {/* Student Photo Placeholder */}
                    <div className="w-20 h-24 rounded-xl bg-slate-800 border-2 border-white/30 flex flex-col items-center justify-center shrink-0 shadow-inner">
                      <Users className="w-9 h-9 text-slate-400 mb-1" />
                      <span className="text-[8px] text-slate-400 font-mono uppercase">Student</span>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <h3 className="font-extrabold text-white text-base leading-tight truncate">
                        {viewingIdCardStudent.full_name}
                      </h3>
                      <p className="text-[11px] text-blue-200 font-medium truncate">
                        {viewingIdCardStudent.program_name}
                      </p>
                      <p className="text-[10px] text-slate-300">
                        Roll: <span className="font-mono font-bold text-white">{viewingIdCardStudent.roll_number}</span>
                      </p>
                      <p className="text-[10px] text-slate-300">
                        Inst: <span className="text-white font-medium">{session?.user?.institutionName || 'AICTE Institution'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Bold APAAR ID Banner */}
                  <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-center mb-3">
                    <p className="text-[8px] uppercase tracking-widest text-slate-400 font-semibold">
                      One Nation, One Student ID (APAAR)
                    </p>
                    <p className="font-mono text-base font-extrabold text-amber-300 tracking-widest mt-0.5">
                      {viewingIdCardStudent.apaar_id.replace(/(\d{4})/g, '$1 ').trim()}
                    </p>
                  </div>

                  {/* Card Footer: Security chip & verification prompt */}
                  <div className="flex items-center justify-between text-[9px] text-slate-300 border-t border-white/10 pt-2">
                    <span className="font-mono">DOB: {viewingIdCardStudent.dob || '2004-05-18'}</span>
                    <span className="font-mono text-amber-200">Tamper-Proof NFC/QR Protected</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-medium">
                  Valid across all institutions &amp; public sector verification gateways
                </span>
                <button
                  onClick={() => setViewingIdCardStudent(null)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
