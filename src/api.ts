import {
  User,
  Profile,
  Wallet,
  RewardOpportunity,
  LedgerEntry,
  Withdrawal,
  NotificationItem,
  SystemConfig,
  PublicStats,
} from './types';

const TOKEN_KEY = 'swift_earn_token';
const ADMIN_TOKEN_KEY = 'swift_earn_admin_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function removeAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

async function request<T>(url: string, options: RequestInit = {}, isAdmin = false): Promise<T> {
  const token = isAdmin ? getAdminToken() : getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Network request failed');
  }

  return data as T;
}

export const api = {
  // Public
  getPublicStats: () => request<PublicStats>('/api/stats/public'),

  // Auth
  signup: (body: any) => request<{ token: string; user: User; profile: Profile; wallet: Wallet }>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(body),
  }),

  login: (body: any) => request<{ token: string; user: User; profile: Profile; wallet: Wallet }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  }),

  getMe: () => request<{ user: User; profile: Profile; wallet: Wallet; unreadNotificationsCount: number }>('/api/auth/me'),

  // Wallet
  getWallet: () =>
    !getToken()
      ? Promise.resolve({ wallet: null as any })
      : request<{ wallet: Wallet }>('/api/wallet'),
  getTransactions: () =>
    !getToken()
      ? Promise.resolve({ transactions: [] })
      : request<{ transactions: LedgerEntry[] }>('/api/wallet/transactions'),

  // Rewards & Sessions
  getOpportunities: () => request<{ opportunities: RewardOpportunity[] }>('/api/rewards/opportunities'),
  startRewardSession: (opportunityId: string) =>
    request<{
      sessionId: string;
      providerSessionId: string;
      opportunity: any;
      token: string;
      startedAt: string;
      expiresAt: string;
    }>('/api/rewards/sessions/start', {
      method: 'POST',
      body: JSON.stringify({ opportunityId }),
    }),

  verifyAndClaimReward: (sessionId: string, body: { token: string; elapsedSeconds: number }) =>
    request<{
      success: boolean;
      message: string;
      pointsEarned: number;
      newBalance: number;
      transactionReference: string;
      providerTransactionId?: string;
    }>(`/api/rewards/sessions/${sessionId}/verify-and-claim`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Withdrawals
  requestWithdrawal: (body: { amount: number; paymentMethod: string; accountDetails: any }) =>
    request<{ message: string; withdrawal: Withdrawal; wallet: Wallet; success?: boolean }>('/api/withdrawals/request', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getMyWithdrawals: () =>
    !getToken()
      ? Promise.resolve({ withdrawals: [] })
      : request<{ withdrawals: Withdrawal[] }>('/api/withdrawals/my'),
  getWithdrawals: () =>
    !getToken()
      ? Promise.resolve({ withdrawals: [] })
      : request<{ withdrawals: Withdrawal[] }>('/api/withdrawals/my'),

  // Referrals
  getReferralStats: () =>
    !getToken()
      ? Promise.resolve({
          referralCode: 'SWIFT',
          referralBonusAmount: 50,
          totalCount: 0,
          totalBonusEarned: 0,
          referrals: [],
        })
      : request<{
          referralCode: string;
          referralBonusAmount: number;
          totalCount: number;
          totalBonusEarned: number;
          referrals: any[];
        }>('/api/referrals/my-stats'),
  getReferralSummary: async () => {
    if (!getToken()) {
      return {
        referralCode: 'SWIFT',
        referralBonusAmount: 50,
        stats: {
          totalReferrals: 0,
          successfulReferrals: 0,
          totalEarned: 0,
        },
        referrals: [],
      };
    }
    const res = await request<{
      referralCode: string;
      referralBonusAmount: number;
      totalCount: number;
      totalBonusEarned: number;
      referrals: any[];
    }>('/api/referrals/my-stats');
    return {
      referralCode: res.referralCode,
      referralBonusAmount: res.referralBonusAmount,
      stats: {
        totalReferrals: res.totalCount,
        successfulReferrals: (res.referrals || []).filter(
          (r: any) => r.status === 'successful' || r.status === 'rewarded'
        ).length,
        totalEarned: res.totalBonusEarned,
      },
      referrals: (res.referrals || []).map((r: any) => ({
        id: r.id,
        referred_name: r.referred_name || 'Member',
        created_at: r.created_at,
        status: r.status === 'successful' || r.status === 'rewarded' ? 'completed' : 'pending',
      })),
    };
  },

  // Profile & Settings
  getProfile: () => request<{ profile: Profile }>('/api/user/profile'),
  updateProfile: (body: Partial<Profile>) =>
    request<{ profile: Profile }>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  updatePassword: (body: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>('/api/user/password', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>('/api/user/password', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  // Notifications
  getNotifications: () =>
    !getToken()
      ? Promise.resolve({ notifications: [] })
      : request<{ notifications: NotificationItem[] }>('/api/notifications'),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/api/notifications/read-all', { method: 'POST' }),

  // Admin
  adminLogin: (body: any) =>
    request<{ token: string; admin: any }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getAdminMe: () => request<{ admin: any }>('/api/admin/me', {}, true),
  getAdminOverview: () => request<any>('/api/admin/overview', {}, true),
  getAdminUsers: () => request<{ users: any[] }>('/api/admin/users', {}, true),
  updateUserStatus: (id: string, status: string) =>
    request<{ success: boolean; status: string }>(`/api/admin/users/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }, true),
  getAdminRewards: () => request<{ sessions: any[]; fraudEvents: any[] }>('/api/admin/rewards', {}, true),
  getAdminWithdrawals: () => request<{ withdrawals: Withdrawal[] }>('/api/admin/withdrawals', {}, true),
  reviewWithdrawal: (id: string, body: { status: string; adminNotes: string }) =>
    request<{ success: boolean; withdrawal: Withdrawal }>(`/api/admin/withdrawals/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(body),
    }, true),
  updateWithdrawalStatus: (id: string, body: { status: string; rejectionReason?: string; providerReference?: string }) =>
    request<{ success: boolean; withdrawal: Withdrawal }>(`/api/admin/withdrawals/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ status: body.status, adminNotes: body.rejectionReason || body.providerReference || 'Admin status update' }),
    }, true),
  getAdminReferrals: () => request<{ referrals: any[] }>('/api/admin/referrals', {}, true),
  getAdminSettings: () => request<{ config: SystemConfig }>('/api/admin/settings', {}, true),
  updateAdminSettings: (body: Partial<SystemConfig>) =>
    request<{ config: SystemConfig }>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(body),
    }, true),
  updatePlatformSettings: (body: any) =>
    request<{ config: SystemConfig }>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({
        minimum_withdrawal: body.minimum_withdrawal,
        reward_point_multiplier: body.point_value_naira,
        demo_mode: body.demo_mode,
      }),
    }, true),
  getAdminAuditLogs: () => request<{ auditLogs: any[] }>('/api/admin/audit-logs', {}, true),
};
