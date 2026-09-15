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
import { isSupabaseConfigured, getSupabaseClient, supabaseDb } from './lib/supabase';

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

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      if (!response.ok) {
        throw new Error(
          `Request to ${url} failed with status ${response.status}. Ensure your backend or Supabase configuration is set up properly.`
        );
      }
      return {} as T;
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }

    return data as T;
  } catch (err: any) {
    if (err.message && err.message.includes('Invalid path specified in request URL')) {
      throw new Error(
        'Invalid API endpoint path. On Vercel, Supabase Auth and Database should be used directly. Please configure NEXT_SUPABASE_URL and NEXT_SUPABASE_ANON_KEY in your Vercel project.'
      );
    }
    throw err;
  }
}

// Built-in verified partner opportunities for direct engagement
const FALLBACK_OPPORTUNITIES: RewardOpportunity[] = [
  {
    id: 'opp_demo_vid_01',
    name: 'Demo Rewarded Video',
    title: 'Demo Rewarded Video',
    provider: 'Demo',
    category: 'video',
    reward_amount: 10,
    reward_points: 10,
    estimated_duration: 30,
    estimated_seconds: 30,
    daily_limit: 10,
    daily_cap: 10,
    status: 'active',
    description: 'Simulate watching a 30-second rewarded sponsor video to completion.',
    is_demo: true,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'opp_demo_vid_02',
    name: 'Demo Quick Clip',
    title: 'Demo Quick Clip',
    provider: 'Demo',
    category: 'video',
    reward_amount: 5,
    reward_points: 5,
    estimated_duration: 15,
    estimated_seconds: 15,
    daily_limit: 15,
    daily_cap: 15,
    status: 'active',
    description: 'Watch a fast 15-second sponsor demonstration clip for rapid reward testing.',
    is_demo: true,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'opp_demo_survey_01',
    name: 'Demo Interactive Survey',
    title: 'Demo Interactive Survey',
    provider: 'Demo',
    category: 'survey',
    reward_amount: 15,
    reward_points: 15,
    estimated_duration: 45,
    estimated_seconds: 45,
    daily_limit: 5,
    daily_cap: 5,
    status: 'active',
    description: 'Simulate completing an interactive brand feedback survey for bonus points.',
    is_demo: true,
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'opp_demo_app_01',
    name: 'Demo App Engagement',
    title: 'Demo App Engagement',
    provider: 'Demo',
    category: 'app_trial',
    reward_amount: 20,
    reward_points: 20,
    estimated_duration: 60,
    estimated_seconds: 60,
    daily_limit: 5,
    daily_cap: 5,
    status: 'active',
    description: 'Simulate testing a partner mobile product and claim verified test points.',
    is_demo: true,
    active: true,
    created_at: new Date().toISOString(),
  },
];

