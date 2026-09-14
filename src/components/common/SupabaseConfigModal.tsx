import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Database, CheckCircle2, AlertCircle, Copy, Check, X, ExternalLink } from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { isSupabase, supabaseConfig, updateSupabaseConfig } = useAuth();
  const [url, setUrl] = useState(supabaseConfig.url || '');
  const [anonKey, setAnonKey] = useState(supabaseConfig.anonKey || '');
  const [savedMessage, setSavedMessage] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseConfig(url.trim(), anonKey.trim());
    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setUrl('');
    setAnonKey('');
    updateSupabaseConfig('', '');
  };

  const handleCopySql = () => {
    const sql = `-- SWIFT EARN - SUPABASE DATABASE SCHEMA
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
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entry_type TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  running_balance NUMERIC(12, 2) NOT NULL,
  status TEXT DEFAULT 'confirmed' NOT NULL,
  reference TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet" ON public.wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallet" ON public.wallets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ref_code TEXT;
  initials TEXT;
  raw_name TEXT;
  ref_by TEXT;
BEGIN
  raw_name := COALESCE(new.raw_user_meta_data->>'full_name', 'Swift Earner');
  ref_by := new.raw_user_meta_data->>'referred_by';
  initials := UPPER(SUBSTRING(raw_name FROM 1 FOR 2));
  IF LENGTH(initials) = 0 THEN initials := 'SE'; END IF;
  ref_code := UPPER('SE' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));

  INSERT INTO public.profiles (id, user_id, full_name, avatar_initials, referral_code, referred_by)
  VALUES (new.id, new.id, raw_name, initials, ref_code, ref_by);

  INSERT INTO public.wallets (user_id, available_balance, pending_rewards, total_earned, total_withdrawn, currency)
  VALUES (new.id, 0.00, 0.00, 0.00, 0.00, 'NGN');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6C2BD9] flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-zinc-900">Supabase Connection</h3>
            <p className="text-xs text-zinc-500">Connect your Supabase project for real authentication</p>
          </div>
        </div>

        {/* Current status pill */}
        <div className="mb-5 p-3 rounded-xl border flex items-center justify-between text-xs">
          <span className="font-bold text-zinc-700">Auth Status:</span>
          {isSupabase ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connected to Supabase
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5" />
              Using Local Demo Auth
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
              Project URL
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzproject.supabase.co"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-mono focus:border-[#6C2BD9] focus:ring-2 focus:ring-[#6C2BD9]/20"
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              From your Supabase Dashboard: <strong>Project Settings → API → Project URL</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
              Anon / Public API Key
            </label>
            <input
              type="text"
              required
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs font-mono focus:border-[#6C2BD9] focus:ring-2 focus:ring-[#6C2BD9]/20"
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              From your Supabase Dashboard: <strong>Project Settings → API → anon public</strong>
            </p>
          </div>

          {savedMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Settings saved! Supabase connection updated.
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#6C2BD9] hover:bg-[#5821B0] text-white font-black text-xs shadow-md transition-all cursor-pointer"
            >
              Save & Connect
            </button>

            {isSupabase && (
              <button
                type="button"
                onClick={handleClear}
                className="py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Disconnect
              </button>
            )}
          </div>
        </form>

        {/* SQL Schema helper */}
        <div className="mt-6 pt-5 border-t border-zinc-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-zinc-900">Database Schema (SQL)</span>
            <button
              onClick={handleCopySql}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#6C2BD9] hover:underline cursor-pointer"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied SQL!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy SQL Script
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Run the SQL script in your Supabase <strong>SQL Editor</strong> to automatically create the profiles, wallets, and user triggers.
          </p>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-[#6C2BD9] font-medium"
          >
            <span>Open Supabase Dashboard</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
