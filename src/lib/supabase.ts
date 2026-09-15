/// <reference types="vite/client" />
import { createClient, SupabaseClient, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { User, Profile, Wallet, LedgerEntry, Withdrawal, NotificationItem } from '../types';

/**
 * Sanitizes and normalizes the Supabase project URL.
 * - Extracts only the origin (protocol + host), stripping subpaths like /rest/v1 or /auth/v1
 * - Strips trailing slashes and whitespace
 * - Prevents PostgREST PGRST125: "Invalid path specified in request URL" errors
 */
export function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let trimmed = rawUrl.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = `https://${trimmed}`;
  }
  try {
    const parsed = new URL(trimmed);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return trimmed
      .replace(/\/rest\/v1\/?$/, '')
      .replace(/\/auth\/v1\/?$/, '')
      .replace(/\/+$/, '');
  }
}

/**
 * Read environment variables supporting NEXT_SUPABASE_, NEXT_PUBLIC_SUPABASE_, and VITE_SUPABASE_
 */
function readEnvConfig(): { url: string; anonKey: string } {
  const rawUrl =
    import.meta.env.NEXT_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL ||
    (typeof process !== 'undefined' &&
      (process.env?.NEXT_SUPABASE_URL ||
        process.env?.NEXT_PUBLIC_SUPABASE_URL ||
        process.env?.VITE_SUPABASE_URL)) ||
    '';

  const rawKey =
    import.meta.env.NEXT_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    (typeof process !== 'undefined' &&
      (process.env?.NEXT_SUPABASE_ANON_KEY ||
        process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env?.VITE_SUPABASE_ANON_KEY)) ||
    '';

  return {
    url: sanitizeSupabaseUrl(String(rawUrl || '')),
    anonKey: String(rawKey || '').trim(),
  };
}

const STORAGE_KEY_URL = 'swift_earn_supabase_url';
const STORAGE_KEY_KEY = 'swift_earn_supabase_key';

export const getSupabaseConfig = (): { url: string; anonKey: string } => {
  const customUrl = localStorage.getItem(STORAGE_KEY_URL);
  const customKey = localStorage.getItem(STORAGE_KEY_KEY);
  const env = readEnvConfig();

  const url = customUrl ? sanitizeSupabaseUrl(customUrl) : env.url;
  const anonKey = customKey ? customKey.trim() : env.anonKey;

  return { url, anonKey };
};

export const setCustomSupabaseConfig = (url: string, anonKey: string) => {
  clientInstance = null;
  if (url && anonKey) {
    localStorage.setItem(STORAGE_KEY_URL, sanitizeSupabaseUrl(url));
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
  }
};

export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(
    url &&
    anonKey &&
    (url.startsWith('https://') || url.startsWith('http://localhost')) &&
    anonKey.length > 20
  );
};

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || !isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    });
  }
  return clientInstance;
};

/**
 * Friendly error message translator for Supabase authentication and PostgREST errors.
 * Preserves the actual underlying error while making it intelligible to users and developers.
 */
export const formatSupabaseAuthError = (error: any): string => {
  if (!error) return 'An unexpected authentication error occurred.';
  const message = error.message || error.error_description || String(error);
  const lower = message.toLowerCase();

  if (lower.includes('invalid path specified in request url')) {
    return 'Invalid Supabase API endpoint or URL format (PGRST125). Please ensure NEXT_PUBLIC_SUPABASE_URL is set to the project root (e.g., https://your-project.supabase.co) without /rest/v1 or trailing slashes, and that your database tables have been created using the provided SQL migration.';
  }
  if (lower.includes('user already registered') || lower.includes('already registered')) {
    return 'An account with this email address already exists. Please log in instead.';
  }
  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'Incorrect email or password. Please verify your credentials and try again.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Your email address is not yet confirmed. Please check your inbox for the confirmation link before logging in.';
  }
  if (lower.includes('password should be at least') || lower.includes('weak password')) {
    return 'Password is too weak. It must contain at least 6 characters.';
  }
  if (lower.includes('rate limit') || lower.includes('over_email_send_rate_limit')) {
    return 'Security limit reached: Too many signup attempts. Supabase restricts free-tier signups to 3 emails per hour. To test multiple accounts, please disable "Confirm email" in your Supabase Authentication settings, or try again later.';
  }
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'Network connection error. Please verify your internet connection and Supabase URL accessibility.';
  }
  if (lower.includes('invalid email') || lower.includes('unable to validate email')) {
    return 'Please enter a valid email address.';
  }
  if (lower.includes('token has expired') || lower.includes('session expired') || lower.includes('jwt expired')) {
    return 'Your reset session has expired. Please request a new password reset link.';
  }

  return message;
};

