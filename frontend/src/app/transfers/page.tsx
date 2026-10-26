'use client';

import React, { useState, useEffect } from 'react';
import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  ArrowLeftRight, FileCheck, CheckCircle2, XCircle, Clock, Building2,
  Send, AlertTriangle, ShieldCheck, Search, Check, RefreshCw, Loader2
} from 'lucide-react';

interface TransferRecord {
  id: string;
  noc_reference_number: string;
  transfer_reason: string;
  status: 'NOC_ISSUED_BY_SOURCE' | 'AICTE_APPROVED' | 'COMPLETED' | 'REJECTED';
  source_issued_at: string;
  aicte_decision_at?: string;
  aicte_remarks?: string;
  student_name: string;
  apaar_id: string;
  source_institution_name: string;
  source_aicte_code: string;
  target_institution_name: string;
  target_aicte_code: string;
  target_program_name: string;
}

interface InstitutionOption {
  id: string;
  aicte_code: string;
  name: string;
  state: string;
}

interface ProgramOption {
  id: string;
  program_name: string;
  program_code: string;
}

export default function TransfersPage() {
  const { session, role } = useAuth();
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'LIST' | 'ISSUE_NOC'>('LIST');

  // Dynamic institutions and programs for NOC
  const [institutions, setInstitutions] = useState<InstitutionOption[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  // Form State for College Admin Issuing NOC
  const [apaarId, setApaarId] = useState('');
  const [targetInstitution, setTargetInstitution] = useState('');
  const [targetProgram, setTargetProgram] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Target College finalization state
  const [finalizingId, setFinalizingId] = useState<string | null>(null);
  const [newRollNo, setNewRollNo] = useState('');

  // Load available institutions on mount
  useEffect(() => {
    api.getInstitutions({ limit: 100 })
      .then((res: any) => {
        if (res.institutions?.length > 0) {
          // Filter out user's own institution
          const currentInstId = session?.user?.institutionId;
          const filtered = res.institutions.filter((i: any) => i.id !== currentInstId);
          setInstitutions(filtered);
          if (filtered.length > 0) {
            setTargetInstitution(filtered[0].id);
          }
        }
      })
      .catch((err) => console.error('Error fetching institutions:', err));
  }, [session]);

  // Load programs whenever target institution changes
  useEffect(() => {
    if (!targetInstitution) return;
    setLoadingPrograms(true);
    api.getInstitutionPrograms(targetInstitution)
      .then((res: any) => {
        setPrograms(res.programs || []);
        if (res.programs?.length > 0) {
          setTargetProgram(res.programs[0].id);
        } else {
          setTargetProgram('');
        }
      })
      .catch((err) => {
        console.error('Error fetching programs:', err);
        setPrograms([]);
      })
      .finally(() => setLoadingPrograms(false));
  }, [targetInstitution]);

  const loadTransfers = async () => {
    setLoading(true);
    const authStr = typeof window !== 'undefined' ? localStorage.getItem('apaar_auth') : null;
    const token = authStr ? JSON.parse(authStr).token : session?.token || '';

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.getTransfers(token);
      setTransfers(res.transfers || []);
    } catch (err: any) {
      console.error('Error fetching transfers:', err);
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, [session]);

  const handleIssueNoc = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    if (!/^\d{12}$/.test(apaarId)) {
      setFeedback({ type: 'error', message: 'APAAR ID must be exactly 12 digits.' });
      setSubmitting(false);
      return;
    }

    if (!targetInstitution || !targetProgram) {
      setFeedback({ type: 'error', message: 'Please select a valid target institution and program.' });
      setSubmitting(false);
      return;
    }

    const authStr = typeof window !== 'undefined' ? localStorage.getItem('apaar_auth') : null;
    const token = authStr ? JSON.parse(authStr).token : session?.token || '';

    try {
      const res = await api.issueNoc(token, {
        apaarId,
        targetInstitutionId: targetInstitution,
        targetProgramId: targetProgram,
        transferReason: reason
      });
      setFeedback({ type: 'success', message: res.message || 'NOC successfully issued and submitted to AICTE.' });
      setApaarId('');
      setReason('');
      loadTransfers();
      setActiveTab('LIST');
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to issue NOC. Ensure student has an ACTIVE enrollment in your institution.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAicteReview = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    const authStr = typeof window !== 'undefined' ? localStorage.getItem('apaar_auth') : null;
    const token = authStr ? JSON.parse(authStr).token : session?.token || '';

    try {
      await api.reviewTransfer(token, id, decision, 'Compliance checks cleared. Previous enrollment marked as TRANSFERRED.');
      loadTransfers();
    } catch (err: any) {
      alert(`Review failed: ${err?.message || 'Server error'}`);
    }
  };

  const handleFinalizeTransfer = async (id: string) => {
    if (!newRollNo.trim()) {
      alert('Please enter a new roll number for the transferred student.');
      return;
    }
    const authStr = typeof window !== 'undefined' ? localStorage.getItem('apaar_auth') : null;
    const token = authStr ? JSON.parse(authStr).token : session?.token || '';

    try {
      await api.completeTransfer(token, id, newRollNo.trim(), 'APPROVED_INTAKE');
      setFinalizingId(null);
      setNewRollNo('');
      loadTransfers();
    } catch (err: any) {
      alert(`Finalization failed: ${err?.message || 'Server error'}`);
    }
  };

  return (
    <RoleGuard allowedRoles={['AICTE_ADMIN', 'COLLEGE_ADMIN']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
              Inter-Institutional Mobility Framework
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Student Transfer & No Objection Certificate (NOC) Portal
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Seamless cross-college transfers without duplicate active enrollment conflicts. Governed by AICTE central compliance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {role === 'COLLEGE_ADMIN' && (
              <button
                onClick={() => setActiveTab(activeTab === 'LIST' ? 'ISSUE_NOC' : 'LIST')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                {activeTab === 'LIST' ? (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Issue New Student NOC</span>
                  </>
                ) : (
                  <span>View All Transfers</span>
                )}
              </button>
            )}
            <button
              onClick={loadTransfers}
              title="Refresh"
              className="p-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workflow Explanation Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-amber-400">
            <ShieldCheck className="w-4 h-4" />
            <span>AICTE 3-Step Zero-Collision Transfer Protocol</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <span className="font-bold text-blue-400 block mb-1">Step 1: College A (Source)</span>
              College issues a digital NOC with reasons. Transfer request is registered in national DB.
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <span className="font-bold text-emerald-400 block mb-1">Step 2: AICTE Central Review</span>
              AICTE council validates quota and approves transfer, automatically marking old enrollment as <code>TRANSFERRED</code> (frees unique index).
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <span className="font-bold text-indigo-400 block mb-1">Step 3: College B (Target)</span>
              Target college enrolls student under new roll number with zero duplicate violation rejection.
            </div>
          </div>
        </div>

        {/* Issue NOC Form (College Admin only) */}
        {activeTab === 'ISSUE_NOC' && role === 'COLLEGE_ADMIN' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 max-w-2xl mx-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              <span>Issue No Objection Certificate (NOC)</span>
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Generate digital NOC for an active student seeking transfer to another AICTE-accredited institution.
            </p>

            {feedback && (
              <div className={`p-4 mb-6 rounded-xl border text-xs flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleIssueNoc} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase text-slate-600 mb-1">Student APAAR ID</label>
                <input
                  type="text"
                  maxLength={12}
                  value={apaarId}
                  onChange={(e) => setApaarId(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 12-digit APAAR ID (e.g. 100000000001)"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-600 mb-1">Target Institution</label>
                <select
                  value={targetInstitution}
                  onChange={(e) => setTargetInstitution(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.state} • AICTE: {inst.aicte_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-600 mb-1">
                  Target Program / Branch {loadingPrograms && <span className="text-slate-400 font-normal">(Loading...)</span>}
                </label>
                <select
                  value={targetProgram}
                  onChange={(e) => setTargetProgram(e.target.value)}
                  required
                  disabled={loadingPrograms || programs.length === 0}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
                >
                  {programs.length > 0 ? (
                    programs.map((prog) => (
                      <option key={prog.id} value={prog.id}>
                        {prog.program_name} ({prog.program_code})
                      </option>
                    ))
                  ) : (
                    <option value="">No programs available for selected institution</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-600 mb-1">Reason for Transfer</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State academic reason, parental relocation, or medical grounds..."
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('LIST')}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting to AICTE...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Issue NOC & Notify AICTE</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Transfers List Table */}
        {activeTab === 'LIST' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Active & Historical Transfer Requests</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time status tracking across source colleges, AICTE central council, and receiving institutions.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                {transfers.length} Total Requests
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-xs">Loading transfer records from database...</span>
              </div>
            ) : transfers.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <ArrowLeftRight className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">No transfer requests found</p>
                <p className="text-slate-400 mt-1">
                  {role === 'COLLEGE_ADMIN'
                    ? 'Click "Issue New Student NOC" above to initiate a student transfer request.'
                    : 'No student transfer requests currently pending in AICTE central registry.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="px-6 py-3.5">NOC Reference</th>
                      <th className="px-6 py-3.5">Student / APAAR ID</th>
                      <th className="px-6 py-3.5">Source Institution</th>
                      <th className="px-6 py-3.5">Target Institution & Program</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transfers.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-6 py-4 font-mono font-semibold text-blue-700">
                          {t.noc_reference_number}
                          <span className="block text-[10px] text-slate-400 font-sans mt-0.5">
                            Issued: {new Date(t.source_issued_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{t.student_name}</p>
                          <p className="font-mono text-slate-500 text-[11px] mt-0.5">{t.apaar_id}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-800">{t.source_institution_name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">AICTE: {t.source_aicte_code}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-800">{t.target_institution_name}</p>
                          <p className="text-[11px] text-blue-600 mt-0.5 font-semibold">{t.target_program_name}</p>
                        </td>
                        <td className="px-6 py-4">
                          {t.status === 'NOC_ISSUED_BY_SOURCE' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" />
                              Pending AICTE Review
                            </span>
                          )}
                          {t.status === 'AICTE_APPROVED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              AICTE Approved (Ready for Admission)
                            </span>
                          )}
                          {t.status === 'COMPLETED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <Check className="w-3 h-3" />
                              Transfer Completed
                            </span>
                          )}
                          {t.status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                              <XCircle className="w-3 h-3" />
                              Rejected by AICTE
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {/* AICTE Review Actions */}
                          {role === 'AICTE_ADMIN' && t.status === 'NOC_ISSUED_BY_SOURCE' && (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleAicteReview(t.id, 'APPROVED')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-sm transition"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleAicteReview(t.id, 'REJECTED')}
                                className="bg-red-50 hover:bg-red-100 text-red-700 font-medium px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 border border-red-200 transition"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          )}

                          {/* Target College Admin Finalize Action */}
                          {role === 'COLLEGE_ADMIN' && t.status === 'AICTE_APPROVED' && (
                            <div>
                              {finalizingId === t.id ? (
                                <div className="flex items-center gap-1.5 justify-end">
                                  <input
                                    type="text"
                                    value={newRollNo}
                                    onChange={(e) => setNewRollNo(e.target.value)}
                                    placeholder="New Roll Number"
                                    className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs w-36 font-mono"
                                  />
                                  <button
                                    onClick={() => handleFinalizeTransfer(t.id)}
                                    className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-emerald-700"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setFinalizingId(null)}
                                    className="text-slate-400 hover:text-slate-600 px-1"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setFinalizingId(t.id)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-lg text-xs shadow-sm transition"
                                >
                                  Admit Transferred Student
                                </button>
                              )}
                            </div>
                          )}

                          {t.status === 'COMPLETED' && (
                            <span className="text-slate-400 font-medium">Archived in Registry</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
