'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ShieldCheck, Building2, Briefcase, UserCheck, Clock, AlertCircle, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [role, setRole] = useState<'COLLEGE_ADMIN' | 'VERIFIER'>('COLLEGE_ADMIN');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [selectedInstId, setSelectedInstId] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [fetchingInsts, setFetchingInsts] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchInsts = async () => {
      setFetchingInsts(true);
      // 1. Try relative URL first (works seamlessly through Next.js rewrites)
      try {
        const res = await fetch('/api/institutions?limit=500');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.institutions && data.institutions.length > 0) {
            setInstitutions(data.institutions);
            setSelectedInstId(data.institutions[0].id);
            setFetchingInsts(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Relative fetch failed, trying direct api client...', e);
      }

      // 2. Try api.getInstitutions()
      try {
        const res = await api.getInstitutions({ limit: 500 });
        if (isMounted && res.institutions && res.institutions.length > 0) {
          setInstitutions(res.institutions);
          setSelectedInstId(res.institutions[0].id);
          setFetchingInsts(false);
          return;
        }
      } catch (e) {
        console.warn('api.getInstitutions failed, trying localhost:5000 fallback...', e);
      }

      // 3. Try direct http://127.0.0.1:5000/api/institutions
      try {
        const res = await fetch('http://127.0.0.1:5000/api/institutions?limit=500');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.institutions && data.institutions.length > 0) {
            setInstitutions(data.institutions);
            setSelectedInstId(data.institutions[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load institutions from all sources:', err);
      } finally {
        if (isMounted) setFetchingInsts(false);
      }
    };

    fetchInsts();
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.registerUser({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role,
        institutionId: role === 'COLLEGE_ADMIN' ? selectedInstId : undefined,
        organizationName: role === 'VERIFIER' ? organizationName.trim() : undefined,
      });

      setSuccess(
        res.message || 'Registration submitted! Your account is awaiting AICTE National Admin approval before you can log in.'
      );
      setFullName('');
      setEmail('');
      setPassword('');
      setOrganizationName('');
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-xl mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Portal Registration</h2>
          <p className="text-xs text-slate-500 mt-1">For College Administrators &amp; Corporate Verifiers</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>Registration Submitted Successfully</span>
            </div>
            <p className="text-amber-800 leading-relaxed">{success}</p>
            <div className="pt-2 border-t border-amber-200">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-1.5 w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg text-xs transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">Select Role</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setRole('COLLEGE_ADMIN')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 font-semibold transition ${
                    role === 'COLLEGE_ADMIN'
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>College Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('VERIFIER')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 font-semibold transition ${
                    role === 'VERIFIER'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Employer / Verifier</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Dr. K. Ramanathan"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Official Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. principal@kec.edu or recruiter@zoho.com"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {role === 'COLLEGE_ADMIN' ? (
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1 flex items-center justify-between">
                  <span>AICTE Approved Institution</span>
                  {fetchingInsts && (
                    <span className="text-[10px] text-blue-600 flex items-center gap-1 font-normal lowercase">
                      <Loader2 className="w-3 h-3 animate-spin" /> Loading institutions...
                    </span>
                  )}
                </label>
                <select
                  value={selectedInstId}
                  onChange={(e) => setSelectedInstId(e.target.value)}
                  className="w-full px-3.5 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                  required
                  disabled={fetchingInsts && institutions.length === 0}
                >
                  <option value="" disabled className="text-slate-400">
                    {fetchingInsts
                      ? '-- Loading institutions list from AICTE database... --'
                      : institutions.length === 0
                      ? '-- No institutions found. Check server connection. --'
                      : `-- Select AICTE Approved Institution (${institutions.length} available) --`}
                  </option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id} className="text-slate-900 py-1">
                      {inst.name} ({inst.state} — {inst.aicte_code})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Select from AICTE accredited institutions across India</p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g. Zoho Corp, TCS, Infosys"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Password</label>
              <input
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition shadow-sm text-xs flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
              <span>Submit Registration for AICTE Approval</span>
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-xs text-blue-600 hover:underline font-semibold">
                Already registered? Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
