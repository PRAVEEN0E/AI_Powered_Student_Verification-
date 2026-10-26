'use client';

import React, { useState } from 'react';
import { api, VerificationResponse } from '@/lib/api';
import {
  Search, ShieldCheck, AlertCircle, Award, Calendar, School, CheckCircle2, FileText,
  UploadCloud, BookOpen, Layers, Check, X, Loader2, Sparkles, Building2
} from 'lucide-react';

export default function VerifyPage() {
  const [apaarId, setApaarId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'SINGLE' | 'BATCH' | 'DIGILOCKER'>('SINGLE');
  const [selectedPreviewCert, setSelectedPreviewCert] = useState<any | null>(null);

  // Batch Verification State (Recruiter TCS/Zoho feature)
  const [batchInput, setBatchInput] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResult, setBatchResult] = useState<any | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);

  // DigiLocker & ABC Credits Sandbox State
  const [digiApaarId, setDigiApaarId] = useState('');
  const [digiLoading, setDigiLoading] = useState(false);
  const [digiResult, setDigiResult] = useState<any | null>(null);
  const [digiError, setDigiError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{12}$/.test(apaarId)) {
      setError('Please enter a valid 12-digit APAAR ID.');
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.verifyApaarId(apaarId);
      if (!data.verified) {
        setError(data.message || 'Student not found or unverified in AICTE records.');
      } else {
        setResult(data);
      }
    } catch {
      setError('Unable to connect to verification server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBatchError(null);
    setBatchResult(null);

    const ids = batchInput
      .split(/[\n,;\s]+/)
      .map(id => id.trim())
      .filter(id => id.length > 0);

    if (ids.length === 0) {
      setBatchError('Please enter at least one 12-digit APAAR ID.');
      return;
    }

    setBatchLoading(true);
    try {
      const res = await api.verifyBatch(ids);
      setBatchResult(res);
    } catch (err: any) {
      setBatchError(err?.message || 'Failed to process batch verification.');
    } finally {
      setBatchLoading(false);
    }
  };

  const handleDigiLockerFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{12}$/.test(digiApaarId)) {
      setDigiError('Please enter a valid 12-digit APAAR ID.');
      return;
    }

    setDigiLoading(true);
    setDigiError(null);
    setDigiResult(null);

    try {
      const res = await api.getDigiLockerRecord(digiApaarId);
      setDigiResult(res);
    } catch (err: any) {
      setDigiError(err?.message || 'No DigiLocker / ABC record linked with this APAAR ID.');
    } finally {
      setDigiLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Title & Description */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-blue-50 text-blue-600 rounded-full mb-3">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          AICTE APAAR ID Verification Portal
        </h1>
        <p className="mt-2 text-slate-600 max-w-xl mx-auto text-sm">
          Instant student authentication and degree validation for employers (e.g., Zoho, Startups) and accredited institutions.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 text-xs font-semibold gap-1.5 border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('SINGLE')}
          className={`flex-1 py-3 px-3 rounded-xl flex items-center justify-center gap-2 font-bold transition ${
            activeTab === 'SINGLE'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Single APAAR Verification</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('BATCH')}
          className={`flex-1 py-3 px-3 rounded-xl flex items-center justify-center gap-2 font-bold transition ${
            activeTab === 'BATCH'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Recruiter Batch Verification (TCS/Zoho)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DIGILOCKER')}
          className={`flex-1 py-3 px-3 rounded-xl flex items-center justify-center gap-2 font-bold transition ${
            activeTab === 'DIGILOCKER'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span>DigiLocker &amp; ABC Credits Sandbox</span>
        </button>
      </div>

      {/* Tab 1: Single Student APAAR Verification */}
      {activeTab === 'SINGLE' && (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8">
            <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                maxLength={12}
                value={apaarId}
                onChange={(e) => setApaarId(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 12-digit APAAR ID (e.g., 987654321012)"
                className="w-full pl-11 pr-4 py-3.5 text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-base"
                required
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-7 py-3.5 rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                'Verify Student'
              )}
            </button>
          </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Verification Alert</p>
              <p>{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Verification Result Card */}
      {result && result.verified && (
        <div className="bg-white border border-emerald-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>AICTE Verified Academic Profile</span>
            </div>
            <span className="text-xs bg-emerald-200 text-emerald-800 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Authentic Record
            </span>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-100 pb-6">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Student Name</p>
                <p className="text-lg font-bold text-slate-800 mt-1">{result.fullName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">APAAR ID</p>
                <p className="text-lg font-mono font-bold text-blue-600 mt-1">{result.apaarId}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ABC Account ID</p>
                <p className="text-lg font-mono text-slate-700 mt-1">{result.abcAccountId || 'Linked'}</p>
              </div>
            </div>

            {/* Institution & Enrollments */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <School className="w-4 h-4 text-blue-600" />
                <span>Institutional Enrollments</span>
              </h3>

              <div className="space-y-4">
                {result.enrollments && result.enrollments.map((enr) => (
                  <div key={enr.enrollmentId} className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-3 mb-3">
                      <div>
                        <h4 className="font-bold text-slate-800 text-base">{enr.institutionName}</h4>
                        <p className="text-xs text-slate-500">AICTE Code: {enr.aicteCode} • State: {enr.state}</p>
                      </div>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 self-start md:self-auto">
                        Status: {enr.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-slate-400">Program / Degree</p>
                        <p className="font-semibold text-slate-700 mt-0.5">{enr.programName} ({enr.degreeLevel})</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Academic Year</p>
                        <p className="font-semibold text-slate-700 mt-0.5">{enr.academicYear}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">CGPA / Score</p>
                        <p className="font-semibold text-slate-700 mt-0.5">{enr.cgpa ? `${enr.cgpa} / 10.0` : 'In Progress'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Degree Status</p>
                        <p className="font-semibold text-emerald-600 mt-0.5">
                          {enr.degreeAwarded ? 'Degree Conferred' : 'Enrolled Student'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Student Certificates & Documents Vault */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Verified Credentials &amp; Certificates</span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full lowercase">
                    {result.certificates && result.certificates.length > 0 ? `${result.certificates.length} available` : '0 available'}
                  </span>
                </h3>
              </div>

              {result.certificates && result.certificates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {result.certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-300 hover:shadow-sm transition"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{cert.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Category: <span className="font-semibold text-slate-700">{cert.certificateType.replace(/_/g, ' ')}</span>
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            Issued By: {cert.institutionName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {cert.fileName} • {Math.round(cert.fileSize / 1024)} KB
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                        <span className="text-[10px] text-slate-400">
                          {new Date(cert.uploadedAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          {cert.fileData && (
                            <>
                              <button
                                type="button"
                                onClick={() => setSelectedPreviewCert(cert)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition"
                              >
                                <span>Preview</span>
                              </button>
                              <a
                                href={cert.fileData}
                                download={cert.fileName}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                              >
                                <span>Download</span>
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center">
                  <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700 text-xs">No uploaded document certificates for this student yet.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Colleges can upload degree certificates, mark sheets, and provisional certificates from the College Dashboard.
                  </p>
                </div>
              )}
            </div>

            <div className="text-xs text-slate-400 pt-2 flex items-center justify-between border-t border-slate-100">
              <span>Timestamp: {result.verificationTimestamp}</span>
              <span className="flex items-center gap-1 text-slate-500">
                <FileText className="w-3.5 h-3.5" />
                Digitally authenticated via AICTE National DB
              </span>
            </div>
          </div>
        </div>
      )}
      </>
      )}

      {/* Tab 2: Recruiter Batch Verification (TCS, Zoho, Infosys bulk verifier) */}
      {activeTab === 'BATCH' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Enterprise Recruiter Batch Verification</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Designed for corporate recruitment drives (e.g., Zoho, TCS, Infosys). Paste up to 50 candidate APAAR IDs to authenticate enrollment records simultaneously.
                </p>
              </div>
            </div>

            <form onSubmit={handleBatchVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                  Paste 12-digit APAAR IDs (comma, space, or newline separated)
                </label>
                <textarea
                  rows={4}
                  value={batchInput}
                  onChange={(e) => setBatchInput(e.target.value)}
                  placeholder="987654321012, 111122223333, 999988887777&#10;888877776666"
                  className="w-full p-3.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Batch limit: 50 candidates per query
                </span>
                <button
                  type="submit"
                  disabled={batchLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {batchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                  <span>Run Batch Authenticity Check</span>
                </button>
              </div>
            </form>

            {batchError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{batchError}</span>
              </div>
            )}
          </div>

          {/* Batch Verification Results Table */}
          {batchResult && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-200">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-slate-800 text-sm">Batch Authenticity Audit Report</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg">
                    {batchResult.verifiedCount} Authentic
                  </span>
                  <span className="px-2.5 py-1 bg-red-100 text-red-800 font-bold rounded-lg">
                    {batchResult.unverifiedCount} Unverified
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg">
                    Total: {batchResult.total}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="px-5 py-3">Candidate / APAAR</th>
                      <th className="px-5 py-3">Institution</th>
                      <th className="px-5 py-3">Program</th>
                      <th className="px-5 py-3">Score / CGPA</th>
                      <th className="px-5 py-3 text-right">Authenticity Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {batchResult.results.map((r: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3 font-semibold text-slate-800">
                          <div>{r.fullName || 'Unknown Candidate'}</div>
                          <div className="font-mono text-[11px] text-blue-600">{r.maskedApaarId}</div>
                        </td>
                        <td className="px-5 py-3 text-slate-600 font-medium">
                          {r.institutionName || '—'}
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {r.programName || '—'}
                        </td>
                        <td className="px-5 py-3 font-mono">
                          {r.cgpa ? `${r.cgpa} / 10.0` : '—'}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {r.verified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-lg text-[11px]">
                              <Check className="w-3 h-3 text-emerald-600" />
                              VERIFIED AICTE RECORD
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 font-bold rounded-lg text-[11px]">
                              <X className="w-3 h-3 text-red-600" />
                              RECORD NOT FOUND
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: DigiLocker & ABC Credits Sandbox */}
      {activeTab === 'DIGILOCKER' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">National Academic Bank of Credits (ABC) &amp; DigiLocker Gateway</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Compliant with NEP 2020 National Credit Framework (NCrF). Query official student credit balances, minimum degree credit compliance, and DigiLocker digital credentials.
                </p>
              </div>
            </div>

            <form onSubmit={handleDigiLockerFetch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={12}
                  value={digiApaarId}
                  onChange={(e) => setDigiApaarId(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 12-digit APAAR ID for ABC credit query"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              </div>
              <button
                type="submit"
                disabled={digiLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {digiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Fetch National ABC Ledger</span>
              </button>
            </form>

            {digiError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{digiError}</span>
              </div>
            )}
          </div>

          {/* DigiLocker Result Card */}
          {digiResult && (
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl shadow-xl border border-indigo-400/30 p-6 md:p-8 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-400/30">
                    ABC
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Academic Bank of Credits Ledger (Govt. of India)</h3>
                    <p className="text-xs text-indigo-300 font-mono">DigiLocker Doc ID: {digiResult.academicBankOfCredits.digiLockerDocId}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold font-mono">
                  NCrF NEP-2020 ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Candidate Name</p>
                  <p className="text-base font-bold text-white mt-1">{digiResult.student.fullName}</p>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">APAAR: {digiResult.student.apaarId}</p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Accumulated Credits</p>
                  <p className="text-2xl font-extrabold text-amber-300 mt-0.5 font-mono">
                    {digiResult.academicBankOfCredits.totalAccumulatedCredits} / 160
                  </p>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                    {digiResult.academicBankOfCredits.creditStatus}
                  </p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">ABC Account Identity</p>
                  <p className="text-base font-mono font-bold text-blue-300 mt-1">{digiResult.student.abcAccountId}</p>
                  <p className="text-xs text-slate-300 mt-0.5 truncate">{digiResult.student.institutionName}</p>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-xs text-slate-300 flex items-center justify-between">
                <span>{digiResult.academicBankOfCredits.curriculumFramework}</span>
                <span className="text-emerald-400 font-semibold font-mono">Cryptographically Validated</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Certificate Preview Modal */}
      {selectedPreviewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>{selectedPreviewCert.title}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedPreviewCert.institutionName} • {selectedPreviewCert.certificateType.replace(/_/g, ' ')}
                </p>
              </div>
              <button
                onClick={() => setSelectedPreviewCert(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-100">
              {selectedPreviewCert.mimeType?.startsWith('image/') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedPreviewCert.fileData}
                  alt={selectedPreviewCert.title}
                  className="max-h-[60vh] max-w-full rounded-lg shadow-sm object-contain"
                />
              ) : selectedPreviewCert.mimeType === 'application/pdf' ? (
                <iframe
                  src={selectedPreviewCert.fileData}
                  title={selectedPreviewCert.title}
                  className="w-full h-[60vh] rounded-lg border border-slate-300"
                />
              ) : (
                <div className="text-center p-8 bg-white rounded-xl shadow-sm">
                  <FileText className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                  <p className="font-semibold text-slate-800 text-sm">{selectedPreviewCert.fileName}</p>
                  <p className="text-xs text-slate-400 mt-1">Preview not available for this file type.</p>
                  <a
                    href={selectedPreviewCert.fileData}
                    download={selectedPreviewCert.fileName}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                  >
                    Download Certificate
                  </a>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                {selectedPreviewCert.fileName} ({Math.round(selectedPreviewCert.fileSize / 1024)} KB)
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={selectedPreviewCert.fileData}
                  download={selectedPreviewCert.fileName}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition"
                >
                  Download
                </a>
                <button
                  onClick={() => setSelectedPreviewCert(null)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
