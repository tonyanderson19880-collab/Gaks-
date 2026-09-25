import React, { useState, useEffect } from 'react';
import { RefreshCw, Award, Sparkles, ShieldCheck, CheckCircle2, Clock, Play, ArrowRight, Layers3, Flame, Check } from 'lucide-react';
import { RewardOpportunity } from '../types';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

interface EarnPageProps {
  onRefreshWallet?: () => void;
  onStartRewardOpportunity?: (opportunity: RewardOpportunity) => void;
}

export const EarnPage: React.FC<EarnPageProps> = ({ onRefreshWallet, onStartRewardOpportunity }) => {
  const { wallet, refreshUserData } = useAuth();
  const [opportunities, setOpportunities] = useState<RewardOpportunity[]>([]);
  const [dailyCounts, setDailyCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const [oppsRes, countsRes] = await Promise.all([
        api.getOpportunities(),
        api.getDailyRewardCounts(),
      ]);
      setOpportunities(oppsRes.opportunities || []);
      setDailyCounts(countsRes.counts || {});
    } catch (err: any) {
      console.error('Failed to load reward opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchOpportunities(), refreshUserData()]);
    if (onRefreshWallet) onRefreshWallet();
    setTimeout(() => setRefreshing(false), 500);
  };

  const categories = [
    { id: 'all', label: 'All Tasks' },
    { id: 'sponsored_task', label: 'Tasks' },
    { id: 'survey', label: 'Surveys' },
    { id: 'app_trial', label: 'App Trials' },
    { id: 'video', label: 'Media' },
  ];

  const filteredOpportunities = opportunities.filter((opp) => {
    if (selectedCategory === 'all') return true;
    return (opp.category || 'sponsored_task').toLowerCase() === selectedCategory;
  });

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24 md:pb-12 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Hero Header */}
        <div className="bg-gradient-to-br from-[#0F172A] via-zinc-900 to-[#0F172A] rounded-3xl p-6 sm:p-8 border border-zinc-800 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-[#6C2BD9]/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-[#B8F500]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#B8F500] text-[#0F172A] text-[10px] sm:text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Swift Earn Tasks
                </span>
                <span className="bg-[#6C2BD9]/40 text-[#B8F500] text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full border border-[#6C2BD9]">
                  Verified Reward Engine
                </span>
              </div>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Tasks</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Earn <span className="text-[#B8F500]">Rewards</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Complete verified activities, surveys, and partner tasks to earn points credited directly to your Swift Earn wallet.
            </p>

            {/* Quick Wallet Bar */}
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
              </div>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#6C2BD9] text-white shadow-md'
                  : 'bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Opportunity List */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#6C2BD9] border-t-[#B8F500] rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-bold text-zinc-500">Loading available tasks...</p>
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-zinc-200 space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-zinc-900">No active tasks in this view</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Check back shortly as new reward opportunities are refreshed throughout the day.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredOpportunities.map((opp) => {
              const cap = opp.daily_limit || opp.daily_cap || 10;
              const count = dailyCounts[opp.id] || 0;
              const isLimitReached = count >= cap;
              const durationSecs = opp.estimated_seconds || opp.estimated_duration || 30;

              return (
                <div
                  key={opp.id}
                  className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                    isLimitReached
                      ? 'border-zinc-200 opacity-60 bg-zinc-50/50'
                      : 'border-zinc-200/80 shadow-xs hover:shadow-lg hover:border-purple-200'
                  }`}
                >
                  <div>
                    {/* Header: Category Badge & Reward Amount */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="bg-purple-100 text-[#6C2BD9] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {opp.category || 'Task'}
                      </span>
                      <span className="text-base font-black text-[#6C2BD9]">
                        +₦{(opp.reward_amount || opp.reward_points || 10).toFixed(2)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-zinc-900">{opp.title || opp.name}</h3>
                    <p className="text-xs text-zinc-500 mt-2 leading-relaxed line-clamp-3">
                      {opp.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>~{durationSecs}s</span>
                      </span>
                      <span className="font-mono">
                        Daily: {count}/{cap}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (!isLimitReached && onStartRewardOpportunity) {
                          onStartRewardOpportunity(opp);
                        }
                      }}
                      disabled={isLimitReached}
                      className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isLimitReached
                          ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                          : 'bg-[#6C2BD9] hover:bg-[#5821B0] text-white shadow-md shadow-[#6C2BD9]/20'
                      }`}
                    >
                      {isLimitReached ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Daily Cap Reached</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Start Task</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Verification Guarantee Footer */}
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#6C2BD9] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-zinc-900">Swift Earn Security & Anti-Fraud Protection</p>
              <p className="text-zinc-500 text-[11px]">
                Each reward is cryptographically tracked and recorded to the immutable ledger upon verified completion.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full text-[10px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Instant Credit
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
