'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, Loader2, Building2, Briefcase, UserCheck, Clock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  // Tab: 'LOGIN' or 'REGISTER'
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Sign In State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Registration State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'COLLEGE_ADMIN' | 'VERIFIER'>('COLLEGE_ADMIN');
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [selectedInstId, setSelectedInstId] = useState('');
  const [regOrgName, setRegOrgName] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  React.useEffect(() => {
    api.getInstitutions({ limit: 100 })
      .then((res) => {
        setInstitutions(res.institutions || []);
        if (res.institutions?.length > 0) {
          setSelectedInstId(res.institutions[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.login(email.trim(), password);
      if (!res.token || !res.user) {
        throw new Error('Authentication succeeded but received an invalid session payload.');
      }
      login(res);
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials or server unreachable. Please verify email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setError(null);
    setRegSuccessMsg(null);

    try {
      const res = await api.registerUser({
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
        institutionId: regRole === 'COLLEGE_ADMIN' ? selectedInstId : undefined,
        organizationName: regRole === 'VERIFIER' ? regOrgName.trim() : undefined
      });
      setRegSuccessMsg(res.message);
      setRegFullName('');
      setRegEmail('');
      setRegPassword('');
      setRegOrgName('');
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please check your details.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-xl mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">AICTE National Portal</h2>
          <p className="text-xs text-slate-500 mt-1">Unified Access for Administrators & Verified Employers</p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6 text-xs font-semibold gap-1 border border-slate-200">
          <Link
            href="/login"
            className="flex-1 py-2.5 px-3 rounded-lg text-center font-bold bg-blue-600 text-white shadow"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="flex-1 py-2.5 px-3 rounded-lg text-center font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition"
          >
            Register (Colleges &amp; Employers)
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {regSuccessMsg && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Pending Admin Approval</span>
            </div>
            <p className="leading-relaxed">{regSuccessMsg}</p>
          </div>
        )}

        {mode === 'LOGIN' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Official Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. principal@college.ac.in or talent@company.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition shadow-sm text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating with AICTE Gateway...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Account Role</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setRegRole('COLLEGE_ADMIN')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-semibold transition ${
                    regRole === 'COLLEGE_ADMIN'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>College Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('VERIFIER')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-semibold transition ${
                    regRole === 'VERIFIER'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Employer / Verifier</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="e.g. Dr. S. Ramanathan or Priya Sharma"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Official Email</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="e.g. principal@kec.edu or recruiter@zoho.com"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {regRole === 'COLLEGE_ADMIN' ? (
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">AICTE Approved Institution</label>
                <select
                  value={selectedInstId}
                  onChange={(e) => setSelectedInstId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.state})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  value={regOrgName}
                  onChange={(e) => setRegOrgName(e.target.value)}
                  placeholder="e.g. Zoho Corp, TCS, Infosys"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Create Password</label>
              <input
                type="password"
                minLength={6}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={regLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition shadow-sm text-xs flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {regLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
              <span>Submit Registration for AICTE Approval</span>
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-[11px] text-slate-400 border-t border-slate-100 pt-4">
          Students do not register here • Verify any student via{' '}
          <a href="/verify" className="text-blue-600 font-semibold underline">
            Public Verification
          </a>
        </div>
      </div>
    </div>
  );
}
