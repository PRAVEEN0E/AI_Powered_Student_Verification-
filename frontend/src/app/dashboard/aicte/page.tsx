'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import RoleGuard from '@/components/RoleGuard';
import {
  Users, Building, AlertTriangle, ShieldCheck, PieChart as PieIcon, BarChart3, AlertOctagon, CheckCircle2, Download, Loader2,
  UserCheck, XCircle, Clock, Building2, Briefcase, Sparkles, ShieldAlert, Cpu
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function AicteDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pending Registrations (College Admin & Employer Approvals)
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPendingApprovals = () => {
    const authStr = typeof window !== 'undefined' ? localStorage.getItem('apaar_auth') : null;
    const token = authStr ? JSON.parse(authStr).token : '';
    if (!token) return;

    api.getPendingApprovals(token)
      .then((res) => setPendingUsers(res.pendingUsers || []))
      .catch(() => {});
  };

  useEffect(() => {
    const authStr = typeof window !== 'undefined' ? localStorage.getItem('apaar_auth') : null;
    const token = authStr ? JSON.parse(authStr).token : '';

    api.getNationalAnalytics(token)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load national analytics. Ensure backend is running.');
        setLoading(false);
      });

    fetchPendingApprovals();
  }, []);

  const handleReviewUser = async (userId: string, action: 'APPROVE' | 'REJECT') => {
    setActionLoading(userId);
    const authStr = typeof window !== 'undefined' ? localStorage.getItem('apaar_auth') : null;
    const token = authStr ? JSON.parse(authStr).token : '';

    try {
      await api.reviewPendingUser(token, userId, action);
      fetchPendingApprovals();
    } catch (err: any) {
      alert(err?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <RoleGuard allowedRoles={['AICTE_ADMIN']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner with Role Context */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-800 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              National Apex Governance
            </div>
            <h1 className="text-2xl font-bold">AICTE Central Compliance & Monitoring Engine</h1>
            <p className="text-xs text-blue-200 mt-1">Live tracking of technical institutions, 12-digit APAAR deduplication, and quota allocations</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const authStr = typeof window !== 'undefined' ? localStorage.getItem('apaar_auth') : null;
                const token = authStr ? JSON.parse(authStr).token : '';
                const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                
                fetch(`${apiBase}/api/reports/compliance-export`, {
                  headers: { Authorization: `Bearer ${token}` }
                })
                .then(res => res.blob())
                .then(blob => {
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `AICTE-Compliance-Report-${new Date().toISOString().slice(0, 10)}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                })
                .catch(() => alert('Exporting compliance report...'));
              }}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Regulatory Report (CSV)</span>
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sync Active
            </span>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm flex items-center gap-3">
            <AlertOctagon className="w-5 h-5 flex-shrink-0" />
            <div><strong>API Error:</strong> {error}</div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Loading national analytics from database...</span>
          </div>
        )}

        {/* KPI Stats Grid & Charts */}
        {!loading && data && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Total AICTE Colleges</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{data?.overview?.total_institutions?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Building className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Unique Students</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{data?.overview?.total_students?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Active Enrollments</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{data?.overview?.active_enrollments?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Recruiter Verifications</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{data?.overview?.total_verifications?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Charts & Compliance Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Breakdown (Pie) */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm">
                  <PieIcon className="w-4 h-4 text-blue-600" />
                  <span>National Category Quota Distribution</span>
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.categoryDistribution}
                        dataKey="count"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={85}
                        label
                      >
                        {data?.categoryDistribution?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Quota Alerts Table */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                    <AlertOctagon className="w-4 h-4 text-red-500" />
                    <span>Excess Admission & Capacity Alerts</span>
                  </h3>
                  <span className="text-[11px] bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded">
                    AICTE Sanctions Flagged
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                        <th className="py-2.5">Institution</th>
                        <th className="py-2.5">Program</th>
                        <th className="py-2.5">Approved</th>
                        <th className="py-2.5">Actual</th>
                        <th className="py-2.5">Utilization</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data?.quotaUtilizationAlerts?.length > 0 ? (
                        data.quotaUtilizationAlerts.map((alert: any, i: number) => (
                          <tr key={i} className="text-slate-700">
                            <td className="py-3 font-semibold text-slate-900">{alert.institution_name}</td>
                            <td className="py-3">{alert.program_name}</td>
                            <td className="py-3 font-mono">{alert.approved_intake}</td>
                            <td className="py-3 font-mono">{alert.actual_enrollment}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded font-bold ${
                                alert.utilization_pct > 100
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {alert.utilization_pct}%
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            No institutions currently exceeding 90% intake capacity. All institutions compliant.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* AI-Powered Anomaly & Ghost Student Detection Engine (Competitive Innovation) */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-indigo-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-indigo-800/40 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-xl">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <span>AI Intelligent Anomaly &amp; Ghost Student Engine</span>
                      <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                        Real-time AI Guard
                      </span>
                    </h3>
                    <p className="text-xs text-indigo-200/70 mt-0.5">
                      Autonomous pattern heuristics scanning for ghost admissions, unverified certificates, and sudden intake spikes
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Neural Heuristic Active</span>
                  </span>
                </div>
              </div>

              {data?.aiAnomalies && data.aiAnomalies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.aiAnomalies.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-white/5 border border-indigo-400/20 rounded-xl p-4 flex flex-col justify-between hover:bg-white/10 transition"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-white text-sm">{item.institutionName}</h4>
                          <p className="text-xs text-indigo-300 font-mono mt-0.5">{item.programName} ({item.aicteCode})</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.riskLevel === 'CRITICAL'
                            ? 'bg-red-500/30 text-red-300 border border-red-500/40'
                            : 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                        }`}>
                          {item.riskLevel} Risk
                        </span>
                      </div>
                      <div className="bg-slate-900/60 p-3 rounded-lg border border-white/5 mt-2">
                        <p className="text-xs text-slate-200 leading-relaxed flex items-start gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{item.reason}</span>
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-indigo-200/50 mt-3 pt-2 border-t border-white/10">
                        <span>Reported Intake: {item.approvedIntake} | Enrolled: {item.enrolledCount}</span>
                        <span className="text-indigo-400 font-semibold cursor-pointer hover:underline">Trigger AICTE Audit</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/5 border border-dashed border-indigo-400/20 rounded-xl p-8 text-center">
                  <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="font-bold text-white text-sm">National Anomaly Scan: All Clear</p>
                  <p className="text-xs text-indigo-200/70 mt-1 max-w-md mx-auto">
                    No ghost students, duplicate enrollment collisions, or uncertified intake spikes detected across participating institutions.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pending Registration Approvals Section (College Admins & Employers) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4" />
                <span>Security Governance & Clearance</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Pending Registration Approvals ({pendingUsers.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Newly registered College Administrators & Corporate Verifiers awaiting AICTE authorization to access the system.
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold rounded-full self-start sm:self-auto">
              {pendingUsers.length} Pending Review
            </span>
          </div>

          <div className="overflow-x-auto">
            {pendingUsers.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">All Registration Requests Cleared</p>
                <p className="text-slate-400 mt-1">No pending college administrator or employer registrations waiting for approval.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Applicant Name</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Requested Role</th>
                    <th className="px-6 py-3.5">Institution / Company</th>
                    <th className="px-6 py-3.5">Applied Date</th>
                    <th className="px-6 py-3.5 text-right">Administrative Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900">{user.full_name}</td>
                      <td className="px-6 py-4 font-mono text-slate-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          user.role === 'COLLEGE_ADMIN'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}>
                          {user.role === 'COLLEGE_ADMIN' ? 'COLLEGE ADMIN' : 'EMPLOYER / VERIFIER'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {user.institution_name ? (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{user.institution_name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            <span>{user.organization_name || 'Corporate Verifier'}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleReviewUser(user.id, 'APPROVE')}
                          disabled={actionLoading === user.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] transition shadow-sm disabled:opacity-50"
                        >
                          {actionLoading === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                          <span>Approve Access</span>
                        </button>
                        <button
                          onClick={() => handleReviewUser(user.id, 'REJECT')}
                          disabled={actionLoading === user.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg font-semibold text-[11px] transition disabled:opacity-50"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Reject</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
