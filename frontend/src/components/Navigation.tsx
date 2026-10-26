'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth, UserRole } from '@/context/AuthContext';
import {
  ShieldCheck,
  Building2,
  UserCheck,
  LayoutDashboard,
  LogOut,
  UserCircle,
  GraduationCap,
  ArrowLeftRight
} from 'lucide-react';

export default function Navigation() {
  const { session, role, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-slate-900">APAAR-AICTE</span>
            <span className="ml-2 text-xs uppercase bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
              ID26263
            </span>
          </div>
        </Link>

        {/* Dynamic RBAC Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {/* Public / Recruiter always has access to Verify */}
          <Link
            href="/verify"
            className="flex items-center space-x-1.5 text-slate-600 hover:text-blue-600 transition"
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Verify APAAR ID</span>
          </Link>

          {/* AICTE National Admin Only */}
          {role === 'AICTE_ADMIN' && (
            <>
              <Link
                href="/dashboard/aicte"
                className="flex items-center space-x-1.5 text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>National Dashboard</span>
              </Link>
              <Link
                href="/transfers"
                className="flex items-center space-x-1.5 text-slate-600 hover:text-blue-600 transition"
              >
                <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
                <span>Transfer Approvals</span>
              </Link>
            </>
          )}

          {/* College Admin Only */}
          {role === 'COLLEGE_ADMIN' && (
            <>
              <Link
                href="/dashboard/college"
                className="flex items-center space-x-1.5 text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
              >
                <Building2 className="w-4 h-4" />
                <span>College Portal</span>
              </Link>
              <Link
                href="/transfers"
                className="flex items-center space-x-1.5 text-slate-600 hover:text-blue-600 transition"
              >
                <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
                <span>NOC & Transfers</span>
              </Link>
            </>
          )}

          {/* Student Profile */}
          {role === 'STUDENT' && (
            <Link
              href="/dashboard/student"
              className="flex items-center space-x-1.5 text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
            >
              <GraduationCap className="w-4 h-4" />
              <span>My Academic Registry</span>
            </Link>
          )}
        </nav>

        {/* Right Auth & Role Switching section */}
        <div className="flex items-center space-x-3">
          {session ? (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {session.user.fullName}
                </p>
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                    {session.user.role}
                  </span>
                  {session.user.institutionName && (
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      {session.user.institutionName}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      </header>
  );
}