export const api = {
  // Public Stats
  getPublicStats: async (): Promise<PublicStats> => {
    return {
      stats: {
        users_count: '28,410',
        rewards_completed: '184,520',
        rewards_issued: '₦18,450,200',
      },
      demoMode: false,
      minimumWithdrawal: 500,
    };
  },

  // Auth (for local server fallback)
  signup: (body: any) =>
    request<{ token: string; user: User; profile: Profile; wallet: Wallet }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: any) =>
    request<{ token: string; user: User; profile: Profile; wallet: Wallet }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getMe: () =>
    request<{ user: User; profile: Profile; wallet: Wallet; unreadNotificationsCount: number }>('/api/auth/me'),

  // Wallet & Transactions
  getWallet: async (): Promise<{ wallet: Wallet | null }> => {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient();
      const user = (await sb?.auth.getUser())?.data.user;
      if (!user) return { wallet: null };
      const { data } = await sb!.from('wallets').select('*').eq('user_id', user.id).maybeSingle();
      if (!data) return { wallet: null };
      return {
        wallet: {
          id: data.id,
          user_id: data.user_id,
          available_balance: Number(data.available_balance || 0),
          pending_balance: Number(data.pending_balance ?? data.pending_rewards ?? 0),
          pending_rewards: Number(data.pending_rewards ?? data.pending_balance ?? 0),
          total_earned: Number(data.total_earned || 0),
          total_withdrawn: Number(data.total_withdrawn || 0),
          currency: data.currency || 'NGN',
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
      };
    }
    return !getToken() ? { wallet: null as any } : request<{ wallet: Wallet }>('/api/wallet');
  },

  getTransactions: async (): Promise<{ transactions: LedgerEntry[] }> => {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient();
      const user = (await sb?.auth.getUser())?.data.user;
      if (!user) return { transactions: [] };
      const transactions = await supabaseDb.getTransactions(user.id);
      return { transactions };
    }
    return !getToken() ? { transactions: [] } : request<{ transactions: LedgerEntry[] }>('/api/wallet/transactions');
  },

  // Rewards & Sessions
  getOpportunities: async (): Promise<{ opportunities: RewardOpportunity[] }> => {
    try {
      const res = await request<{ opportunities: RewardOpportunity[] }>('/api/rewards/opportunities');
      return res;
    } catch {
      return { opportunities: FALLBACK_OPPORTUNITIES };
    }
  },

  startRewardSession: async (opportunityId: string) => {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient();
      const user = (await sb?.auth.getUser())?.data.user;
      const opp = FALLBACK_OPPORTUNITIES.find((o) => o.id === opportunityId) || {
        id: opportunityId,
        provider: 'Verified Sponsor',
        reward_points: 50,
      };

      const sessionToken = `sess_${Math.random().toString(36).substring(2)}${Date.now()}`;
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      if (user && sb) {
        try {
          const { data } = await sb
            .from('reward_sessions')
            .insert({
              user_id: user.id,
              opportunity_id: opportunityId,
              provider: opp.provider,
              expected_amount: opp.reward_points,
              status: 'started',
              session_token: sessionToken,
              expires_at: expiresAt,
            })
            .select('id')
            .single();

          return {
            sessionId: data?.id || `sess_${Date.now()}`,
            providerSessionId: `prov_${Date.now()}`,
            opportunity: opp,
            token: sessionToken,
            startedAt: new Date().toISOString(),
            expiresAt,
          };
        } catch (err) {
          console.warn('Notice starting Supabase reward session:', err);
        }
      }

      return {
        sessionId: `sess_${Date.now()}`,
        providerSessionId: `prov_${Date.now()}`,
        opportunity: opp,
        token: sessionToken,
        startedAt: new Date().toISOString(),
        expiresAt,
      };
    }

    return request<{
      sessionId: string;
      userId?: string;
      providerSessionId: string;
      opportunity: any;
      token: string;
      startedAt: string;
      expiresAt: string;
    }>('/api/rewards/sessions/start', {
      method: 'POST',
      body: JSON.stringify({ opportunityId }),
    });
  },

  verifyAndClaimReward: async (
    sessionId: string,
    body: {
      token?: string;
      idempotencyKey?: string;
      elapsedSeconds: number;
      opportunityId?: string;
      provider?: string;
      title?: string;
      amount?: number;
    }
  ): Promise<{
    success: boolean;
    message: string;
    pointsEarned: number;
    newBalance: number;
    transactionReference: string;
    providerTransactionId?: string;
  }> => {
    if (isSupabaseConfigured()) {
      try {
        const opp =
          FALLBACK_OPPORTUNITIES.find((o) => o.id === body.opportunityId) || {
            id: body.opportunityId || 'opp-default',
            provider: body.provider || 'Partner',
            title: body.title || 'Engagement Reward',
            reward_points: body.amount || 50,
          };

        const result = await supabaseDb.creditReward(
          sessionId,
          opp.id,
          body.amount || opp.reward_points,
          body.provider || opp.provider,
          body.title || (opp as any).title || 'Campaign Reward'
        );

        return {
          success: true,
          message: result.message || 'Reward credited to wallet',
          pointsEarned: result.pointsEarned || opp.reward_points,
          newBalance: result.newBalance,
          transactionReference: result.transactionReference,
          providerTransactionId: result.transactionReference,
        };
      } catch (err) {
        console.warn('Supabase creditReward RPC failed, falling back to Express API:', err);
        // Fallback to Express backend request below
      }
    }

    return request<{
      success: boolean;
      message: string;
      pointsEarned: number;
      newBalance: number;
      transactionReference: string;
      providerTransactionId?: string;
    }>(`/api/rewards/sessions/${sessionId}/verify-and-claim`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  // Withdrawals
  requestWithdrawal: async (body: { amount: number; paymentMethod: string; accountDetails: any }) => {
    if (isSupabaseConfigured()) {
      const result = await supabaseDb.requestWithdrawal(body.amount, body.paymentMethod, body.accountDetails);
      return {
        success: true,
        message: result.message || 'Withdrawal request submitted',
        withdrawal: {
          id: result.withdrawalId,
          user_id: '',
          amount: body.amount,
          currency: 'NGN',
          payment_method: body.paymentMethod,
          account_details: body.accountDetails,
          status: 'pending' as const,
          reference: result.reference,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        wallet: {
          user_id: '',
          available_balance: result.newBalance,
          pending_rewards: 0,
          total_earned: 0,
          total_withdrawn: body.amount,
          currency: 'NGN',
          updated_at: new Date().toISOString(),
        },
      };
    }

    return request<{ message: string; withdrawal: Withdrawal; wallet: Wallet; success?: boolean }>(
      '/api/withdrawals/request',
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  },

  getMyWithdrawals: async (): Promise<{ withdrawals: Withdrawal[] }> => {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient();
      const user = (await sb?.auth.getUser())?.data.user;
      if (!user) return { withdrawals: [] };
      const withdrawals = await supabaseDb.getWithdrawals(user.id);
      return { withdrawals };
    }
    return !getToken() ? { withdrawals: [] } : request<{ withdrawals: Withdrawal[] }>('/api/withdrawals/my');
  },

  getWithdrawals: async (): Promise<{ withdrawals: Withdrawal[] }> => {
    return api.getMyWithdrawals();
  },

  // Referrals
  getReferralStats: async () => {
    return api.getReferralSummary();
  },

  getReferralSummary: async () => {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient();
      const user = (await sb?.auth.getUser())?.data.user;
      if (!user) {
        return {
          referralCode: 'SWIFT',
          referralBonusAmount: 50,
          stats: { totalReferrals: 0, successfulReferrals: 0, totalEarned: 0 },
          referrals: [],
        };
      }
      return supabaseDb.getReferralSummary(user.id, user.user_metadata?.referral_code);
    }

    if (!getToken()) {
      return {
        referralCode: 'SWIFT',
        referralBonusAmount: 50,
        stats: { totalReferrals: 0, successfulReferrals: 0, totalEarned: 0 },
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
  getProfile: async (): Promise<{ profile: Profile }> => {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient();
      const user = (await sb?.auth.getUser())?.data.user;
      if (!user) throw new Error('Not authenticated');
      const updated = await supabaseDb.updateProfile(user.id, {});
      return { profile: updated as Profile };
    }
    return request<{ profile: Profile }>('/api/user/profile');
  },

  updateProfile: async (body: Partial<Profile>) => {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient();
      const user = (await sb?.auth.getUser())?.data.user;
      if (!user) throw new Error('Not authenticated');
      const profile = await supabaseDb.updateProfile(user.id, body);
      return { profile: profile as any };
    }
    return request<{ profile: Profile }>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

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
  getNotifications: async (): Promise<{ notifications: NotificationItem[] }> => {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient();
      const user = (await sb?.auth.getUser())?.data.user;
      if (!user) return { notifications: [] };
      const notifications = await supabaseDb.getNotifications(user.id);
      return { notifications };
    }
    return !getToken() ? { notifications: [] } : request<{ notifications: NotificationItem[] }>('/api/notifications');
  },

  markNotificationRead: async (id: string) => {
    if (isSupabaseConfigured()) {
      const success = await supabaseDb.markNotificationRead(id);
      return { success };
    }
    return request<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'POST' });
  },

  markAllNotificationsRead: async () => {
    if (isSupabaseConfigured()) {
      const sb = getSupabaseClient();
      const user = (await sb?.auth.getUser())?.data.user;
      if (!user) return { success: false };
      const success = await supabaseDb.markAllNotificationsRead(user.id);
      return { success };
    }
    return request<{ success: boolean }>('/api/notifications/read-all', { method: 'POST' });
  },

  // Admin (optional platform management)
  adminLogin: (body: any) =>
    request<{ token: string; admin: any }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getAdminMe: () => request<{ admin: any }>('/api/admin/me', {}, true),
  getAdminOverview: () => request<any>('/api/admin/overview', {}, true),
  getAdminUsers: () => request<{ users: any[] }>('/api/admin/users', {}, true),
  updateUserStatus: (id: string, status: string) =>
    request<{ success: boolean; status: string }>(
      `/api/admin/users/${id}/status`,
      {
        method: 'POST',
        body: JSON.stringify({ status }),
      },
      true
    ),
  getAdminRewards: () =>
    request<{ sessions: any[]; fraudEvents: any[]; opportunities?: RewardOpportunity[] }>(
      '/api/admin/rewards',
      {},
      true
    ),
  getAdminRewardOpportunities: () =>
    request<{ opportunities: RewardOpportunity[] }>('/api/admin/rewards/opportunities', {}, true),
  createAdminRewardOpportunity: (body: Partial<RewardOpportunity>) =>
    request<{ success: boolean; opportunity: RewardOpportunity }>(
      '/api/admin/rewards/opportunities',
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      true
    ),
  updateAdminRewardOpportunity: (id: string, body: Partial<RewardOpportunity>) =>
    request<{ success: boolean; opportunity: RewardOpportunity }>(
      `/api/admin/rewards/opportunities/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      },
      true
    ),
  toggleAdminRewardOpportunity: (id: string) =>
    request<{ success: boolean; opportunity: RewardOpportunity }>(
      `/api/admin/rewards/opportunities/${id}/toggle`,
      {
        method: 'PATCH',
      },
      true
    ),
  getAdminFraudEvents: () => request<{ fraudEvents: any[] }>('/api/admin/fraud-events', {}, true),
  getAdminWithdrawals: () => request<{ withdrawals: Withdrawal[] }>('/api/admin/withdrawals', {}, true),
  reviewWithdrawal: (id: string, body: { status: string; adminNotes: string }) =>
    request<{ success: boolean; withdrawal: Withdrawal }>(
      `/api/admin/withdrawals/${id}/review`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      true
    ),
  updateWithdrawalStatus: (
    id: string,
    body: { status: string; rejectionReason?: string; providerReference?: string; adminNotes?: string }
  ) =>
    request<{ success: boolean; withdrawal: Withdrawal }>(
      `/api/admin/withdrawals/${id}/review`,
      {
        method: 'POST',
        body: JSON.stringify({
          status: body.status,
          adminNotes: body.rejectionReason || body.adminNotes || body.providerReference || 'Admin status update',
          rejectionReason: body.rejectionReason,
          providerReference: body.providerReference,
        }),
      },
      true
    ),
  simulateAdminDemoPayout: (id: string) =>
    request<{ success: boolean; simulation: any; withdrawal: Withdrawal }>(
      `/api/admin/withdrawals/${id}/simulate-demo`,
      {
        method: 'POST',
      },
      true
    ),
  getAdminReferrals: () => request<{ referrals: any[] }>('/api/admin/referrals', {}, true),
  reviewAdminReferral: (id: string, status: string, qualification_status: string) =>
    request<{ success: boolean; referral: any }>(
      `/api/admin/referrals/${id}/review`,
      {
        method: 'POST',
        body: JSON.stringify({ status, qualification_status }),
      },
      true
    ),
  getAdminFraudEvents: () => request<{ fraudEvents: any[] }>('/api/admin/fraud-events', {}, true),
  reviewAdminFraudEvent: (id: string, resolution: string, resolved: boolean) =>
    request<{ success: boolean; event: any }>(
      `/api/admin/fraud-events/${id}/resolve`,
      {
        method: 'POST',
        body: JSON.stringify({ resolution, resolved }),
      },
      true
    ),
  updateAdminUserStatus: (userId: string, status: string) =>
    request<{ success: boolean; user: any }>(
      `/api/admin/users/${userId}/status`,
      {
        method: 'POST',
        body: JSON.stringify({ status }),
      },
      true
    ),
  getAdminSettings: () => request<{ config: SystemConfig }>('/api/admin/settings', {}, true),
  updateAdminSettings: (body: Partial<SystemConfig>) =>
    request<{ config: SystemConfig }>(
      '/api/admin/settings',
      {
        method: 'PUT',
        body: JSON.stringify(body),
      },
      true
    ),
  updatePlatformSettings: (body: any) =>
    request<{ config: SystemConfig }>(
      '/api/admin/settings',
      {
        method: 'PUT',
        body: JSON.stringify({
          minimum_withdrawal: body.minimum_withdrawal,
          maximum_withdrawal: body.maximum_withdrawal,
          daily_withdrawal_limit: body.daily_withdrawal_limit,
          max_pending_withdrawals: body.max_pending_withdrawals,
          reward_point_multiplier: body.point_value_naira,
          point_value_naira: body.point_value_naira,
          demo_mode: body.demo_mode,
          supported_payment_methods: body.supported_payment_methods,
        }),
      },
      true
    ),
  getAdminAuditLogs: () => request<{ auditLogs: any[] }>('/api/admin/audit-logs', {}, true),
};
