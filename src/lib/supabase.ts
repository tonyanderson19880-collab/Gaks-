/// <reference types="vite/client" />
import { createClient, SupabaseClient, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { User, Profile, Wallet } from '../types';

const ENV_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const STORAGE_KEY_URL = 'swift_earn_supabase_url';
const STORAGE_KEY_KEY = 'swift_earn_supabase_key';

export const getSupabaseConfig = (): { url: string; anonKey: string } => {
  const customUrl = localStorage.getItem(STORAGE_KEY_URL);
  const customKey = localStorage.getItem(STORAGE_KEY_KEY);

  const url = customUrl || ENV_SUPABASE_URL;
  const anonKey = customKey || ENV_SUPABASE_ANON_KEY;

  return { url, anonKey };
};

export const setCustomSupabaseConfig = (url: string, anonKey: string) => {
  clientInstance = null;
  if (url && anonKey) {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
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
      },
    });
  }
  return clientInstance;
};

/**
 * Friendly error message translator for Supabase authentication errors
 */
export const formatSupabaseAuthError = (error: any): string => {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const message = error.message || error.error_description || String(error);
  const lower = message.toLowerCase();

  if (lower.includes('user already registered') || lower.includes('already registered')) {
    return 'An account with this email address already exists. Please log in instead.';
  }
  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'Incorrect email or password. Please verify your credentials and try again.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please confirm your email address before logging in. Check your inbox for the confirmation link.';
  }
  if (lower.includes('password should be at least') || lower.includes('weak password')) {
    return 'Password is too weak. It must contain at least 6 characters.';
  }
  if (lower.includes('rate limit') || lower.includes('over_email_send_rate_limit')) {
    return 'Too many attempts. Please wait a few minutes before trying again.';
  }
  if (lower.includes('network') || lower.includes('failed to fetch')) {
    return 'Network connection error. Please check your internet connection and try again.';
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
 * Create a sensible fallback profile if tables are not yet migrated
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
    user_id: sbUser.id,
    full_name: rawName,
    avatar_initials: initials,
    country: overrides?.country || 'Nigeria',
    preferred_payment_method: overrides?.preferred_payment_method || 'bank_transfer',
    bank_name: overrides?.bank_name,
    account_number: overrides?.account_number,
    account_name: overrides?.account_name,
    referral_code: refCode,
    referred_by: overrides?.referred_by || sbUser.user_metadata?.referred_by,
    email_notifications: true,
    reward_alerts: true,
    created_at: sbUser.created_at,
    updated_at: new Date().toISOString(),
  };
};

/**
 * Create a sensible fallback wallet
 */
export const createDefaultWalletFromUser = (userId: string): Wallet => {
  return {
    user_id: userId,
    available_balance: 0.0,
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
          user_id: profileData.id || profileData.user_id,
          full_name: profileData.full_name || 'Swift Earner',
          avatar_initials: profileData.avatar_initials || 'SE',
          phone: profileData.phone,
          country: profileData.country || 'Nigeria',
          preferred_payment_method: profileData.preferred_payment_method || 'bank_transfer',
          bank_name: profileData.bank_name,
          account_number: profileData.account_number,
          account_name: profileData.account_name,
          referral_code: profileData.referral_code,
          referred_by: profileData.referred_by,
          email_notifications: profileData.email_notifications ?? true,
          reward_alerts: profileData.reward_alerts ?? true,
          created_at: profileData.created_at || new Date().toISOString(),
          updated_at: profileData.updated_at || new Date().toISOString(),
        }
      : null;

    let wallet: Wallet | null = walletData
      ? {
          user_id: walletData.user_id,
          available_balance: Number(walletData.available_balance || 0),
          pending_rewards: Number(walletData.pending_rewards || 0),
          total_earned: Number(walletData.total_earned || 0),
          total_withdrawn: Number(walletData.total_withdrawn || 0),
          currency: walletData.currency || 'NGN',
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
