import React, { useState, useEffect } from 'react';
import { Clock, Play, Video, ShieldCheck, Sparkles, Filter, CheckCircle2, Layers, Award } from 'lucide-react';
import { RewardOpportunity } from '../types';
import { api } from '../api';

interface EarnPageProps {
  onStartOpportunity: (opp: RewardOpportunity) => void;
}

export const EarnPage: React.FC<EarnPageProps> = ({ onStartOpportunity }) => {
  const [opportunities, setOpportunities] = useState<RewardOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchOpps = async () => {
      try {
        setLoading(true);
        const res = await api.getOpportunities();
        setOpportunities(res.opportunities || []);
      } catch (err) {
        console.error('Failed to load opportunities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOpps();
  }, []);

  const categories = [
    { id: 'all', label: 'All Offers' },
    { id: 'video', label: 'Videos' },
    { id: 'survey', label: 'Surveys' },
    { id: 'app_trial', label: 'App Trials' },
  ];

  const filteredOpps = opportunities.filter((opp) => {
    if (selectedCategory === 'all') return true;
    return (opp.category || 'video').toLowerCase() === selectedCategory;
  });

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24 md:pb-12 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Mobile-First Deep Purple & Lime Hero Header */}
        <div className="bg-gradient-to-br from-[#0F172A] via-zinc-900 to-[#0F172A] rounded-3xl p-6 sm:p-8 border border-zinc-800 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-[#6C2BD9]/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-[#B8F500]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#B8F500] text-[#0F172A] text-[10px] sm:text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Verified Payout Engine
              </span>
              <span className="bg-[#6C2BD9]/40 text-[#B8F500] text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full border border-[#6C2BD9]">
                Zero Deposit Required
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Earning <span className="text-[#B8F500]">Opportunities</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Complete sponsored videos, quick brand opinion surveys, and product demos. Verified points are instantly converted to available NGN balance.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-zinc-400 border-t border-zinc-800">
              <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-[#B8F500]" />
                Rate-Limit Anti-Abuse Active
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-[#B8F500]" />
                Atomic Wallet Ledger Verification
              </span>
            </div>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-2 shrink-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[#6C2BD9] text-white shadow-md'
                    : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-bold text-zinc-500 hidden sm:block">
            Showing {filteredOpps.length} opportunities
          </div>
        </div>

        {/* Opportunities Grid */}
        {loading ? (
          <div className="py-20 text-center text-sm font-bold text-zinc-400">Loading earning opportunities...</div>
        ) : filteredOpps.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-zinc-800">No active opportunities in this category right now.</p>
            <p className="text-xs text-zinc-500">Check back shortly as new sponsor slots refresh continuously.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOpps.map((opp) => (
              <div
                key={opp.id}
                className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-xs flex flex-col justify-between hover:shadow-lg hover:border-[#6C2BD9]/40 transition-all group relative overflow-hidden"
              >
                <div>
                  {/* Top Header & Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="bg-purple-100 text-[#6C2BD9] text-[11px] font-extrabold px-3 py-1 rounded-lg flex items-center gap-1.5 uppercase tracking-wide">
                      <Video className="w-3.5 h-3.5" />
                      <span>{opp.provider || 'Demo Ad Network'}</span>
                    </span>

                    {/* Reward Badge in NGN / Points */}
                    <div className="bg-[#B8F500] text-[#0F172A] font-black text-xs px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>+₦{(opp.reward_points || opp.reward_amount || 10).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-extrabold text-zinc-900 group-hover:text-[#6C2BD9] transition-colors line-clamp-2">
                    {opp.title || opp.name}
                  </h3>

                  <p className="text-xs text-zinc-600 mt-2 leading-relaxed line-clamp-3">
                    {opp.description}
                  </p>
                </div>

                {/* Opportunity Stats & Action */}
                <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      {opp.estimated_seconds || opp.estimated_duration || 30}s completion
                    </span>
                    <span className="text-[11px] font-bold text-zinc-700">
                      Limit: {opp.daily_cap || opp.daily_limit || 10}/day
                    </span>
                  </div>

                  <button
                    id={`btn-start-opportunity-${opp.id}`}
                    onClick={() => onStartOpportunity(opp)}
                    className="px-5 py-2.5 rounded-xl bg-[#6C2BD9] hover:bg-[#5821B0] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span>Start</span>
                    <Play className="w-3.5 h-3.5 fill-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
