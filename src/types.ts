export interface User {
  id: string;
  email: string;
  status: 'active' | 'suspended' | 'flagged' | 'pending_verification';
  referralCode: string;
  createdAt?: string;
}

export interface Profile {
  user_id: string;
  full_name: string;
  avatar_initials: string;
  phone?: string;
  country: string;
  preferred_payment_method: 'bank_transfer' | 'fintech_wallet';
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  referral_code?: string;
  referred_by?: string;
  email_notifications: boolean;
  reward_alerts: boolean;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  user_id: string;
  available_balance: number;
  pending_rewards: number;
  total_earned: number;
  total_withdrawn: number;
  currency: string;
  updated_at: string;
}

export interface RewardOpportunity {
  id: string;
  title: string;
  description: string;
  category: 'video' | 'survey' | 'app_trial' | 'sponsored_task';
  reward_points: number;
  estimated_seconds: number;
  provider: string;
  is_demo: boolean;
  active: boolean;
  daily_cap: number;
  created_at: string;
}

export interface LedgerEntry {
  id: string;
  user_id: string;
  entry_type: 'reward_credit' | 'withdrawal_debit' | 'withdrawal_reversal' | 'referral_bonus' | 'admin_adjustment';
  amount: number;
  running_balance: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  reference: string;
  description: string;
  idempotency_key?: string;
  created_at: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  account_details: {
    bank_name?: string;
    account_number?: string;
    account_name?: string;
    wallet_id?: string;
  };
  reference: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'failed';
  admin_notes?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export type WithdrawalRequest = Withdrawal;

export interface ReferralSummary {
  referralCode: string;
  referralBonusAmount: number;
  stats: {
    totalReferrals: number;
    successfulReferrals: number;
    totalEarned: number;
  };
  referrals: Array<{
    id: string;
    referred_name?: string;
    created_at: string;
    status: string;
  }>;
}


export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'reward' | 'withdrawal' | 'referral' | 'system' | 'security';
  read: boolean;
  created_at: string;
}

export interface SystemConfig {
  reward_point_multiplier: number;
  minimum_withdrawal: number;
  maximum_daily_rewards: number;
  referral_bonus_amount: number;
  allowed_providers: string[];
  demo_mode: boolean;
  public_stats: {
    users_count: string;
    rewards_completed: string;
    rewards_issued: string;
  };
}

export interface PublicStats {
  stats: {
    users_count: string;
    rewards_completed: string;
    rewards_issued: string;
  };
  demoMode: boolean;
  minimumWithdrawal: number;
}
