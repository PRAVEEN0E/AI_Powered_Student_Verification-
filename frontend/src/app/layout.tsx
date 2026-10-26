import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "APAAR ID Verification & Compliance Platform | AICTE",
  description: "Automated student data management and verification platform for AICTE-approved institutions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <AuthProvider>
          <Navigation />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
            <p>© 2026 All India Council for Technical Education (AICTE). APAAR Registry Platform (Problem ID: ID26263).</p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
