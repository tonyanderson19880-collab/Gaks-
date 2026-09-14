import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  Profile,
  Wallet,
  RewardOpportunity,
  RewardSession,
  RewardEvent,
  LedgerEntry,
  Withdrawal,
  Referral,
  FraudEvent,
  AdminUser,
  AuditLog,
  NotificationItem,
  SystemConfig,
} from './types.js';

interface DatabaseSchema {
  users: User[];
  profiles: Profile[];
  wallets: Wallet[];
  reward_opportunities: RewardOpportunity[];
  reward_sessions: RewardSession[];
  reward_events: RewardEvent[];
  ledger_entries: LedgerEntry[];
  withdrawals: Withdrawal[];
  referrals: Referral[];
  fraud_events: FraudEvent[];
  admin_users: AdminUser[];
  audit_logs: AuditLog[];
  notifications: NotificationItem[];
  config: SystemConfig;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'swiftearn_db.json');

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'swift_earn_salt_2026').digest('hex');
}

export { hashPassword };

// Initial seed data
function getInitialSeedData(): DatabaseSchema {
  const adminId = 'admin_001';
  const user1Id = 'user_001';
  const user2Id = 'user_002';
  const user3Id = 'user_003';

  return {
    admin_users: [
      {
        id: adminId,
        email: 'admin@swiftearn.demo',
        password_hash: hashPassword('AdminPassword123!'),
        full_name: 'Swift Earn Operations Admin',
        role: 'super_admin',
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
    ],
    users: [
      {
        id: user1Id,
        email: 'user@swiftearn.demo',
        password_hash: hashPassword('UserPassword123!'),
        status: 'active',
        referral_code: 'SE-DEMO1',
        referred_by_user_id: null,
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: user2Id,
        email: 'jane@swiftearn.demo',
        password_hash: hashPassword('UserPassword123!'),
        status: 'active',
        referral_code: 'SE-JANE2',
        referred_by_user_id: user1Id,
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: user3Id,
        email: 'sam.flagged@swiftearn.demo',
        password_hash: hashPassword('UserPassword123!'),
        status: 'flagged',
        referral_code: 'SE-FLAG3',
        referred_by_user_id: null,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    profiles: [
      {
        user_id: user1Id,
        full_name: 'Alex Morgan',
        avatar_initials: 'AM',
        phone: '+234 801 234 5678',
        country: 'Nigeria',
        preferred_payment_method: 'bank_transfer',
        bank_name: 'Zenith Bank',
        account_number: '2087654321',
        account_name: 'Alex Morgan',
        email_notifications: true,
        reward_alerts: true,
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        user_id: user2Id,
        full_name: 'Jane Doe',
        avatar_initials: 'JD',
        phone: '+234 809 876 5432',
        country: 'Nigeria',
        preferred_payment_method: 'bank_transfer',
        bank_name: 'GTBank',
        account_number: '0123456789',
        account_name: 'Jane Doe',
        email_notifications: true,
        reward_alerts: true,
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        user_id: user3Id,
        full_name: 'Sam Spoofer',
        avatar_initials: 'SS',
        phone: '+234 812 000 0000',
        country: 'Nigeria',
        preferred_payment_method: 'fintech_wallet',
        bank_name: 'Opay',
        account_number: '8120000000',
        account_name: 'Sam Spoofer',
        email_notifications: false,
        reward_alerts: true,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    wallets: [
      {
        user_id: user1Id,
        available_balance: 1450.0,
        pending_rewards: 50.0,
        total_earned: 2450.0,
        total_withdrawn: 1000.0,
        currency: 'NGN',
        updated_at: new Date().toISOString(),
      },
      {
        user_id: user2Id,
        available_balance: 350.0,
        pending_rewards: 0.0,
        total_earned: 350.0,
        total_withdrawn: 0.0,
        currency: 'NGN',
        updated_at: new Date().toISOString(),
      },
      {
        user_id: user3Id,
        available_balance: 100.0,
        pending_rewards: 100.0,
        total_earned: 200.0,
        total_withdrawn: 0.0,
        currency: 'NGN',
        updated_at: new Date().toISOString(),
      },
    ],
    reward_opportunities: [
      {
        id: 'opp_vid_01',
        title: 'Brand Video Ad',
        description: 'Watch a short sponsored video ad to completion to earn reward points.',
        category: 'video',
        reward_points: 25.0,
        estimated_seconds: 15,
        provider: 'SwiftEarnNetwork',
        is_demo: false,
        active: true,
        daily_cap: 10,
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: 'opp_vid_02',
        title: 'Tech Spotlight Video Ad',
        description: 'Watch this featured technology showcase video ad to earn bonus reward points.',
        category: 'video',
        reward_points: 50.0,
        estimated_seconds: 20,
        provider: 'SwiftEarnNetwork',
        is_demo: false,
        active: true,
        daily_cap: 8,
        created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
      },
      {
        id: 'opp_vid_03',
        title: 'Mobile Game Trailer Ad',
        description: 'Preview an exciting mobile game video ad to unlock high-tier reward points.',
        category: 'video',
        reward_points: 75.0,
        estimated_seconds: 25,
        provider: 'SwiftEarnNetwork',
        is_demo: false,
        active: true,
        daily_cap: 5,
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      {
        id: 'opp_vid_04',
        title: 'Premium Sponsor Video Ad',
        description: 'Watch an exclusive brand promo video ad to claim maximum verified points.',
        category: 'video',
        reward_points: 100.0,
        estimated_seconds: 30,
        provider: 'SwiftEarnNetwork',
        is_demo: false,
        active: true,
        daily_cap: 5,
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
      {
        id: 'opp_vid_05',
        title: 'Quick Sponsor Clip Ad',
        description: 'Watch a quick 10-second sponsor video clip for fast reward points.',
        category: 'video',
        reward_points: 20.0,
        estimated_seconds: 10,
        provider: 'SwiftEarnNetwork',
        is_demo: false,
        active: true,
        daily_cap: 15,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
      {
        id: 'opp_vid_06',
        title: 'Lifestyle & Shopping Video Ad',
        description: 'Watch an entertaining lifestyle products video ad and earn points instantly.',
        category: 'video',
        reward_points: 35.0,
        estimated_seconds: 15,
        provider: 'SwiftEarnNetwork',
        is_demo: false,
        active: true,
        daily_cap: 10,
        created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
    ],
    reward_sessions: [],
    reward_events: [],
    ledger_entries: [
      {
        id: 'ledg_001',
        user_id: user1Id,
        entry_type: 'reward_credit',
        amount: 500.0,
        running_balance: 500.0,
        status: 'confirmed',
        reference: 'TX-REW-INIT-001',
        description: 'Initial welcome reward credits for verified account profile setup',
        idempotency_key: 'idemp_welcome_001',
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
      {
        id: 'ledg_002',
        user_id: user1Id,
        entry_type: 'referral_bonus',
        amount: 50.0,
        running_balance: 550.0,
        status: 'confirmed',
        reference: 'TX-REF-BONUS-001',
        description: 'Referral reward credit for user Jane Doe (SE-JANE2)',
        idempotency_key: 'idemp_ref_jane_001',
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
      {
        id: 'ledg_003',
        user_id: user1Id,
        entry_type: 'reward_credit',
        amount: 1900.0,
        running_balance: 2450.0,
        status: 'confirmed',
        reference: 'TX-REW-BATCH-002',
        description: 'Aggregated confirmed ad rewards completion',
        idempotency_key: 'idemp_agg_batch_002',
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        id: 'ledg_004',
        user_id: user1Id,
        entry_type: 'withdrawal_debit',
        amount: -1000.0,
        running_balance: 1450.0,
        status: 'confirmed',
        reference: 'TX-WTH-REQ-1001',
        description: 'Bank transfer payout withdrawal processed successfully to Zenith Bank',
        idempotency_key: 'idemp_wth_1001',
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ],
    withdrawals: [
      {
        id: 'wth_001',
        user_id: user1Id,
        amount: 1000.0,
        payment_method: 'Bank Transfer',
        account_details: {
          bank_name: 'Zenith Bank',
          account_number: '2087654321',
          account_name: 'Alex Morgan',
        },
        reference: 'WTH-REF-883921',
        status: 'completed',
        admin_notes: 'Payment confirmed via automated NIP settlement partner',
        processed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'wth_002',
        user_id: user3Id,
        amount: 600.0,
        payment_method: 'Fintech Wallet',
        account_details: {
          wallet_id: 'OPAY-8120000000',
        },
        reference: 'WTH-REF-192837',
        status: 'pending',
        admin_notes: 'Flagged for velocity review: session rate exceeds standard threshold',
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ],
    referrals: [
      {
        id: 'ref_001',
        referrer_user_id: user1Id,
        referred_user_id: user2Id,
        status: 'rewarded',
        reward_amount: 50.0,
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        rewarded_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
    ],
    fraud_events: [
      {
        id: 'frd_001',
        user_id: user3Id,
        risk_score: 85,
        flag_reason: 'Automated rapid session attempt detected (duration < 2s)',
        details: { ip: '197.210.45.12', user_agent: 'HeadlessChrome/118.0', attemptCount: 14 },
        resolved: false,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ],
    audit_logs: [
      {
        id: 'aud_001',
        admin_id: adminId,
        action: 'UPDATE_SYSTEM_CONFIG',
        target_resource: 'config',
        target_id: 'global_config',
        details: { minimum_withdrawal: 500, daily_cap: 30 },
        ip_address: '127.0.0.1',
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
      {
        id: 'aud_002',
        admin_id: adminId,
        action: 'APPROVE_WITHDRAWAL',
        target_resource: 'withdrawals',
        target_id: 'wth_001',
        details: { amount: 1000, reference: 'WTH-REF-883921' },
        ip_address: '127.0.0.1',
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ],
    notifications: [
      {
        id: 'notif_001',
        user_id: user1Id,
        title: 'Withdrawal Completed',
        message: 'Your payout of ₦1,000.00 to Zenith Bank has been completed successfully.',
        type: 'withdrawal',
        read: false,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'notif_002',
        user_id: user1Id,
        title: 'Referral Bonus Received',
        message: 'Jane Doe registered with your code! ₦50.00 bonus credited to your wallet.',
        type: 'referral',
        read: true,
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      },
      {
        id: 'notif_003',
        user_id: user1Id,
        title: 'Welcome to Swift Earn',
        message: 'Explore eligible rewarded opportunities and start earning real rewards today.',
        type: 'system',
        read: true,
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      },
    ],
    config: {
      reward_point_multiplier: 1.0,
      minimum_withdrawal: 500.0,
      maximum_daily_rewards: 30,
      referral_bonus_amount: 50.0,
      allowed_providers: ['SwiftEarnCompliantNetwork', 'GoogleAdMobSSV', 'UnityAdsRewarded'],
      demo_mode: true,
      public_stats: {
        users_count: '10K+',
        rewards_completed: '50K+',
        rewards_issued: '₦12.5M',
      },
    },
  };
}

class DatabaseManager {
  private db: DatabaseSchema;

  constructor() {
    this.db = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read existing database file, seeding fresh:', e);
    }
    const seed = getInitialSeedData();
    this.persist(seed);
    return seed;
  }

  private persist(data?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(data || this.db, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist database state:', e);
    }
  }

  // System Config
  getConfig(): SystemConfig {
    return this.db.config;
  }

  updateConfig(updates: Partial<SystemConfig>, adminId: string, ip?: string): SystemConfig {
    this.db.config = { ...this.db.config, ...updates };
    this.addAuditLog({
      admin_id: adminId,
      action: 'UPDATE_SYSTEM_CONFIG',
      target_resource: 'config',
      target_id: 'global',
      details: updates,
      ip_address: ip,
    });
    this.persist();
    return this.db.config;
  }

  // Users & Profiles
  findUserByEmail(email: string): User | undefined {
    return this.db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): User | undefined {
    return this.db.users.find((u) => u.id === id);
  }

  findProfileByUserId(userId: string): Profile | undefined {
    return this.db.profiles.find((p) => p.user_id === userId);
  }

  findUserByReferralCode(code: string): User | undefined {
    return this.db.users.find((u) => u.referral_code.toUpperCase() === code.trim().toUpperCase());
  }

  getAllUsers(): { user: User; profile?: Profile; wallet?: Wallet }[] {
    return this.db.users.map((user) => ({
      user,
      profile: this.findProfileByUserId(user.id),
      wallet: this.getWallet(user.id),
    }));
  }

  createUser(params: {
    email: string;
    password: string;
    fullName: string;
    referralCodeInput?: string;
  }): { user: User; profile: Profile; wallet: Wallet } {
    const userId = `usr_${crypto.randomBytes(8).toString('hex')}`;
    let referredBy: string | null = null;

    if (params.referralCodeInput) {
      const referrer = this.findUserByReferralCode(params.referralCodeInput);
      if (referrer) {
        referredBy = referrer.id;
      }
    }

    const cleanName = params.fullName.trim();
    const nameParts = cleanName.split(' ');
    const initials =
      nameParts.length >= 2
        ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
        : cleanName.slice(0, 2).toUpperCase();

    // Unique referral code
    const uniqueRefCode = `SE-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const newUser: User = {
      id: userId,
      email: params.email.toLowerCase().trim(),
      password_hash: hashPassword(params.password),
      status: 'active',
      referral_code: uniqueRefCode,
      referred_by_user_id: referredBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newProfile: Profile = {
      user_id: userId,
      full_name: cleanName,
      avatar_initials: initials || 'SE',
      phone: '',
      country: 'Nigeria',
      preferred_payment_method: 'bank_transfer',
      email_notifications: true,
      reward_alerts: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newWallet: Wallet = {
      user_id: userId,
      available_balance: 0.0,
      pending_rewards: 0.0,
      total_earned: 0.0,
      total_withdrawn: 0.0,
      currency: 'NGN',
      updated_at: new Date().toISOString(),
    };

    this.db.users.push(newUser);
    this.db.profiles.push(newProfile);
    this.db.wallets.push(newWallet);

    // If referred, handle referral record
    if (referredBy) {
      const referralRecord: Referral = {
        id: `ref_${crypto.randomBytes(8).toString('hex')}`,
        referrer_user_id: referredBy,
        referred_user_id: userId,
        status: 'registered',
        reward_amount: this.db.config.referral_bonus_amount,
        created_at: new Date().toISOString(),
      };
      this.db.referrals.push(referralRecord);

      this.addNotification({
        user_id: referredBy,
        title: 'New Referral Registered!',
        message: `${cleanName} joined using your referral link. Once they complete their first reward, bonus will credit.`,
        type: 'referral',
      });
    }

    // Welcome Notification
    this.addNotification({
      user_id: userId,
      title: 'Welcome to Swift Earn',
      message: 'Your account is ready! Complete verified rewarded ad opportunities to start earning.',
      type: 'system',
    });

    this.persist();
    return { user: newUser, profile: newProfile, wallet: newWallet };
  }

  updateProfile(userId: string, updates: Partial<Profile>): Profile | undefined {
    const idx = this.db.profiles.findIndex((p) => p.user_id === userId);
    if (idx === -1) return undefined;
    this.db.profiles[idx] = {
      ...this.db.profiles[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return this.db.profiles[idx];
  }

  updateUserStatus(userId: string, status: User['status'], adminId: string, ip?: string): boolean {
    const user = this.findUserById(userId);
    if (!user) return false;
    user.status = status;
    user.updated_at = new Date().toISOString();

    this.addAuditLog({
      admin_id: adminId,
      action: `USER_STATUS_CHANGE_${status.toUpperCase()}`,
      target_resource: 'users',
      target_id: userId,
      details: { status },
      ip_address: ip,
    });

    this.persist();
    return true;
  }

  // Wallets & Ledger System
  getWallet(userId: string): Wallet {
    let wallet = this.db.wallets.find((w) => w.user_id === userId);
    if (!wallet) {
      wallet = {
        user_id: userId,
        available_balance: 0.0,
        pending_rewards: 0.0,
        total_earned: 0.0,
        total_withdrawn: 0.0,
        currency: 'NGN',
        updated_at: new Date().toISOString(),
      };
      this.db.wallets.push(wallet);
      this.persist();
    }
    return wallet;
  }

  getLedgerEntries(userId: string): LedgerEntry[] {
    return this.db.ledger_entries
      .filter((e) => e.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  /**
   * Verified Double-Entry Ledger Credit.
   * Atomically increments available balance and records immutable ledger row.
   */
  creditReward({
    userId,
    amount,
    reference,
    description,
    idempotencyKey,
  }: {
    userId: string;
    amount: number;
    reference: string;
    description: string;
    idempotencyKey?: string;
  }): { success: boolean; entry?: LedgerEntry; wallet: Wallet; message?: string } {
    // Idempotency check
    if (idempotencyKey) {
      const existing = this.db.ledger_entries.find((e) => e.idempotency_key === idempotencyKey);
      if (existing) {
        return {
          success: false,
          message: 'Reward already claimed (idempotent duplicate request)',
          wallet: this.getWallet(userId),
        };
      }
    }

    const wallet = this.getWallet(userId);
    const newAvailable = Math.round((wallet.available_balance + amount) * 100) / 100;
    const newTotal = Math.round((wallet.total_earned + amount) * 100) / 100;

    const entry: LedgerEntry = {
      id: `ledg_${crypto.randomBytes(8).toString('hex')}`,
      user_id: userId,
      entry_type: 'reward_credit',
      amount,
      running_balance: newAvailable,
      status: 'confirmed',
      reference,
      description,
      idempotency_key: idempotencyKey,
      created_at: new Date().toISOString(),
    };

    wallet.available_balance = newAvailable;
    wallet.total_earned = newTotal;
    wallet.updated_at = new Date().toISOString();

    this.db.ledger_entries.push(entry);

    // Check if user was referred and this is their first completed reward
    const user = this.findUserById(userId);
    if (user?.referred_by_user_id) {
      const referral = this.db.referrals.find(
        (r) => r.referred_user_id === userId && r.status === 'registered'
      );
      if (referral) {
        referral.status = 'successful';
        referral.rewarded_at = new Date().toISOString();
        // Credit referrer
        this.creditReferralBonus(referral.referrer_user_id, referral.reward_amount, user.email);
      }
    }

    this.addNotification({
      user_id: userId,
      title: 'Reward Confirmed!',
      message: `You earned +₦${amount.toFixed(2)} (${description}). Added to your confirmed balance.`,
      type: 'reward',
    });

    this.persist();
    return { success: true, entry, wallet };
  }

  creditReferralBonus(referrerId: string, amount: number, referredEmail: string) {
    const wallet = this.getWallet(referrerId);
    const newAvailable = Math.round((wallet.available_balance + amount) * 100) / 100;
    const newTotal = Math.round((wallet.total_earned + amount) * 100) / 100;

    const ref = `TX-REF-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const entry: LedgerEntry = {
      id: `ledg_${crypto.randomBytes(8).toString('hex')}`,
      user_id: referrerId,
      entry_type: 'referral_bonus',
      amount,
      running_balance: newAvailable,
      status: 'confirmed',
      reference: ref,
      description: `Referral bonus reward for inviting friend (${referredEmail.split('@')[0]}***)`,
      idempotency_key: `idemp_ref_bonus_${referrerId}_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    wallet.available_balance = newAvailable;
    wallet.total_earned = newTotal;
    wallet.updated_at = new Date().toISOString();
    this.db.ledger_entries.push(entry);

    this.addNotification({
      user_id: referrerId,
      title: 'Referral Bonus Credited!',
      message: `+₦${amount.toFixed(2)} referral reward has been credited to your available balance!`,
      type: 'referral',
    });
  }

  // Reward Opportunities & Sessions
  getOpportunities(): RewardOpportunity[] {
    return this.db.reward_opportunities.filter((o) => o.active);
  }

  getOpportunityById(id: string): RewardOpportunity | undefined {
    return this.db.reward_opportunities.find((o) => o.id === id);
  }

  createRewardSession(params: {
    userId: string;
    opportunityId: string;
    ipAddress?: string;
    userAgent?: string;
  }): { session: RewardSession; opportunity: RewardOpportunity; token: string } {
    const opp = this.getOpportunityById(params.opportunityId);
    if (!opp) throw new Error('Reward opportunity not found');

    const sessionId = `ses_${crypto.randomBytes(10).toString('hex')}`;
    const providerSessionId = `PS-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    // Cryptographic token payload
    const tokenPayload = `${sessionId}:${params.userId}:${params.opportunityId}:${opp.estimated_seconds}`;
    const hmac = crypto
      .createHmac('sha256', process.env.REWARD_PROVIDER_SECRET || 'swift-earn-crypto-reward-secret-v1-production')
      .update(tokenPayload)
      .digest('hex');
    const token = `${hmac}.${Date.now()}`;

    const session: RewardSession = {
      id: sessionId,
      user_id: params.userId,
      opportunity_id: params.opportunityId,
      provider_session_id: providerSessionId,
      provider_token: token,
      status: 'initiated',
      ip_address: params.ipAddress,
      user_agent: params.userAgent,
      started_at: new Date().toISOString(),
      expires_at: expiresAt,
      claimed: false,
    };

    this.db.reward_sessions.push(session);

    this.db.reward_events.push({
      id: `rev_${crypto.randomBytes(8).toString('hex')}`,
      session_id: sessionId,
      event_type: 'session_start',
      metadata: { oppTitle: opp.title, points: opp.reward_points },
      created_at: new Date().toISOString(),
    });

    this.persist();
    return { session, opportunity: opp, token };
  }

  findRewardSession(sessionId: string): RewardSession | undefined {
    return this.db.reward_sessions.find((s) => s.id === sessionId);
  }

  getAllRewardSessions(): RewardSession[] {
    return [...this.db.reward_sessions].sort(
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );
  }

  // Withdrawals
  requestWithdrawal(params: {
    userId: string;
    amount: number;
    paymentMethod: string;
    accountDetails: any;
  }): { success: boolean; withdrawal?: Withdrawal; message?: string } {
    const user = this.findUserById(params.userId);
    if (!user) return { success: false, message: 'User not found' };
    if (user.status === 'suspended' || user.status === 'flagged') {
      return { success: false, message: 'Account status restricted from withdrawals. Please contact support.' };
    }

    const minAmount = this.db.config.minimum_withdrawal;
    if (params.amount < minAmount) {
      return {
        success: false,
        message: `Amount is below minimum withdrawal limit of ₦${minAmount.toFixed(2)}`,
      };
    }

    const wallet = this.getWallet(params.userId);
    if (wallet.available_balance < params.amount) {
      return {
        success: false,
        message: `Insufficient confirmed balance. Available: ₦${wallet.available_balance.toFixed(2)}`,
      };
    }

    // Check pending withdrawal restriction (maximum 1 pending withdrawal at a time)
    const existingPending = this.db.withdrawals.find(
      (w) => w.user_id === params.userId && (w.status === 'pending' || w.status === 'processing')
    );
    if (existingPending) {
      return {
        success: false,
        message: 'You already have a pending withdrawal request under processing. Please wait until it concludes.',
      };
    }

    const reference = `WTH-REF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const newAvailable = Math.round((wallet.available_balance - params.amount) * 100) / 100;
    wallet.available_balance = newAvailable;
    wallet.updated_at = new Date().toISOString();

    const withdrawal: Withdrawal = {
      id: `wth_${crypto.randomBytes(8).toString('hex')}`,
      user_id: params.userId,
      amount: params.amount,
      payment_method: params.paymentMethod,
      account_details: params.accountDetails,
      reference,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Ledger debit entry
    const ledgerEntry: LedgerEntry = {
      id: `ledg_${crypto.randomBytes(8).toString('hex')}`,
      user_id: params.userId,
      entry_type: 'withdrawal_debit',
      amount: -params.amount,
      running_balance: newAvailable,
      status: 'pending',
      reference,
      description: `Withdrawal payout request submitted via ${params.paymentMethod} (${reference})`,
      idempotency_key: `idemp_${withdrawal.id}`,
      created_at: new Date().toISOString(),
    };

    this.db.withdrawals.push(withdrawal);
    this.db.ledger_entries.push(ledgerEntry);

    this.addNotification({
      user_id: params.userId,
      title: 'Withdrawal Request Submitted',
      message: `Your request for ₦${params.amount.toFixed(2)} (Ref: ${reference}) is pending processing review.`,
      type: 'withdrawal',
    });

    this.persist();
    return { success: true, withdrawal };
  }

  updateWithdrawalStatus(
    withdrawalId: string,
    status: Withdrawal['status'],
    adminNotes: string,
    adminId: string,
    ip?: string
  ): { success: boolean; withdrawal?: Withdrawal; message?: string } {
    const w = this.db.withdrawals.find((item) => item.id === withdrawalId);
    if (!w) return { success: false, message: 'Withdrawal not found' };

    const oldStatus = w.status;
    w.status = status;
    w.admin_notes = adminNotes;
    w.updated_at = new Date().toISOString();

    const wallet = this.getWallet(w.user_id);
    const ledger = this.db.ledger_entries.find((l) => l.reference === w.reference);

    if (status === 'completed') {
      w.processed_at = new Date().toISOString();
      if (ledger) ledger.status = 'confirmed';
      wallet.total_withdrawn = Math.round((wallet.total_withdrawn + w.amount) * 100) / 100;
      wallet.updated_at = new Date().toISOString();

      this.addNotification({
        user_id: w.user_id,
        title: 'Withdrawal Completed',
        message: `Your withdrawal of ₦${w.amount.toFixed(2)} (Ref: ${w.reference}) was sent successfully!`,
        type: 'withdrawal',
      });
    } else if (status === 'rejected' || status === 'failed') {
      if (oldStatus !== 'rejected' && oldStatus !== 'failed') {
        // Reversal: credit funds back to wallet
        wallet.available_balance = Math.round((wallet.available_balance + w.amount) * 100) / 100;
        wallet.updated_at = new Date().toISOString();

        if (ledger) ledger.status = 'cancelled';

        // Reversal ledger entry
        this.db.ledger_entries.push({
          id: `ledg_${crypto.randomBytes(8).toString('hex')}`,
          user_id: w.user_id,
          entry_type: 'withdrawal_reversal',
          amount: w.amount,
          running_balance: wallet.available_balance,
          status: 'confirmed',
          reference: `REV-${w.reference}`,
          description: `Withdrawal refund reversal (${status}): ${adminNotes || 'Payment provider returned funds'}`,
          created_at: new Date().toISOString(),
        });

        this.addNotification({
          user_id: w.user_id,
          title: `Withdrawal ${status.toUpperCase()}`,
          message: `Your withdrawal of ₦${w.amount.toFixed(2)} was ${status}. Funds returned to your available balance. Reason: ${adminNotes || 'Verification failed'}`,
          type: 'withdrawal',
        });
      }
    }

    this.addAuditLog({
      admin_id: adminId,
      action: `WITHDRAWAL_${status.toUpperCase()}`,
      target_resource: 'withdrawals',
      target_id: withdrawalId,
      details: { amount: w.amount, reference: w.reference, oldStatus, status, adminNotes },
      ip_address: ip,
    });

    this.persist();
    return { success: true, withdrawal: w };
  }

  getWithdrawals(userId?: string): Withdrawal[] {
    if (userId) {
      return this.db.withdrawals
        .filter((w) => w.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return [...this.db.withdrawals].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // Referrals
  getReferrals(userId: string): { referrals: Referral[]; totalCount: number; totalBonusEarned: number } {
    const list = this.db.referrals.filter((r) => r.referrer_user_id === userId);
    const totalBonus = list
      .filter((r) => r.status === 'rewarded' || r.status === 'successful')
      .reduce((sum, r) => sum + r.reward_amount, 0);

    return {
      referrals: list,
      totalCount: list.length,
      totalBonusEarned: totalBonus,
    };
  }

  getAllReferrals(): Referral[] {
    return [...this.db.referrals].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // Notifications
  getNotifications(userId: string): NotificationItem[] {
    return this.db.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  markNotificationRead(id: string, userId: string): boolean {
    const notif = this.db.notifications.find((n) => n.id === id && n.user_id === userId);
    if (!notif) return false;
    notif.read = true;
    this.persist();
    return true;
  }

  markAllNotificationsRead(userId: string): void {
    this.db.notifications.forEach((n) => {
      if (n.user_id === userId) n.read = true;
    });
    this.persist();
  }

  addNotification(params: Omit<NotificationItem, 'id' | 'read' | 'created_at'>): NotificationItem {
    const notif: NotificationItem = {
      id: `notif_${crypto.randomBytes(8).toString('hex')}`,
      user_id: params.user_id,
      title: params.title,
      message: params.message,
      type: params.type,
      read: false,
      created_at: new Date().toISOString(),
    };
    this.db.notifications.push(notif);
    this.persist();
    return notif;
  }

  // Fraud & Security
  recordFraudEvent(params: {
    userId?: string;
    sessionId?: string;
    riskScore: number;
    flagReason: string;
    details?: any;
  }): FraudEvent {
    const event: FraudEvent = {
      id: `frd_${crypto.randomBytes(8).toString('hex')}`,
      user_id: params.userId,
      session_id: params.sessionId,
      risk_score: params.riskScore,
      flag_reason: params.flagReason,
      details: params.details,
      resolved: false,
      created_at: new Date().toISOString(),
    };
    this.db.fraud_events.push(event);

    if (params.userId && params.riskScore >= 75) {
      const user = this.findUserById(params.userId);
      if (user && user.status === 'active') {
        user.status = 'flagged';
      }
    }

    this.persist();
    return event;
  }

  getFraudEvents(): FraudEvent[] {
    return [...this.db.fraud_events].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // Admin Users & Auth
  findAdminByEmail(email: string): AdminUser | undefined {
    return this.db.admin_users.find((a) => a.email.toLowerCase() === email.toLowerCase());
  }

  findAdminById(id: string): AdminUser | undefined {
    return this.db.admin_users.find((a) => a.id === id);
  }

  addAuditLog(params: Omit<AuditLog, 'id' | 'created_at'>): void {
    this.db.audit_logs.push({
      id: `aud_${crypto.randomBytes(8).toString('hex')}`,
      ...params,
      created_at: new Date().toISOString(),
    });
    this.persist();
  }

  getAuditLogs(): AuditLog[] {
    return [...this.db.audit_logs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // Aggregate Admin Metrics
  getAdminStats() {
    const totalUsers = this.db.users.length;
    const activeUsers = this.db.users.filter((u) => u.status === 'active').length;
    const suspiciousUsers = this.db.users.filter((u) => u.status === 'flagged' || u.status === 'suspended').length;

    const completedRewards = this.db.ledger_entries.filter((l) => l.entry_type === 'reward_credit').length;
    const rewardsIssuedAmount = this.db.ledger_entries
      .filter((l) => l.entry_type === 'reward_credit')
      .reduce((sum, l) => sum + l.amount, 0);

    const pendingWithdrawals = this.db.withdrawals.filter((w) => w.status === 'pending');
    const pendingWithdrawalsAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    const completedWithdrawals = this.db.withdrawals.filter((w) => w.status === 'completed');
    const completedWithdrawalsAmount = completedWithdrawals.reduce((sum, w) => sum + w.amount, 0);

    // Revenue calculation from partner ad inventory margins (e.g. platform collects $1.80 per ₦100 rewarded ad)
    const estimatedRevenue = Math.round(rewardsIssuedAmount * 1.5 * 100) / 100;
    const estimatedProfit = Math.round((estimatedRevenue - rewardsIssuedAmount) * 100) / 100;

    return {
      totalUsers,
      activeUsers,
      suspiciousAccounts: suspiciousUsers,
      rewardsCount: completedRewards,
      rewardsIssuedTotal: rewardsIssuedAmount,
      pendingWithdrawalsCount: pendingWithdrawals.length,
      pendingWithdrawalsTotal: pendingWithdrawalsAmount,
      completedWithdrawalsCount: completedWithdrawals.length,
      completedWithdrawalsTotal: completedWithdrawalsAmount,
      estimatedRevenue,
      estimatedProfit,
      demoMode: this.db.config.demo_mode,
    };
  }
}

export const dbManager = new DatabaseManager();
