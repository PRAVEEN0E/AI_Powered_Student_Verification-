import Link from 'next/link';
import { ShieldCheck, Search, Building2, BarChart2, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-6">
          <ShieldCheck className="w-4 h-4" />
          Problem ID: ID26263 • AICTE National Initiative
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          APAAR ID-Based Student Data & <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Compliance Verification Platform
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
          Automated compliance engine preventing duplicate cross-institution enrollments, tracking approved quotas (Supernumerary, NRI, OCI), and offering instant verification for employers.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/verify"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3.5 rounded-xl shadow-sm transition text-sm"
          >
            <Search className="w-4 h-4" />
            <span>Verify APAAR ID</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <Link
            href="/dashboard/aicte"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-medium px-6 py-3.5 rounded-xl border border-slate-300 shadow-sm transition text-sm"
          >
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <span>AICTE Live Analytics</span>
          </Link>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Cross-Institution Guard</h3>
            <p className="text-sm text-slate-500 mt-2">
              PostgreSQL partial unique indexing & Redis locks eliminate ghost admissions and simultaneous active enrollments in two colleges.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit mb-4">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Intake Quota Compliance</h3>
            <p className="text-sm text-slate-500 mt-2">
              Automated validation against AICTE approved intake, tracking Supernumerary, NRI, OCI, and TFW quotas per academic program.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Recruiter Verification Portal</h3>
            <p className="text-sm text-slate-500 mt-2">
              Instant 12-digit APAAR ID lookup for corporate recruiters (Zoho, Startups) with tamper-proof digital authentication logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