/**
 * Format a Supabase Auth User + Profile into our app's internal User format
 */
export const formatSupabaseUser = (
  sbUser: SupabaseAuthUser,
  profile?: Partial<Profile> | null
): User => {
  const referral =
    profile?.referral_code ||
    sbUser.user_metadata?.referral_code ||
    `SE-${sbUser.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;

  return {
    id: sbUser.id,
    email: sbUser.email || '',
    status: 'active',
    referralCode: referral,
    createdAt: sbUser.created_at,
  };
};

/**
 * Fallback profile structure if database trigger hasn't fired yet
 */
export const createDefaultProfileFromUser = (
  sbUser: SupabaseAuthUser,
  overrides?: Partial<Profile>
): Profile => {
  const rawName =
    overrides?.full_name ||
    sbUser.user_metadata?.full_name ||
    sbUser.email?.split('@')[0] ||
    'Swift Earner';

  const initials =
    rawName
      .split(' ')
      .filter(Boolean)
      .map((w: string) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'SE';

  const refCode =
    overrides?.referral_code ||
    sbUser.user_metadata?.referral_code ||
    `SE-${sbUser.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;

  return {
    id: sbUser.id,
    user_id: sbUser.id,
    full_name: rawName,
    email: sbUser.email || overrides?.email,
    avatar_initials: initials,
    country: overrides?.country || 'Nigeria',
    preferred_payment_method: overrides?.preferred_payment_method || 'bank_transfer',
    bank_name: overrides?.bank_name,
    account_number: overrides?.account_number,
    account_name: overrides?.account_name,
    referral_code: refCode,
    referred_by: overrides?.referred_by || sbUser.user_metadata?.referred_by || null,
    account_status: overrides?.account_status || 'active',
    email_notifications: true,
    reward_alerts: true,
    created_at: sbUser.created_at,
    updated_at: new Date().toISOString(),
  };
};

/**
 * Fallback zero-balance wallet
 */
export const createDefaultWalletFromUser = (userId: string): Wallet => {
  return {
    user_id: userId,
    available_balance: 0.0,
    pending_balance: 0.0,
    pending_rewards: 0.0,
    total_earned: 0.0,
    total_withdrawn: 0.0,
    currency: 'NGN',
    updated_at: new Date().toISOString(),
  };
};

/**
 * Fetch profile and wallet directly from Supabase tables
 */
export const fetchSupabaseProfileAndWallet = async (
  userId: string,
  sbUser?: SupabaseAuthUser
): Promise<{ profile: Profile | null; wallet: Wallet | null }> => {
  const sb = getSupabaseClient();
  if (!sb) {
    if (sbUser) {
      return {
        profile: createDefaultProfileFromUser(sbUser),
        wallet: createDefaultWalletFromUser(userId),
      };
    }
    return { profile: null, wallet: null };
  }

  try {
    const [profileRes, walletRes] = await Promise.all([
      sb.from('profiles').select('*').eq('id', userId).maybeSingle(),
      sb.from('wallets').select('*').eq('user_id', userId).maybeSingle(),
    ]);

    const profileData = profileRes.data;
    const walletData = walletRes.data;

    let profile: Profile | null = profileData
      ? {
          id: profileData.id,
          user_id: profileData.user_id || profileData.id,
          full_name: profileData.full_name || 'Swift Earner',
          email: profileData.email || sbUser?.email,
          avatar_initials: profileData.avatar_initials || 'SE',
          phone: profileData.phone,
          country: profileData.country || 'Nigeria',
          preferred_payment_method: profileData.preferred_payment_method || 'bank_transfer',
          bank_name: profileData.bank_name,
          account_number: profileData.account_number,
          account_name: profileData.account_name,
          referral_code: profileData.referral_code,
          referred_by: profileData.referred_by,
          account_status: profileData.account_status || 'active',
          email_notifications: profileData.email_notifications ?? true,
          reward_alerts: profileData.reward_alerts ?? true,
          created_at: profileData.created_at || new Date().toISOString(),
          updated_at: profileData.updated_at || new Date().toISOString(),
        }
      : null;

    let wallet: Wallet | null = walletData
      ? {
          id: walletData.id,
          user_id: walletData.user_id,
          available_balance: Number(walletData.available_balance || 0),
          pending_balance: Number(walletData.pending_balance ?? walletData.pending_rewards ?? 0),
          pending_rewards: Number(walletData.pending_rewards ?? walletData.pending_balance ?? 0),
          total_earned: Number(walletData.total_earned || 0),
          total_withdrawn: Number(walletData.total_withdrawn || 0),
          currency: walletData.currency || 'NGN',
          created_at: walletData.created_at,
          updated_at: walletData.updated_at || new Date().toISOString(),
        }
      : null;

    // If tables have not been created in Supabase yet, synthesize from Auth User metadata
    if (!profile && sbUser) {
      profile = createDefaultProfileFromUser(sbUser);
    }
    if (!wallet) {
      wallet = createDefaultWalletFromUser(userId);
    }

    return { profile, wallet };
  } catch (err) {
    console.warn('Notice: fetching Supabase custom profile/wallet tables, using fallback defaults:', err);
    if (sbUser) {
      return {
        profile: createDefaultProfileFromUser(sbUser),
        wallet: createDefaultWalletFromUser(userId),
      };
    }
    return { profile: null, wallet: null };
  }
};

/**
 * Direct Supabase database queries for user transactions, withdrawals, notifications, and referrals
 */
export const supabaseDb = {
  // 1. Ledger Entries
  async getTransactions(userId: string): Promise<LedgerEntry[]> {
    const sb = getSupabaseClient();
    if (!sb) return [];
    try {
      const { data, error } = await sb
        .from('ledger_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        type: row.type || (row.amount > 0 ? 'reward' : 'withdrawal'),
        entry_type: row.entry_type || (row.amount > 0 ? 'reward_credit' : 'withdrawal_debit'),
        amount: Number(row.amount),
        running_balance: Number(row.running_balance || 0),
        status: row.status,
        reference_type: row.reference_type,
        reference_id: row.reference_id,
        reference: row.reference,
        description: row.description,
        idempotency_key: row.idempotency_key,
        metadata: row.metadata,
        created_at: row.created_at,
      }));
    } catch (err) {
      console.warn('Notice: Could not load Supabase ledger entries:', err);
      return [];
    }
  },

  // 2. Withdrawals
  async getWithdrawals(userId: string): Promise<Withdrawal[]> {
    const sb = getSupabaseClient();
    if (!sb) return [];
    try {
      const { data, error } = await sb
        .from('withdrawals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        amount: Number(row.amount),
        currency: row.currency || 'NGN',
        payment_method: row.payment_method,
        account_details: row.account_details || {},
        status: row.status,
        reference: row.reference,
        admin_notes: row.admin_notes,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
    } catch (err) {
      console.warn('Notice: Could not load Supabase withdrawals:', err);
      return [];
    }
  },

  // 3. Request Withdrawal via secure PostgreSQL RPC (Cannot modify balance directly)
  async requestWithdrawal(amount: number, paymentMethod: string, accountDetails: any): Promise<any> {
    const sb = getSupabaseClient();
    if (!sb) throw new Error('Supabase is not configured.');

    const { data, error } = await sb.rpc('request_withdrawal', {
      p_amount: amount,
      p_payment_method: paymentMethod,
      p_account_details: accountDetails,
    });

    if (error) {
      throw new Error(error.message || 'Failed to submit withdrawal request.');
    }
    return data;
  },

  // 4. Notifications
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    const sb = getSupabaseClient();
    if (!sb) return [];
    try {
      const { data, error } = await sb
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        title: row.title,
        message: row.message,
        type: row.type,
        read: Boolean(row.read ?? row.is_read),
        created_at: row.created_at,
      }));
    } catch (err) {
      console.warn('Notice: Could not load Supabase notifications:', err);
      return [];
    }
  },

  async markNotificationRead(id: string): Promise<boolean> {
    const sb = getSupabaseClient();
    if (!sb) return false;
    const { error } = await sb.from('notifications').update({ is_read: true }).eq('id', id);
    return !error;
  },

  async markAllNotificationsRead(userId: string): Promise<boolean> {
    const sb = getSupabaseClient();
    if (!sb) return false;
    const { error } = await sb.from('notifications').update({ is_read: true }).eq('user_id', userId);
    return !error;
  },

  // 5. Referrals
  async getReferralSummary(userId: string, referralCode: string) {
    const sb = getSupabaseClient();
    if (!sb) {
      return {
        referralCode: referralCode || 'SWIFT',
        referralBonusAmount: 50,
        stats: { totalReferrals: 0, successfulReferrals: 0, totalEarned: 0 },
        referrals: [],
      };
    }
    try {
      const { data, error } = await sb
        .from('referrals')
        .select('*')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const list = data || [];
      const successful = list.filter((r: any) => r.status === 'rewarded' || r.status === 'active');
      const totalEarned = successful.reduce((sum: number, r: any) => sum + Number(r.reward_amount || 50), 0);

      return {
        referralCode: referralCode || 'SWIFT',
        referralBonusAmount: 50,
        stats: {
          totalReferrals: list.length,
          successfulReferrals: successful.length,
          totalEarned,
        },
        referrals: list.map((r: any) => ({
          id: r.id,
          referred_name: 'Referred Earner',
          created_at: r.created_at,
          status: r.status === 'rewarded' || r.status === 'active' ? 'completed' : 'pending',
        })),
      };
    } catch (err) {
      console.warn('Notice: Could not load Supabase referrals:', err);
      return {
        referralCode: referralCode || 'SWIFT',
        referralBonusAmount: 50,
        stats: { totalReferrals: 0, successfulReferrals: 0, totalEarned: 0 },
        referrals: [],
      };
    }
  },

  // 6. Reward Claim via secure PostgreSQL RPC (Cannot modify balance directly)
  async creditReward(
    sessionId: string,
    opportunityId: string,
    amount: number,
    provider: string,
    title: string
  ): Promise<any> {
    const sb = getSupabaseClient();
    if (!sb) throw new Error('Supabase is not configured.');

    const { data, error } = await sb.rpc('credit_reward', {
      p_session_id: sessionId && sessionId.length === 36 ? sessionId : null,
      p_opportunity_id: opportunityId,
      p_amount: amount,
      p_provider: provider,
      p_title: title,
    });

    if (error) {
      throw new Error(error.message || 'Failed to credit reward.');
    }
    return data;
  },

  // 6.1 Get Active Reward Opportunities from Supabase
  async getRewardOpportunities(): Promise<any[]> {
    const sb = getSupabaseClient();
    if (!sb) return [];
    try {
      const { data, error } = await sb
        .from('reward_opportunities')
        .select('*')
        .order('reward_amount', { ascending: false });

      if (error) throw error;
      return (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        title: row.name,
        description: row.description,
        reward_amount: Number(row.reward_amount),
        reward_points: Number(row.reward_amount),
        estimated_duration: Number(row.estimated_duration),
        estimated_seconds: Number(row.estimated_duration),
        daily_limit: Number(row.daily_limit || 10),
        daily_cap: Number(row.daily_limit || 10),
        status: row.status,
        provider: row.provider,
        category: row.category || 'video',
        is_demo: (row.provider || '').toLowerCase() === 'demo',
        active: row.status === 'active',
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
    } catch (err) {
      console.warn('Notice: Could not load Supabase reward_opportunities:', err);
      return [];
    }
  },

  // 6.2 Start Verified Reward Session on Server
  async startRewardSession(opportunityId: string): Promise<any> {
    const sb = getSupabaseClient();
    if (!sb) throw new Error('Supabase is not configured.');

    const { data, error } = await sb.rpc('start_reward_session', {
      p_opportunity_id: opportunityId,
    });

    if (error) {
      throw new Error(error.message || 'Failed to start verified reward session.');
    }
    return data;
  },

  // 6.3 Verify and Claim Reward Session on Server
  async verifyRewardSession(sessionId: string, idempotencyKey?: string): Promise<any> {
    const sb = getSupabaseClient();
    if (!sb) throw new Error('Supabase is not configured.');

    const { data, error } = await sb.rpc('verify_and_claim_reward', {
      p_session_id: sessionId,
      p_idempotency_key: idempotencyKey,
    });

    if (error) {
      throw new Error(error.message || 'Failed to verify reward session.');
    }
    return data;
  },

  // 6.4 Get Reward Session By ID
  async getRewardSessionById(sessionId: string): Promise<any | null> {
    const sb = getSupabaseClient();
    if (!sb) return null;
    try {
      const { data, error } = await sb
        .from('reward_sessions')
        .select('*')
        .eq('id', sessionId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch {
      return null;
    }
  },

  // 7. Update Profile
  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    const sb = getSupabaseClient();
    if (!sb) return null;
    const { data, error } = await sb
      .from('profiles')
      .update({
        full_name: updates.full_name,
        phone: updates.phone,
        country: updates.country,
        preferred_payment_method: updates.preferred_payment_method,
        bank_name: updates.bank_name,
        account_number: updates.account_number,
        account_name: updates.account_name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};

// Export alias for consistency
export const supabaseDatabase = supabaseDb;

