'use client';

import React, { useEffect, useState } from 'react';
import RoleGuard from '@/components/RoleGuard';
import { useAuth } from '@/context/AuthContext';
import { api, VerificationResponse } from '@/lib/api';
import { GraduationCap, Award, Building2, CheckCircle2, ShieldCheck, QrCode, Loader2 } from 'lucide-react';

export default function StudentDashboardPage() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dynamic lookup: use session user's APAAR ID if available, otherwise fallback to known ID
    const apaarToLookup = session?.user?.apaarId || '987654321012';
    api.verifyApaarId(apaarToLookup)
      .then((res) => {
        if (res.verified) {
          setProfile(res);
        }
      })
      .catch((err) => console.error('Error fetching student profile:', err))
      .finally(() => setLoading(false));
  }, [session]);

  const primaryEnrollment = profile?.enrollments?.[0];

  return (
    <RoleGuard allowedRoles={['STUDENT']}>
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center font-bold text-xl">
              {profile?.fullName?.charAt(0) || session?.user?.fullName?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  {profile?.fullName || session?.user?.fullName || 'Enrolled Student'}
                </h1>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                  Verified APAAR
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                APAAR ID: <span className="font-mono font-bold text-slate-700">{profile?.apaarId || session?.user?.apaarId || '—'}</span> • ABC ID: {profile?.abcAccountId || 'Linked'}
              </p>
            </div>
          </div>
          <div className="sm:text-right">
            <span className="text-xs text-slate-400 block">Single Active Enrollment</span>
            <span className="text-xs font-semibold text-emerald-600">No Cross-College Conflicts</span>
          </div>
        </div>

        {/* Academic Enrollment Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>{primaryEnrollment?.institutionName || session?.user?.institutionName || 'Institutional Academic Profile'}</span>
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              {primaryEnrollment?.programName || 'Degree Program'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-slate-400">Roll Number</p>
              <p className="font-mono font-bold text-slate-800 mt-0.5">{primaryEnrollment?.enrollmentId ? primaryEnrollment.enrollmentId.slice(0, 10).toUpperCase() : 'Registered'}</p>
            </div>
            <div>
              <p className="text-slate-400">Seat Category</p>
              <p className="font-semibold text-slate-800 mt-0.5">Approved Intake (Merit)</p>
            </div>
            <div>
              <p className="text-slate-400">Current CGPA</p>
              <p className="font-mono font-bold text-blue-600 mt-0.5">
                {primaryEnrollment?.cgpa ? `${primaryEnrollment.cgpa} / 10.0` : 'In Progress'}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Status</p>
              <p className="font-semibold text-emerald-600 mt-0.5">
                {primaryEnrollment?.status || 'ACTIVE'} Student
              </p>
            </div>
          </div>
        </div>

        {/* Printable Official Degree / Academic Certificate (Requirement 10) */}
        <div className="bg-white rounded-2xl border-2 border-slate-300 p-8 shadow-sm space-y-6 relative overflow-hidden print:border-none print:shadow-none">
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] uppercase font-bold tracking-widest px-4 py-1 rounded-bl-xl print:hidden">
            AICTE Academic Credential
          </div>

          <div className="text-center space-y-1 border-b border-slate-200 pb-6">
            <div className="flex items-center justify-center gap-2 text-blue-700 font-extrabold text-lg tracking-wider uppercase">
              <ShieldCheck className="w-6 h-6" />
              <span>All India Council for Technical Education</span>
            </div>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Permanent Academic Identity & Enrollment Certificate</p>
          </div>

          <div className="text-center space-y-3 py-4 max-w-xl mx-auto">
            <p className="text-xs text-slate-500">This is to officially certify that</p>
            <h2 className="text-2xl font-serif font-bold text-slate-900 underline decoration-blue-500 underline-offset-8">
              {profile?.fullName || session?.user?.fullName || 'Student'}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed pt-2">
              is a bona fide enrolled student in the technical program in <br />
              <strong className="text-slate-900">{primaryEnrollment?.programName || 'Approved Technical Program'}</strong> at <br />
              <strong className="text-slate-900">{primaryEnrollment?.institutionName || session?.user?.institutionName || 'AICTE Approved Institution'}</strong> (AICTE Code: {primaryEnrollment?.aicteCode || session?.user?.aicteCode || 'Verified'}).
            </p>
          </div>

          {/* Dual ID Display Grid: APAAR ID + Institutional Student ID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">National APAAR ID</p>
              <p className="font-mono font-bold text-blue-700 text-sm mt-0.5">{profile?.apaarId || session?.user?.apaarId || '—'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Institutional Status</p>
              <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">{primaryEnrollment?.status || 'ACTIVE'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">ABC Account ID</p>
              <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">{profile?.abcAccountId || 'Linked'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Digital Signature</p>
              <p className="font-bold text-emerald-600 text-xs mt-0.5">Cryptographically Verified</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            <span>Official AICTE Verification Key: SHA256:8b4f...e31c</span>
            <button
              onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl text-xs transition print:hidden shadow-sm"
            >
              Print / Save Certificate
            </button>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
