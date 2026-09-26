import React, { useState } from 'react';
import { RefreshCw, Sparkles, ShieldCheck, CheckCircle2, Layers, Check, Info, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AdsterraBanner } from '../components/common/AdsterraBanner';
import { AdsterraBanner160x300 } from '../components/common/AdsterraBanner160x300';
import { AdsterraNativeBanner } from '../components/common/AdsterraNativeBanner';
import { AdsterraSocialBar } from '../components/common/AdsterraSocialBar';
import { AdsterraPopunder } from '../components/common/AdsterraPopunder';
import { AdsterraSmartlink } from '../components/common/AdsterraSmartlink';

interface EarnPageProps {
  onRefreshWallet?: () => void;
  onNavigate?: (tab: string) => void;
}

export const EarnPage: React.FC<EarnPageProps> = ({ onRefreshWallet, onNavigate }) => {
  const { wallet, refreshUserData } = useAuth();
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUserData();
    if (onRefreshWallet) onRefreshWallet();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Structured upcoming Adsterra format placements (prepared for step-by-step rollout)
  const upcomingAdsterraFormats: Array<{
    id: string;
    name: string;
    type: string;
    description: string;
    status: string;
    provider: string;
  }> = [];

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24 md:pb-12 pt-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Hero Header */}
        <div className="bg-gradient-to-br from-[#0F172A] via-zinc-900 to-[#0F172A] rounded-3xl p-6 sm:p-8 border border-zinc-800 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-[#6C2BD9]/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-[#B8F500]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#B8F500] text-[#0F172A] text-[10px] sm:text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Swift Earn Monetization
                </span>
                <span className="bg-[#6C2BD9]/40 text-[#B8F500] text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full border border-[#6C2BD9]">
                  Adsterra Approved Partner
                </span>
              </div>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Wallet</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Partner <span className="text-[#B8F500]">Advertising</span> & Monetization
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Swift Earn is powered by verified digital advertising. Partner monetization sustains the platform&apos;s infrastructure, double-entry ledger, and verified bank payouts. Advertisements do not automatically credit user balances—all wallet rewards are governed by authoritative server-side transactions.
            </p>

            {/* Quick Wallet Bar (Authoritative Data Only) */}
            {wallet && (
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
                <div className="bg-zinc-800/80 px-3.5 py-1.5 rounded-xl border border-zinc-700/60 flex items-center gap-2">
                  <span className="text-zinc-400">Available Balance:</span>
                  <span className="font-extrabold text-[#B8F500] text-sm">
                    ₦{wallet.available_balance.toFixed(2)}
                  </span>
                </div>
                <div className="bg-zinc-800/80 px-3.5 py-1.5 rounded-xl border border-zinc-700/60 flex items-center gap-2">
                  <span className="text-zinc-400">Total Earned:</span>
                  <span className="font-extrabold text-white text-sm">
                    ₦{wallet.total_earned.toFixed(2)}
                  </span>
                </div>
                {wallet.total_withdrawn > 0 && (
                  <div className="bg-zinc-800/80 px-3.5 py-1.5 rounded-xl border border-zinc-700/60 flex items-center gap-2">
                    <span className="text-zinc-400">Total Withdrawn:</span>
                    <span className="font-extrabold text-white text-sm">
                      ₦{wallet.total_withdrawn.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Section 1: Active Monetization Placement */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-zinc-200 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h2 className="text-base sm:text-lg font-extrabold text-zinc-900">
                  Active Display Monetization
                </h2>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Live Adsterra display, native, overlay &amp; partner offer units running on Swift Earn (300 × 250, 160 × 300, Native, Social Bar, Popunder &amp; Smartlink)
              </p>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              Provider: Adsterra
            </span>
          </div>

          {/* Active Ad Placements: 300x250 Medium Rectangle and 160x300 Skyscraper */}
          {/* Stacks vertically on mobile/small screens; displays side-by-side on md+ screens */}
          <div className="w-full flex flex-col md:flex-row items-center md:items-start justify-center gap-0 md:gap-6 my-2">
            <div className="w-full md:w-auto flex justify-center">
              <AdsterraBanner />
            </div>
            <div className="w-full md:w-auto flex justify-center">
              <AdsterraBanner160x300 />
            </div>
          </div>

          {/* Active Ad Placement: Responsive Native Banner in its own clean responsive row below them */}
          <div className="w-full flex justify-center">
            <AdsterraNativeBanner />
          </div>

          {/* Active Ad Placement: Social Bar (Interactive Overlay & Rich Media) */}
          <div className="w-full flex justify-center">
            <AdsterraSocialBar />
          </div>

          {/* Active Ad Placement: Popunder (On-Click / User-Initiated Event Format) */}
          <div className="w-full flex justify-center">
            <AdsterraPopunder />
          </div>

          {/* Active Ad Placement: Smartlink / Direct Link (Sponsored Partner Offer CTA) */}
          <div className="w-full flex justify-center">
            <AdsterraSmartlink />
          </div>
        </div>

        {/* Section 2: Prepared Additional Adsterra Formats (Structured for Future Rollout) */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-zinc-200 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#6C2BD9]" />
                <h2 className="text-base sm:text-lg font-extrabold text-zinc-900">
                  Monetization Pipeline & Future Formats
                </h2>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Scheduled Adsterra ad formats prepared for sequential activation
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#6C2BD9] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
              One-by-One Rollout Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingAdsterraFormats.length > 0 ? (
              upcomingAdsterraFormats.map((slot) => (
                <div
                  key={slot.id}
                  className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                        {slot.type}
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        {slot.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-zinc-900">{slot.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                      {slot.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Network: {slot.provider}</span>
                    <span className="font-mono text-zinc-500">Stage: In Pipeline</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="sm:col-span-2 lg:col-span-3 bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">All Approved Formats Activated</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      All 5 core Adsterra formats (300×250, 160×300, Native Banner, Social Bar, Popunder &amp; Smartlink) are deployed in active testing.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full whitespace-nowrap">
                  Pipeline Active
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Platform Security, Anti-Fraud & Reward Integrity Notice */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6C2BD9] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-zinc-900">Authoritative Wallet & Financial Integrity Guarantee</p>
              <p className="text-zinc-500 text-[11px] mt-0.5">
                Swift Earn maintains strict separation between advertising displays and user ledger entries. No balances are fabricated or generated from ad impressions or clicks.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full text-[10px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Real-Money Testing Mode
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
