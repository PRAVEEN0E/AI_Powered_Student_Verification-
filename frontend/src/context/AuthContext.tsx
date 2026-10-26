'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type UserRole = 'AICTE_ADMIN' | 'COLLEGE_ADMIN' | 'STUDENT' | 'VERIFIER';

export interface UserSession {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    institutionId?: string;
    institutionName?: string;
    aicteCode?: string;
    organizationName?: string;
    apaarId?: string;
  };
}

interface AuthContextType {
  session: UserSession | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (session: UserSession) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  role: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('apaar_auth');
      if (stored) {
        setSession(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newSession: UserSession) => {
    setSession(newSession);
    localStorage.setItem('apaar_auth', JSON.stringify(newSession));
    redirectBasedOnRole(newSession.user.role);
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('apaar_auth');
    router.push('/login');
  };

  const redirectBasedOnRole = (userRole: UserRole) => {
    if (userRole === 'AICTE_ADMIN') router.push('/dashboard/aicte');
    else if (userRole === 'COLLEGE_ADMIN') router.push('/dashboard/college');
    else if (userRole === 'VERIFIER') router.push('/verify');
    else if (userRole === 'STUDENT') router.push('/dashboard/student');
    else router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        role: session?.user?.role || null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
