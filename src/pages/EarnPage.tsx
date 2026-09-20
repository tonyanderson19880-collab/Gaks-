import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, Award, Sparkles, ShieldCheck, CheckCircle2, Layers, Gift, Layers3 } from 'lucide-react';
import { AyetOffer } from '../types';
import { api } from '../api';

interface EarnPageProps {
  onRefreshWallet?: () => void;
}

export const EarnPage: React.FC<EarnPageProps> = ({ onRefreshWallet }) => {
  const [offers, setOffers] = useState<AyetOffer[]>([]);
  const [offerwallUrl, setOfferwallUrl] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [notice, setNotice] = useState<string | null>(null);

  const fetchAyetOffers = async () => {
    try {
      setLoading(true);
      const res = await api.getAyetOffers();
      setIsConfigured(res.configured);
      setMessage(res.message || '');
      setOffers(res.offers || []);
      setOfferwallUrl(res.offerwallUrl || null);
    } catch (err: any) {
      console.error('Failed to load ayeT offers:', err);
      setIsConfigured(false);
      setMessage('Unable to connect to ayeT offerwall service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAyetOffers();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAyetOffers();
    if (onRefreshWallet) onRefreshWallet();
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleStartOffer = (trackingUrl: string, offerTitle: string) => {
    setNotice(`Redirecting to "${offerTitle}". Complete the advertiser's required action. Once ayeT Studios sends the verified callback, your wallet will be credited automatically.`);
    setTimeout(() => {
      window.open(trackingUrl, '_blank', 'noopener,noreferrer');
    }, 300);
  };

  const categories = [
    { id: 'all', label: 'All Offers' },
    { id: 'sponsored_task', label: 'Tasks' },
    { id: 'survey', label: 'Surveys' },
    { id: 'app_trial', label: 'App Trials' },
    { id: 'video', label: 'Videos' },
  ];

  const filteredOffers = offers.filter((off) => {
    if (selectedCategory === 'all') return true;
    return (off.category || 'sponsored_task').toLowerCase() === selectedCategory;
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
                  <Sparkles className="w-3.5 h-3.5" /> ayeT-Studios Offerwall
                </span>
                <span className="bg-[#6C2BD9]/40 text-[#B8F500] text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full border border-[#6C2BD9]">
                  Verified S2S Callback Engine
                </span>
              </div>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Offers & Balance</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Earn <span className="text-[#B8F500]">Rewards</span>
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
              Complete available sponsor offers, tasks, and surveys powered by ayeT Studios.
              When an advertiser verifies your task completion, ayeT issues a secure server-to-server callback that instantly credits your wallet.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-zinc-400 border-t border-zinc-800">
              <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-[#B8F500]" />
                HMAC SHA-256 Postback Security
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-[#B8F500]" />
                Idempotent Wallet Crediting
              </span>
            </div>
          </div>
        </div>

        {/* Action Notice */}
        {notice && (
          <div className="bg-purple-50 border border-purple-200 text-[#6C2BD9] rounded-2xl p-4 text-xs font-semibold flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#6C2BD9] shrink-0" />
              <span>{notice}</span>
            </div>
            <button
              onClick={() => setNotice(null)}
              className="text-xs text-purple-700 hover:text-purple-900 font-bold underline shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Full Offerwall Launch Banner if Available */}
        {offerwallUrl && (
          <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 flex items-center justify-center sm:justify-start gap-1.5">
                <Layers3 className="w-4 h-4 text-[#6C2BD9]" />
                <span>Open Full ayeT Offerwall Marketplace</span>
              </h2>
              <p className="text-xs text-zinc-500">
                Browse hundreds of high-paying advertiser tasks, mobile games, and market research surveys.
              </p>
            </div>
            <button
              onClick={() => handleStartOffer(offerwallUrl, 'ayeT Offerwall Marketplace')}
              className="px-5 py-2.5 rounded-xl bg-[#6C2BD9] hover:bg-[#5821B0] text-white font-extrabold text-xs shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Launch Offerwall</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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
            Showing {filteredOffers.length} available offers
          </div>
        </div>

        {/* Offers Grid */}
        {loading ? (
          <div className="py-20 text-center text-sm font-bold text-zinc-400 flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#6C2BD9]" />
            <span>Fetching available ayeT offers...</span>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-12 text-center border border-zinc-200 space-y-4 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center mx-auto">
              <Layers className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-zinc-900">
                {isConfigured ? 'No active offers in this view' : 'ayeT Offerwall Currently Unavailable'}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {message ||
                  'No offers match the current selection. You can launch the full offerwall marketplace above or check back shortly as advertisers refresh offer inventory.'}
              </p>
            </div>

            {offerwallUrl && (
              <button
                onClick={() => handleStartOffer(offerwallUrl, 'ayeT Offerwall Marketplace')}
                className="px-6 py-3 rounded-xl bg-[#6C2BD9] hover:bg-[#5821B0] text-white font-extrabold text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Launch ayeT Offerwall Marketplace</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-3xl p-6 border border-zinc-200 hover:border-[#6C2BD9]/40 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="bg-purple-100 text-[#6C2BD9] text-[11px] font-extrabold px-3 py-1 rounded-lg flex items-center gap-1.5 uppercase tracking-wide">
                      <span>{offer.provider || 'ayeT-Studios'}</span>
                    </span>

                    <div className="bg-[#B8F500] text-[#0F172A] font-black text-xs px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>+₦{offer.reward_amount.toFixed(2)}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold text-zinc-900 group-hover:text-[#6C2BD9] transition-colors line-clamp-2">
                    {offer.title}
                  </h3>

                  <p className="text-xs text-zinc-600 mt-2 leading-relaxed line-clamp-3">
                    {offer.description}
                  </p>

                  {offer.instructions && (
                    <div className="mt-3 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-[11px] text-zinc-500 leading-snug">
                      <span className="font-bold text-zinc-700">Requirement: </span>
                      {offer.instructions}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Estimated time: ~{offer.estimated_minutes || 5} mins</span>
                    <span className="font-bold text-[#6C2BD9]">Verified S2S</span>
                  </div>

                  <button
                    onClick={() => handleStartOffer(offer.tracking_link || offerwallUrl || '#', offer.title)}
                    className="w-full py-2.5 rounded-xl bg-[#6C2BD9] hover:bg-[#5821B0] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Complete Offer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
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
