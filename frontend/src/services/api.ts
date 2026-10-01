import {
  TraineeSummary,
  TraineeDetail,
  VerificationItem,
  AnalyticsSummary,
  VerificationQuality,
  SkillGapResponse,
  AttritionRiskResponse,
  OutboundMessage
} from '../types';

let rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || 'http://localhost:8000';
if (rawApiUrl && !rawApiUrl.startsWith('http://') && !rawApiUrl.startsWith('https://')) {
  rawApiUrl = `https://${rawApiUrl}`;
}
const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('pragatipath_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

export const api = {
  // Auth
  login: async (role: string) => {
    return fetchJson<{ access_token: string; role: string; full_name: string; username: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ username: `${role}_demo` })
      }
    );
  },

  // Trainees
  getTrainees: async (district?: string, courseId?: number): Promise<TraineeSummary[]> => {
    let url = '/trainees';
    const params = new URLSearchParams();
    if (district) params.append('district', district);
    if (courseId) params.append('course_id', courseId.toString());
    if (params.toString()) url += `?${params.toString()}`;
    return fetchJson<TraineeSummary[]>(url);
  },

  getTraineeDetail: async (id: number): Promise<TraineeDetail> => {
    return fetchJson<TraineeDetail>(`/trainees/${id}`);
  },

  submitCheckin: async (
    traineeId: number,
    data: {
      status: string;
      employer_name?: string;
      wage?: number;
      same_employer?: boolean;
      month_mark?: number;
    }
  ) => {
    return fetchJson<{
      success: boolean;
      message: string;
      checkpoint_id: number;
      month_mark: number;
      status: string;
      wage: number;
      verification_request?: any;
    }>(`/trainees/${traineeId}/checkin`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Verifications
  getPendingVerifications: async (employerName?: string): Promise<VerificationItem[]> => {
    let url = '/verifications/pending';
    if (employerName) url += `?employer_name=${encodeURIComponent(employerName)}`;
    return fetchJson<VerificationItem[]>(url);
  },

  getAllVerifications: async (status?: string): Promise<VerificationItem[]> => {
    let url = '/verifications';
    if (status) url += `?status=${status}`;
    return fetchJson<VerificationItem[]>(url);
  },

  confirmVerification: async (id: number) => {
    return fetchJson<{ success: boolean; message: string; status: string }>(
      `/verifications/${id}/confirm`,
      { method: 'POST' }
    );
  },

  denyVerification: async (id: number) => {
    return fetchJson<{ success: boolean; message: string; status: string }>(
      `/verifications/${id}/deny`,
      { method: 'POST' }
    );
  },

  // Analytics (Feature 3)
  getAnalyticsSummary: async (): Promise<AnalyticsSummary> => {
    return fetchJson<AnalyticsSummary>('/analytics/summary');
  },

  getVerificationQuality: async (): Promise<VerificationQuality> => {
    return fetchJson<VerificationQuality>('/analytics/verification-quality');
  },

  getSkillGaps: async (): Promise<SkillGapResponse> => {
    return fetchJson<SkillGapResponse>('/analytics/skill-gaps');
  },

  getAttritionRisk: async (): Promise<AttritionRiskResponse> => {
    return fetchJson<AttritionRiskResponse>('/analytics/attrition-risk');
  },

  getOutboundMessages: async (): Promise<{ engine: string; total_messages_logged: number; messages: OutboundMessage[] }> => {
    return fetchJson<{ engine: string; total_messages_logged: number; messages: OutboundMessage[] }>('/analytics/outbound-messages');
  },

  // Admin Reseed
  reseedDatabase: async () => {
    return fetchJson<{ success: boolean; message: string }>('/admin/reseed', { method: 'POST' });
  }
};
