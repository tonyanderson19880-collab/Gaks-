import React, { useState, useEffect } from 'react';
import { Clock, Play, Video } from 'lucide-react';
import { RewardOpportunity } from '../types';
import { api } from '../api';

interface EarnPageProps {
  onStartOpportunity: (opp: RewardOpportunity) => void;
}

export const EarnPage: React.FC<EarnPageProps> = ({ onStartOpportunity }) => {
  const [opportunities, setOpportunities] = useState<RewardOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24 md:pb-12 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Watch Video Ads
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Watch short video ads to completion and earn instant rewards.
          </p>
        </div>

        {/* Video Ads Grid */}
        {loading ? (
          <div className="py-20 text-center text-sm text-zinc-400">Loading video ads...</div>
        ) : opportunities.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200">
            <p className="text-sm font-bold text-zinc-700">No video ads currently available.</p>
            <p className="text-xs text-zinc-400 mt-1">Please check back shortly as new video ads populate.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-[#6C2BD9]/30 transition-all group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-purple-100 text-[#6C2BD9] text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5" />
                      <span>Video Ad</span>
                    </span>

                    {/* Reward Points */}
                    <div className="bg-[#B8F500] text-[#0F172A] font-black text-xs px-3 py-1 rounded-full shadow-xs">
                      +{opp.reward_points} Points
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold text-zinc-900 group-hover:text-[#6C2BD9] transition-colors">
                    {opp.title}
                  </h3>

                  <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                    {opp.description}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">Duration</span>
                    <span className="text-xs font-bold text-zinc-800 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      {opp.estimated_seconds} seconds
                    </span>
                  </div>

                  <button
                    id={`btn-start-opportunity-${opp.id}`}
                    onClick={() => onStartOpportunity(opp)}
                    className="px-5 py-2.5 rounded-xl bg-[#6C2BD9] hover:bg-[#5821B0] text-white font-extrabold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Watch Ad</span>
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
