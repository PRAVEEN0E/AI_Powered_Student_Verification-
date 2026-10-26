'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { session, role, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-blue-600 mb-3"></div>
        <p className="text-xs text-slate-500 font-medium">Validating AICTE Security Clearance...</p>
      </div>
    );
  }

  if (!session || !role) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Authentication Required</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          You need an active authenticated session to access this portal.
        </p>
        <Link
          href="/login"
          className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl text-sm transition"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  if (!allowedRoles.includes(role)) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-red-200 shadow-sm text-center">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Denied (403)</h2>
        <p className="text-xs text-slate-600 mt-2">
          Your current role is <strong className="text-blue-600 uppercase font-mono">{role}</strong>.
          <br />
          This portal strictly requires: <strong>{allowedRoles.join(', ')}</strong>.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Switch Role or Sign Out
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
