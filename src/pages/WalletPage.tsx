import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  ArrowUpRight,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { LedgerEntry } from '../types';
import { api } from '../api';

interface WalletPageProps {
  onNavigate: (tab: string) => void;
}

export const WalletPage: React.FC<WalletPageProps> = ({ onNavigate }) => {
  const { user, wallet, refreshUserData } = useAuth();
  const [transactions, setTransactions] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) {
        setTransactions([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        await refreshUserData();
        const res = await api.getTransactions();
        setTransactions(res.transactions || []);
      } catch (err: any) {
        if (!err?.message?.includes('Authentication')) {
          console.warn('Notice: Could not load transactions:', err?.message || err);
        }
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [user]);

  const handleCopyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  if (!user) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen pb-24 md:pb-12 pt-12">
        <div className="max-w-md mx-auto px-4 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-[#6C2BD9] flex items-center justify-center mx-auto shadow-xs">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Your Confirmed Wallet</h2>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              Log in or create a free account to track your verified reward points and request withdrawals.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <button
              id="wallet-guest-login-btn"
              onClick={() => onNavigate('login')}
              className="px-5 py-2.5 rounded-xl bg-[#6C2BD9] hover:bg-[#5821B0] text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
            >
              Log In
            </button>
            <button
              id="wallet-guest-signup-btn"
              onClick={() => onNavigate('signup')}
              className="px-5 py-2.5 rounded-xl bg-[#B8F500] hover:bg-[#A3DC00] text-[#0F172A] font-extrabold text-sm shadow-xs transition-colors cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === 'all') return true;
    if (filterType === 'rewards') return tx.entry_type === 'reward_credit';
    if (filterType === 'withdrawals') return tx.entry_type === 'withdrawal_debit';
    if (filterType === 'referrals') return tx.entry_type === 'referral_bonus';
    return true;
  });

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24 md:pb-12 pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            My Wallet
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Manage your balance, request withdrawals, and track your transactions.
          </p>
        </div>

        {/* Withdrawal Request Card */}
        <div
          id="wallet-large-balance-card"
          className="bg-[#6C2BD9] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
                Available Balance
              </span>
              <div className="text-4xl sm:text-5xl font-black tracking-tight text-white mt-1">
                ₦{wallet?.available_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </div>
              <p className="text-xs text-purple-200 mt-1">
                Ready for instant withdrawal request
              </p>
            </div>

            <button
              id="btn-wallet-balance-withdraw"
              onClick={() => onNavigate('withdraw')}
              className="px-8 py-3.5 rounded-2xl bg-[#B8F500] hover:bg-[#A3DC00] text-[#0F172A] font-black text-sm transition-all shadow-md self-start sm:self-auto flex items-center gap-2 cursor-pointer"
            >
              <span>Request Withdrawal</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-6 border-t border-purple-500/40 mt-6 grid grid-cols-3 gap-2 text-left">
            <div>
              <span className="text-[11px] font-semibold text-purple-200 block uppercase">
                Pending Balance
              </span>
              <span className="text-sm sm:text-base font-extrabold text-white mt-0.5 block">
                ₦{(wallet?.pending_balance ?? wallet?.pending_rewards ?? 0).toFixed(2)}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-purple-200 block uppercase">
                Total Earned
              </span>
              <span className="text-sm sm:text-base font-extrabold text-[#B8F500] mt-0.5 block">
                ₦{(wallet?.total_earned ?? 0).toFixed(2)}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-purple-200 block uppercase">
                Total Withdrawn
              </span>
              <span className="text-sm sm:text-base font-extrabold text-white mt-0.5 block">
                ₦{(wallet?.total_withdrawn ?? 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Transaction History Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-zinc-900">Transaction History</h2>
              <p className="text-xs text-zinc-500">Every reward and withdrawal logged with reference code</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {['all', 'rewards', 'withdrawals', 'referrals'].map((ft) => (
                <button
                  key={ft}
                  onClick={() => setFilterType(ft)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                    filterType === ft
                      ? 'bg-[#6C2BD9] text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {ft}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions List */}
          {loading ? (
            <div className="py-12 text-center text-zinc-400 text-sm">Loading ledger history...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 space-y-2">
              <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold">No transactions found.</p>
              <p className="text-xs text-zinc-400">Complete video ads to start building your ledger.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredTransactions.map((tx) => {
                const isPositive = tx.amount > 0;
                return (
                  <div
                    key={tx.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/50 rounded-xl px-2 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isPositive
                            ? 'bg-[#B8F500]/30 text-[#0F172A]'
                            : 'bg-zinc-800 text-white'
                        }`}
                      >
                        {isPositive ? (
                          <Sparkles className="w-5 h-5 text-[#6C2BD9]" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-zinc-900">{tx.description}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <button
                            onClick={() => handleCopyRef(tx.reference)}
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500 bg-zinc-100 hover:bg-zinc-200 px-2 py-0.5 rounded transition-colors cursor-pointer"
                            title="Copy reference code"
                          >
                            <span>{tx.reference}</span>
                            {copiedRef === tx.reference ? (
                              <Check className="w-3 h-3 text-[#6C2BD9]" />
                            ) : (
                              <Copy className="w-3 h-3 text-zinc-400" />
                            )}
                          </button>
                          <span className="text-[11px] text-zinc-400">
                            {new Date(tx.created_at).toLocaleDateString()} at{' '}
                            {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center pl-13 sm:pl-0">
                      <span
                        className={`text-sm sm:text-base font-black ${
                          isPositive ? 'text-[#6C2BD9]' : 'text-zinc-900'
                        }`}
                      >
                        {isPositive ? '+' : ''}₦{Math.abs(tx.amount).toFixed(2)}
                      </span>

                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wide mt-0.5 ${
                          tx.status === 'confirmed'
                            ? 'bg-[#B8F500] text-[#0F172A]'
                            : tx.status === 'pending'
                            ? 'bg-purple-100 text-[#6C2BD9]'
                            : 'bg-zinc-200 text-zinc-700'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
