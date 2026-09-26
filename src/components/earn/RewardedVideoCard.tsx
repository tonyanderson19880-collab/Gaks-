import React, { useState, useEffect } from 'react';
import { Video, Lock, ArrowRight, Play, Info } from 'lucide-react';
import { api } from '../../api';

interface RewardedVideoCardProps {
  onStartVideo?: () => void;
}

/**
 * RewardedVideoCard Component
 *
 * Prepares the Earn page for future certified rewarded-video provider rollout.
 *
 * SAFETY INVARIANTS:
 * - Checks live provider availability status from server (/api/rewards/video/provider-status).
 * - If no real certified provider is configured/available, gracefully renders:
 *   "Rewarded videos are currently unavailable."
 * - NEVER displays fake production videos or fake ₦ amounts.
 * - NEVER creates client-side wallet credits.
 */
export const RewardedVideoCard: React.FC<RewardedVideoCardProps> = ({ onStartVideo }) => {
  const [providerStatus, setProviderStatus] = useState<{
    available: boolean;
    providerName: string | null;
    isDemo: boolean;
  }>({
    available: false,
    providerName: null,
    isDemo: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    api
      .getRewardedVideoStatus()
      .then((res) => {
        if (isMounted) {
          setProviderStatus(res);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProviderStatus({ available: false, providerName: null, isDemo: false });
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <article className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200/90 shadow-xs flex flex-col justify-between group">
      <div className="space-y-3">
        {/* Header row: Icon badge and Status badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#6C2BD9] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            <Video className="w-4 h-4 fill-current" />
          </div>

          {providerStatus.available ? (
            <div className="inline-flex items-center gap-1 bg-[#6C2BD9]/10 text-[#6C2BD9] font-black text-xs px-3 py-1 rounded-full border border-[#6C2BD9]/20">
              <Play className="w-3 h-3 fill-current" />
              <span>Available</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-500 font-bold text-[11px] px-2.5 py-0.5 rounded-full border border-zinc-200">
              <Lock className="w-3 h-3 text-zinc-400" />
              <span>Unavailable</span>
            </div>
          )}
        </div>

        {/* Title and Description */}
        <div>
          <h3 className="text-base font-extrabold text-zinc-900 leading-snug">
            Rewarded Videos
          </h3>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            {providerStatus.available
              ? 'Complete an eligible rewarded video opportunity to receive a verified reward.'
              : 'Rewarded videos are currently unavailable. New video opportunities will appear when a certified provider is active.'}
          </p>
        </div>
      </div>

      {/* Footer row */}
      <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 text-[11px] text-zinc-400">
          <Info className="w-3.5 h-3.5" />
          <span>Server Verified</span>
        </div>

        {providerStatus.available ? (
          <button
            onClick={onStartVideo}
            disabled={loading}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#6C2BD9] hover:bg-[#5821B0] active:scale-[0.98] text-white text-xs sm:text-sm font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation select-none disabled:opacity-50"
          >
            <span>Watch Video</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            disabled
            className="min-h-[44px] px-4 py-2 rounded-xl bg-zinc-100 text-zinc-400 text-xs font-bold cursor-not-allowed select-none"
          >
            Currently Unavailable
          </button>
        )}
      </div>
    </article>
  );
};
