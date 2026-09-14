-- ==============================================================================
-- SWIFT EARN - SUPABASE DATABASE SCHEMA & AUTH TRIGGER
-- Run this SQL in your Supabase project dashboard under SQL Editor -> "New Query"
-- ==============================================================================

-- 1. Create Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_initials TEXT DEFAULT 'SE',
  phone TEXT,
  country TEXT DEFAULT 'Nigeria',
  preferred_payment_method TEXT DEFAULT 'bank_transfer',
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  referral_code TEXT UNIQUE NOT NULL,
  referred_by TEXT,
  email_notifications BOOLEAN DEFAULT true,
  reward_alerts BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Wallets Table
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  available_balance NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  pending_rewards NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  total_earned NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  total_withdrawn NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  currency TEXT DEFAULT 'NGN' NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Ledger Entries Table
CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entry_type TEXT NOT NULL, -- 'reward_credit', 'withdrawal_debit', 'referral_bonus'
  amount NUMERIC(12, 2) NOT NULL,
  running_balance NUMERIC(12, 2) NOT NULL,
  status TEXT DEFAULT 'confirmed' NOT NULL,
  reference TEXT NOT NULL,
  description TEXT NOT NULL,
  idempotency_key TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Wallets: Users can view their own wallet
CREATE POLICY "Users can view own wallet" 
  ON public.wallets FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet" 
  ON public.wallets FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet" 
  ON public.wallets FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Ledger Entries: Users can view their own ledger transactions
CREATE POLICY "Users can view own ledger entries" 
  ON public.ledger_entries FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ledger entries" 
  ON public.ledger_entries FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 6. Trigger to automatically provision profile & wallet on new user sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ref_code TEXT;
  initials TEXT;
  raw_name TEXT;
  ref_by TEXT;
BEGIN
  -- Extract raw metadata from signup payload if present
  raw_name := COALESCE(new.raw_user_meta_data->>'full_name', 'Swift Earner');
  ref_by := new.raw_user_meta_data->>'referred_by';
  
  -- Calculate initials
  initials := UPPER(SUBSTRING(raw_name FROM 1 FOR 2));
  IF LENGTH(initials) = 0 THEN
    initials := 'SE';
  END IF;

  -- Generate unique referral code (e.g. SE + 6 random chars)
  ref_code := UPPER('SE' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));

  -- Insert profile
  INSERT INTO public.profiles (
    id,
    user_id,
    full_name,
    avatar_initials,
    referral_code,
    referred_by
  ) VALUES (
    new.id,
    new.id,
    raw_name,
    initials,
    ref_code,
    ref_by
  );

  -- Insert wallet with starting balance
  INSERT INTO public.wallets (
    user_id,
    available_balance,
    pending_rewards,
    total_earned,
    total_withdrawn,
    currency
  ) VALUES (
    new.id,
    0.00,
    0.00,
    0.00,
    0.00,
    'NGN'
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
