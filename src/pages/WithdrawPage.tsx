import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { WithdrawalRequest } from '../types';
import { api } from '../api';

interface WithdrawPageProps {
  onNavigate: (tab: string) => void;
}

export const WithdrawPage: React.FC<WithdrawPageProps> = ({ onNavigate }) => {
  const { user, wallet, profile, refreshUserData } = useAuth();
  const [amount, setAmount] = useState<string>('500');
  const [payoutMethod, setPayoutMethod] = useState<'bank_transfer' | 'fintech_wallet'>('bank_transfer');

  // Bank fields
  const [bankName, setBankName] = useState<string>('Access Bank');
  const [bankAccountNumber, setBankAccountNumber] = useState<string>('');
  const [bankAccountName, setBankAccountName] = useState<string>(profile?.full_name || '');

  // Fintech fields
  const [walletProvider, setWalletProvider] = useState<string>('Opay');
  const [walletAccountId, setWalletAccountId] = useState<string>('');
  const [walletAccountName, setWalletAccountName] = useState<string>(profile?.full_name || '');

  const [minWithdrawal, setMinWithdrawal] = useState<number>(500);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [successData, setSuccessData] = useState<any>(null);

  useEffect(() => {
    const fetchWithdrawalData = async () => {
      try {
        const statsRes = await api.getPublicStats();
        setMinWithdrawal(statsRes.minimumWithdrawal || 500);

        if (user) {
          const withRes = await api.getWithdrawals();
          setPendingWithdrawals(withRes.withdrawals || []);
        } else {
          setPendingWithdrawals([]);
        }
      } catch (err: any) {
        if (!err?.message?.includes('Authentication')) {
          console.warn('Notice: Could not load withdrawal data:', err?.message || err);
        }
      }
    };
    fetchWithdrawalData();
  }, [user]);

  if (!user) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen pb-24 md:pb-12 pt-12">
        <div className="max-w-md mx-auto px-4 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-[#6C2BD9] flex items-center justify-center mx-auto shadow-xs">
            <ArrowUpRight className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Withdraw Rewards</h2>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              Log in to request withdrawals directly to your Nigerian bank account or verified Fintech wallet (Opay, PalmPay, Moniepoint, Kuda).
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <button
              id="withdraw-guest-login-btn"
              onClick={() => onNavigate('login')}
              className="px-5 py-2.5 rounded-xl bg-[#6C2BD9] hover:bg-[#5821B0] text-white font-bold text-sm shadow-xs transition-colors"
            >
              Sign In
            </button>
            <button
              id="withdraw-guest-signup-btn"
              onClick={() => onNavigate('signup')}
              className="px-5 py-2.5 rounded-xl bg-[#B8F500] hover:bg-[#A3DC00] text-[#0F172A] font-extrabold text-sm shadow-xs transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleMaxAmount = () => {
    if (wallet) {
      setAmount(Math.floor(wallet.available_balance).toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessData(null);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please specify a valid withdrawal amount.');
      return;
    }

    if (numericAmount < minWithdrawal) {
      setError(`Minimum withdrawal is ₦${minWithdrawal.toFixed(2)}.`);
      return;
    }

    if (!wallet || wallet.available_balance < numericAmount) {
      setError('Insufficient available balance for this withdrawal.');
      return;
    }

    const hasActivePending = pendingWithdrawals.some(
      (w) => w.status === 'pending' || w.status === 'processing'
    );
    if (hasActivePending) {
      setError('You already have a pending withdrawal request in queue. Please wait until it finishes processing.');
      return;
    }

    // Validate method fields
    let accountDetails: Record<string, string> = {};
    if (payoutMethod === 'bank_transfer') {
      if (!bankName.trim() || !bankAccountNumber.trim() || !bankAccountName.trim()) {
        setError('Please complete all bank transfer details.');
        return;
      }
      if (bankAccountNumber.trim().length < 10) {
        setError('Bank account number must be at least 10 digits.');
        return;
      }
      accountDetails = {
        bankName,
        accountNumber: bankAccountNumber.trim(),
        accountName: bankAccountName.trim(),
      };
    } else {
      if (!walletProvider.trim() || !walletAccountId.trim() || !walletAccountName.trim()) {
        setError('Please complete all fintech wallet details.');
        return;
      }
      accountDetails = {
        walletProvider,
        walletAccountId: walletAccountId.trim(),
        accountName: walletAccountName.trim(),
      };
    }

    try {
      setLoading(true);
      const res = await api.requestWithdrawal({
        amount: numericAmount,
        paymentMethod: payoutMethod,
        accountDetails,
      });

      if (res.withdrawal) {
        setSuccessData(res.withdrawal);
        await refreshUserData();
        const updatedList = await api.getWithdrawals();
        setPendingWithdrawals(updatedList.withdrawals || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit withdrawal request.');
    } finally {
      setLoading(false);
    }
  };

  const nigerianBanks = [
    'Access Bank',
    'Zenith Bank',
    'Guaranty Trust Bank (GTBank)',
    'First Bank of Nigeria',
    'United Bank for Africa (UBA)',
    'Fidelity Bank',
    'Stanbic IBTC Bank',
    'Kuda Bank',
    'Sterling Bank',
    'Wema Bank',
  ];

  const fintechProviders = [
    'Opay',
    'Palmpay',
    'Kuda Microfinance Bank',
    'Moniepoint Microfinance Bank',
    'Chipper Cash',
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24 md:pb-12 pt-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-wallet"
            onClick={() => onNavigate('wallet')}
            className="p-2 rounded-xl bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#6C2BD9]">
              Settlement Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              Withdraw Rewards
            </h1>
          </div>
        </div>

        {/* Available Balance Reminder Card */}
        <div className="bg-[#6C2BD9] text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold text-purple-200 tracking-wider">
              Available Balance
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white mt-1">
              ₦{wallet?.available_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-purple-200 mt-0.5">
              Minimum withdrawal threshold: <strong className="text-[#B8F500]">₦{minWithdrawal.toFixed(2)}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 bg-purple-900/50 border border-purple-400/30 px-3.5 py-2 rounded-2xl text-xs font-semibold text-purple-100">
            <ShieldCheck className="w-4 h-4 text-[#B8F500]" />
            <span>Encrypted Provider Payouts</span>
          </div>
        </div>

        {/* Success Confirmation Card */}
        {successData && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-md space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#B8F500] text-[#0F172A] flex items-center justify-center font-bold">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-zinc-900">
                  Withdrawal Request Submitted
                </h3>
                <p className="text-xs text-zinc-500">
                  Your payout has entered the security queue and will be processed automatically.
                </p>
              </div>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-200">
                <span className="text-zinc-500">Reference Number</span>
                <span className="font-mono font-bold text-zinc-900">{successData.reference}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-200">
                <span className="text-zinc-500">Amount</span>
                <span className="font-bold text-[#6C2BD9] text-sm">₦{successData.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-200">
                <span className="text-zinc-500">Payout Channel</span>
                <span className="font-medium text-zinc-800 capitalize">
                  {(successData.payment_method || (successData as any).payout_method || 'bank_transfer').replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-500">Current Status</span>
                <span className="bg-[#B8F500] text-[#0F172A] font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">
                  {successData.status}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSuccessData(null)}
                className="flex-1 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs transition-colors"
              >
                Submit Another Request
              </button>
              <button
                onClick={() => onNavigate('wallet')}
                className="flex-1 py-3 rounded-xl bg-[#6C2BD9] hover:bg-[#5821B0] text-white font-bold text-xs transition-colors"
              >
                Go to Wallet
              </button>
            </div>
          </div>
        )}

        {/* Withdrawal Form */}
        {!successData && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs">
            {error && (
              <div className="mb-6 bg-purple-50 border border-purple-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-zinc-900">
                <AlertCircle className="w-4 h-4 text-[#6C2BD9] shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Withdrawal Amount (₦)
                  </label>
                  <button
                    type="button"
                    onClick={handleMaxAmount}
                    className="text-xs font-bold text-[#6C2BD9] hover:underline"
                  >
                    Withdraw Max
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-zinc-400 text-lg">
                    ₦
                  </span>
                  <input
                    id="input-withdraw-amount"
                    type="number"
                    min={minWithdrawal}
                    step="10"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-zinc-300 focus:outline-hidden focus:border-[#6C2BD9] focus:ring-2 focus:ring-[#6C2BD9]/20 text-lg font-bold"
                  />
                </div>
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  Minimum withdrawal threshold is ₦{minWithdrawal.toFixed(2)}. No hidden processing fees.
                </span>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">
                  Select Payout Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    id="method-bank-transfer"
                    onClick={() => setPayoutMethod('bank_transfer')}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      payoutMethod === 'bank_transfer'
                        ? 'border-[#6C2BD9] bg-purple-50/50 shadow-xs'
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#6C2BD9] text-[#B8F500] flex items-center justify-center font-bold shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900">Direct Bank Transfer</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">All commercial Nigerian banks</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    id="method-fintech-wallet"
                    onClick={() => setPayoutMethod('fintech_wallet')}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      payoutMethod === 'fintech_wallet'
                        ? 'border-[#6C2BD9] bg-purple-50/50 shadow-xs'
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 text-[#B8F500] flex items-center justify-center font-bold shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900">Fintech Wallet</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">Opay, Palmpay, Moniepoint, Kuda</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Dynamic Account Details: Bank Transfer */}
              {payoutMethod === 'bank_transfer' ? (
                <div className="space-y-4 pt-2 border-t border-zinc-100">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Bank Name
                    </label>
                    <select
                      id="select-bank-name"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:border-[#6C2BD9] text-sm font-medium"
                    >
                      {nigerianBanks.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Account Number (10 Digits)
                    </label>
                    <input
                      id="input-bank-account-number"
                      type="text"
                      maxLength={10}
                      required
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="0123456789"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:border-[#6C2BD9] text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Account Name
                    </label>
                    <input
                      id="input-bank-account-name"
                      type="text"
                      required
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value)}
                      placeholder="Account holder full name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:border-[#6C2BD9] text-sm"
                    />
                  </div>
                </div>
              ) : (
                /* Dynamic Account Details: Fintech Wallet */
                <div className="space-y-4 pt-2 border-t border-zinc-100">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Fintech Provider
                    </label>
                    <select
                      id="select-fintech-provider"
                      value={walletProvider}
                      onChange={(e) => setWalletProvider(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:border-[#6C2BD9] text-sm font-medium"
                    >
                      {fintechProviders.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Registered Phone Number / Account ID
                    </label>
                    <input
                      id="input-fintech-account-id"
                      type="text"
                      required
                      value={walletAccountId}
                      onChange={(e) => setWalletAccountId(e.target.value)}
                      placeholder="e.g. 08012345678"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:border-[#6C2BD9] text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Account Name
                    </label>
                    <input
                      id="input-fintech-account-name"
                      type="text"
                      required
                      value={walletAccountName}
                      onChange={(e) => setWalletAccountName(e.target.value)}
                      placeholder="Full name registered on wallet"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:border-[#6C2BD9] text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  id="btn-submit-withdrawal"
                  type="submit"
                  disabled={loading || (wallet && wallet.available_balance < minWithdrawal)}
                  className="w-full py-4 rounded-xl bg-[#6C2BD9] hover:bg-[#5821B0] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Verifying and submitting...</span>
                  ) : (
                    <>
                      <span>Request Withdrawal</span>
                      <ArrowUpRight className="w-4 h-4 text-[#B8F500]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Withdrawal Statuses & Queue Explained */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-zinc-900 font-extrabold text-sm">
            <Info className="w-4 h-4 text-[#6C2BD9]" />
            <span>How Swift Earn Processes Payouts</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200">
              <span className="font-extrabold text-purple-700 uppercase block mb-1">1. Pending</span>
              <p className="text-zinc-500 leading-relaxed">Request logged in ledger; awaiting provider batch dispatch.</p>
            </div>
            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200">
              <span className="font-extrabold text-blue-700 uppercase block mb-1">2. Processing</span>
              <p className="text-zinc-500 leading-relaxed">Banking gateway received request and is verifying account validity.</p>
            </div>
            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200">
              <span className="font-extrabold text-[#0F172A] uppercase block mb-1">3. Completed</span>
              <p className="text-zinc-500 leading-relaxed">Funds successfully credited to your bank account or fintech wallet.</p>
            </div>
            <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200">
              <span className="font-extrabold text-red-600 uppercase block mb-1">4. Rejected / Failed</span>
              <p className="text-zinc-500 leading-relaxed">Invalid account details or anti-fraud trigger. Funds refunded to wallet.</p>
            </div>
          </div>
        </div>

        {/* User's Withdrawal History */}
        {pendingWithdrawals.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-zinc-900">Your Recent Withdrawal Requests</h3>
            <div className="divide-y divide-zinc-100">
              {pendingWithdrawals.map((w) => (
                <div key={w.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-bold text-zinc-900">
                      ₦{w.amount.toFixed(2)} via {(w.payment_method || (w as any).payout_method || 'bank_transfer').replace('_', ' ')}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                      {w.reference} • {new Date(w.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    className={`font-extrabold px-2.5 py-1 rounded text-[10px] uppercase tracking-wider ${
                      w.status === 'completed'
                        ? 'bg-[#B8F500] text-[#0F172A]'
                        : w.status === 'pending'
                        ? 'bg-purple-100 text-[#6C2BD9]'
                        : w.status === 'processing'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {w.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
