const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface VerificationResponse {
  verified: boolean;
  apaarId?: string;
  fullName?: string;
  abcAccountId?: string;
  enrollments?: Array<{
    enrollmentId: string;
    institutionName: string;
    aicteCode: string;
    state: string;
    programName: string;
    degreeLevel: string;
    academicYear: string;
    status: string;
    admissionDate: string;
    completionYear?: number;
    cgpa?: number;
    degreeAwarded: boolean;
  }>;
  certificates?: Array<{
    id: string;
    certificateType: string;
    title: string;
    fileName: string;
    fileData: string;
    mimeType: string;
    fileSize: number;
    uploadedAt: string;
    institutionName: string;
    aicteCode: string;
  }>;
  verificationTimestamp?: string;
  message?: string;
}

export interface UserSession {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: 'AICTE_ADMIN' | 'COLLEGE_ADMIN' | 'STUDENT' | 'VERIFIER';
    institutionId?: string;
    institutionName?: string;
    aicteCode?: string;
  };
}

export const api = {
  // Public verification lookup
  verifyApaarId: async (apaarId: string): Promise<VerificationResponse> => {
    const res = await fetch(`${API_BASE_URL}/api/verify/${apaarId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    return res.json();
  },

  // Batch Verification for Recruiters (TCS, Zoho, etc.)
  verifyBatch: async (apaarIds: string[]) => {
    const res = await fetch(`${API_BASE_URL}/api/verify/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apaarIds })
    });
    if (!res.ok) throw new Error('Batch verification failed');
    return res.json();
  },

  // DigiLocker & ABC Credits Sandbox Gateway
  getDigiLockerRecord: async (apaarId: string) => {
    const res = await fetch(`${API_BASE_URL}/api/verify/digilocker/${apaarId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'DigiLocker fetch failed' }));
      throw new Error(err.message || 'DigiLocker fetch failed');
    }
    return res.json();
  },

  // Auth: Login
  login: async (email: string, password: string): Promise<UserSession> => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }
    return res.json();
  },

  // Auth: Register (College Admin or Employer/Verifier)
  registerUser: async (payload: {
    fullName: string;
    email: string;
    password: string;
    role: 'COLLEGE_ADMIN' | 'VERIFIER';
    institutionId?: string;
    organizationName?: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(err.message || 'Registration failed');
    }
    return res.json();
  },

  getPendingApprovals: async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/pending-approvals`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to load pending approvals');
    return res.json();
  },

  reviewPendingUser: async (token: string, userId: string, action: 'APPROVE' | 'REJECT') => {
    const res = await fetch(`${API_BASE_URL}/api/auth/pending-approvals/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ action })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to review user' }));
      throw new Error(err.message || 'Failed to review user');
    }
    return res.json();
  },

  // AICTE National Analytics
  getNationalAnalytics: async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/api/analytics/national`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  // College Admin Analytics
  getInstitutionAnalytics: async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/api/analytics/institution`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch institution analytics');
    return res.json();
  },

  // College Students List
  getStudents: async (token: string, search?: string) => {
    const url = new URL(`${API_BASE_URL}/api/students`);
    if (search) url.searchParams.set('search', search);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  },

  // Bulk CSV Upload
  uploadBulkCsv: async (token: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/api/students/bulk-upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Bulk upload failed' }));
      throw new Error(err.message || 'Bulk upload failed');
    }
    return res.json();
  },

  // Admit a single student
  admitStudent: async (token: string, payload: {
    apaarId: string;
    fullName: string;
    dob: string;
    gender: string;
    programId: string;
    category: string;
    rollNumber: string;
    admissionDate: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}/api/students/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ...payload,
        academicYear: '2025-2026',
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Admission failed' }));
      throw new Error(err.message || 'Admission failed');
    }
    return res.json();
  },

  // Institutional Transfer & NOC Workflow APIs
  issueNoc: async (token: string, payload: { apaarId: string; targetInstitutionId: string; targetProgramId: string; transferReason: string }) => {
    const res = await fetch(`${API_BASE_URL}/api/transfers/issue-noc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to issue NOC' }));
      throw new Error(err.message || 'Failed to issue NOC');
    }
    return res.json();
  },

  getTransfers: async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/api/transfers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch transfers');
    return res.json();
  },

  reviewTransfer: async (token: string, transferId: string, decision: 'APPROVED' | 'REJECTED', remarks?: string) => {
    const res = await fetch(`${API_BASE_URL}/api/transfers/${transferId}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ decision, remarks })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to review transfer' }));
      throw new Error(err.message || 'Failed to review transfer');
    }
    return res.json();
  },

  completeTransfer: async (token: string, transferId: string, newRollNumber: string, category?: string) => {
    const res = await fetch(`${API_BASE_URL}/api/transfers/${transferId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ newRollNumber, category })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to complete transfer' }));
      throw new Error(err.message || 'Failed to complete transfer');
    }
    return res.json();
  },

  // Institutions & Programs
  getInstitutions: async (params?: { search?: string; state?: string; limit?: number }) => {
    const url = new URL(`${API_BASE_URL}/api/institutions`);
    if (params?.search) url.searchParams.set('search', params.search);
    if (params?.state) url.searchParams.set('state', params.state);
    if (params?.limit) url.searchParams.set('limit', String(params.limit));

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch institutions');
    return res.json();
  },

  getInstitutionPrograms: async (institutionId: string) => {
    const res = await fetch(`${API_BASE_URL}/api/institutions/${institutionId}/programs`);
    if (!res.ok) throw new Error('Failed to fetch institution programs');
    return res.json();
  },

  // Student Certificates / Documents
  uploadStudentCertificate: async (token: string, payload: {
    apaarId: string;
    certificateType: string;
    title: string;
    file: File;
  }) => {
    const formData = new FormData();
    formData.append('apaarId', payload.apaarId);
    formData.append('certificateType', payload.certificateType);
    formData.append('title', payload.title);
    formData.append('file', payload.file);

    const res = await fetch(`${API_BASE_URL}/api/credentials/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to upload certificate' }));
      throw new Error(err.message || 'Failed to upload certificate');
    }
    return res.json();
  },

  getStudentCertificates: async (token: string, apaarId: string) => {
    const res = await fetch(`${API_BASE_URL}/api/credentials/student/${apaarId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to fetch certificates' }));
      throw new Error(err.message || 'Failed to fetch certificates');
    }
    return res.json();
  }
};
