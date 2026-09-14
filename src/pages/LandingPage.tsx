import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Wallet,
  Users,
  CheckCircle2,
  ChevronDown,
  Clock,
  Lock,
  DollarSign,
  Award,
  Zap,
} from 'lucide-react';
import { api } from '../api';
import { PublicStats } from '../types';

interface LandingPageProps {
  onStartEarning: () => void;
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartEarning, onNavigate }) => {
  const [statsData, setStatsData] = useState<PublicStats | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.getPublicStats();
        setStatsData(res);
      } catch (err) {
        console.error('Failed to fetch public stats:', err);
      }
    };
    fetchStats();
  }, []);

  const faqs = [
    {
      q: 'What is Swift Earn?',
      a: 'Swift Earn is a legitimate rewards platform that connects users with compliant, approved rewarded advertising opportunities from top brand partners. When you complete eligible videos, surveys, or sponsored tasks, you receive confirmed reward points directly into your wallet.',
    },
    {
      q: 'How do I earn rewards?',
      a: 'Browse the Earn section to find eligible opportunities. Click "Start", engage with the approved experience for the required duration, and our server-side compliance engine verifies your completion with the ad provider before instantly adding confirmed points to your ledger.',
    },
    {
      q: 'How much can I earn?',
      a: 'Earning potential depends on the number and type of opportunities available in your region. Daily tasks, videos, and surveys offer between 10 and 100+ points each. There are also generous referral bonuses for inviting friends.',
    },
    {
      q: 'When can I withdraw?',
      a: `You can request a withdrawal whenever your confirmed available balance meets or exceeds the minimum withdrawal threshold of ₦${statsData?.minimumWithdrawal || 500}.00.`,
    },
    {
      q: 'How do withdrawals work?',
      a: 'Go to your Wallet, enter your desired amount, select your payout method (Direct Bank Transfer or Fintech Wallet), provide your account details, and submit. Payouts undergo swift security verification and settlement.',
    },
    {
      q: "What happens if my reward doesn't appear?",
      a: 'Rewards require provider confirmation and must satisfy minimum completion duration (no skips or auto-clicks). If an ad was interrupted, you can restart it. Our transaction ledger logs all verified events in real time.',
    },
    {
      q: 'Can I have multiple accounts?',
      a: 'No. To ensure integrity for our advertising partners and prevent fraud, Swift Earn strictly enforces a one-account-per-user policy. Automated bots, self-referrals, and duplicate accounts are flagged and restricted.',
    },
    {
      q: 'How does the referral system work?',
      a: 'Share your unique referral link or code with friends. When a friend signs up and completes their first verified reward opportunity, a ₦50.00 referral bonus is automatically credited to your confirmed balance.',
    },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-[#0F172A]">
      {/* 1. Hero Section */}
      <section id="hero-section" className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#6C2BD9]">
              <span className="w-2 h-2 rounded-full bg-[#B8F500]"></span>
              <span>100% Compliant Rewarded Advertising</span>
            </div>

            {/* Large Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.1]">
              Turn Your Time Into <span className="text-[#6C2BD9]">Rewards</span>
            </h1>

            {/* Supporting text */}
            <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
              Complete eligible rewarded opportunities, earn points, and withdraw your rewards.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                id="hero-start-earning-btn"
                onClick={onStartEarning}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#6C2BD9] hover:bg-[#5821B0] text-white font-extrabold text-base shadow-lg shadow-purple-900/15 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Start Earning</span>
                <ArrowRight className="w-5 h-5 text-[#B8F500] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="hero-how-it-works-btn"
                onClick={() => {
                  document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-base transition-colors"
              >
                How It Works
              </button>
            </div>
          </div>

          {/* Visual representation of the Swift Earn dashboard using the two brand colors */}
          <div className="mt-14 max-w-4xl mx-auto">
            <div className="bg-[#0F172A] rounded-3xl p-4 sm:p-6 shadow-2xl border border-zinc-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#6C2BD9]/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#B8F500]/10 rounded-full blur-3xl pointer-events-none"></div>

              {/* Mock Dashboard Top Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-white tracking-tight">Swift Earn</span>
                  <span className="bg-[#B8F500] text-[#0F172A] text-[10px] font-extrabold px-2 py-0.5 rounded">
                    LIVE DASHBOARD
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-xs font-bold">
                    AM
                  </div>
                </div>
              </div>

              {/* Mock Balance & Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-5">
                {/* Main Available Balance Card */}
                <div className="bg-[#6C2BD9] text-white p-5 rounded-2xl md:col-span-2 relative overflow-hidden flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs uppercase font-bold text-purple-200 tracking-wider">
                        Available Balance
                      </span>
                      <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                        ₦1,450.00
                      </div>
                    </div>
                    <span className="bg-[#B8F500] text-[#0F172A] font-extrabold text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-[#0F172A]" /> Confirmed
                    </span>
                  </div>

                  <div className="pt-4 flex items-center justify-between text-xs text-purple-100 border-t border-purple-500/40 mt-4">
                    <span>Pending: ₦50.00</span>
                    <span>Total Earned: ₦2,450.00</span>
                  </div>
                </div>

                {/* Quick Action Preview */}
                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 font-semibold block mb-1">Fast Withdrawal</span>
                    <div className="text-lg font-bold text-white">Bank Transfer</div>
                    <p className="text-xs text-zinc-400 mt-1">Instant verification once threshold is reached.</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Min. Payout:</span>
                    <span className="text-xs font-extrabold text-[#B8F500]">₦500.00</span>
                  </div>
                </div>
              </div>

              {/* Mock Opportunities Preview */}
              <div className="bg-zinc-900/90 rounded-2xl p-4 border border-zinc-800">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-bold text-zinc-300 uppercase tracking-wide">Available Rewards Today</span>
                  <span className="text-[#B8F500] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 4 Available
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Rewarded Video</div>
                      <div className="text-[11px] text-zinc-400">30 seconds stream</div>
                    </div>
                    <span className="bg-[#B8F500] text-[#0F172A] font-extrabold text-xs px-2.5 py-1 rounded-lg">
                      +25 Points
                    </span>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Consumer Brand Survey</div>
                      <div className="text-[11px] text-zinc-400">60 seconds feedback</div>
                    </div>
                    <span className="bg-[#B8F500] text-[#0F172A] font-extrabold text-xs px-2.5 py-1 rounded-lg">
                      +50 Points
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. How It Works Section */}
      <section id="how-it-works-section" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#6C2BD9]">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900">How It Works</h2>
          <p className="text-sm sm:text-base text-zinc-600">
            Start earning confirmed rewards in minutes with our transparent reward pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 01 */}
          <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-xs relative hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <span className="text-3xl font-black text-[#6C2BD9]">01</span>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Create Your Account</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Sign up for free and create your Swift Earn account.
            </p>
          </div>

          {/* Step 02 */}
          <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-xs relative hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <span className="text-3xl font-black text-[#6C2BD9]">02</span>
              <div className="w-12 h-12 rounded-2xl bg-[#B8F500]/30 text-[#0F172A] flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Complete Rewards</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Complete available eligible rewarded opportunities.
            </p>
          </div>

          {/* Step 03 */}
          <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-xs relative hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <span className="text-3xl font-black text-[#6C2BD9]">03</span>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6C2BD9] flex items-center justify-center font-bold">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Earn & Withdraw</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Receive confirmed rewards and request withdrawals when eligible.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features-section" className="py-20 bg-white border-y border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#6C2BD9]">
              Platform Advantages
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900">
              Engineered for Fairness & Speed
            </h2>
            <p className="text-sm sm:text-base text-zinc-600">
              Built on verified advertising protocols to ensure transparency for both members and brand sponsors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-zinc-200 hover:border-[#6C2BD9]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#6C2BD9] text-[#B8F500] flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-1.5">Fast Rewards</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Track eligible rewards in your dashboard.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-zinc-200 hover:border-[#6C2BD9]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#6C2BD9] text-[#B8F500] flex items-center justify-center mb-4">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-1.5">Simple Withdrawals</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Request withdrawals once you meet the requirements.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-zinc-200 hover:border-[#6C2BD9]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#6C2BD9] text-[#B8F500] flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-1.5">Referral Rewards</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Invite friends and earn eligible referral rewards.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-zinc-200 hover:border-[#6C2BD9]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#6C2BD9] text-[#B8F500] flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-1.5">Secure Account</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Keep your account and reward history protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Statistics Section */}
      <section id="stats-section" className="py-20 bg-[#0F172A] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#B8F500]">
              Proven Track Record
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Platform Activity & Statistics
            </h2>
            <p className="text-xs text-zinc-400">
              {statsData?.demoMode
                ? 'Development environment simulation figures. Configurable by platform administrators.'
                : 'Real-time verified platform statistics.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900/90 rounded-3xl p-8 border border-zinc-800 text-center space-y-2">
              <div className="text-4xl sm:text-5xl font-black text-white">
                {statsData?.stats?.users_count || '10K+'}
              </div>
              <div className="text-sm font-bold text-zinc-400 uppercase tracking-wide">Users</div>
              <p className="text-xs text-zinc-500">Active registered community members</p>
            </div>

            <div className="bg-zinc-900/90 rounded-3xl p-8 border border-zinc-800 text-center space-y-2">
              <div className="text-4xl sm:text-5xl font-black text-[#B8F500]">
                {statsData?.stats?.rewards_completed || '50K+'}
              </div>
              <div className="text-sm font-bold text-zinc-400 uppercase tracking-wide">Rewards Completed</div>
              <p className="text-xs text-zinc-500">Verified provider advertising sessions</p>
            </div>

            <div className="bg-zinc-900/90 rounded-3xl p-8 border border-zinc-800 text-center space-y-2">
              <div className="text-4xl sm:text-5xl font-black text-white">
                {statsData?.stats?.rewards_issued || '₦12.5M'}
              </div>
              <div className="text-sm font-bold text-zinc-400 uppercase tracking-wide">Rewards Issued</div>
              <p className="text-xs text-zinc-500">Credited to confirmed user ledgers</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section id="faq-section" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#6C2BD9]">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-zinc-600">
            Everything you need to know about Swift Earn and reward processing.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-zinc-200 overflow-hidden transition-all shadow-xs"
              >
                <button
                  id={`faq-btn-${idx}`}
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full text-left px-6 py-4.5 flex items-center justify-between gap-4 font-bold text-zinc-900 hover:text-[#6C2BD9] transition-colors"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-zinc-500 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-[#6C2BD9]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 bg-purple-50/20">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Banner */}
        <div className="mt-12 text-center bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="text-sm font-bold text-zinc-900">Still have questions?</h4>
            <p className="text-xs text-zinc-500 mt-0.5">Our support desk is available to assist you.</p>
          </div>
          <button
            id="faq-contact-support-btn"
            onClick={() => onNavigate('help')}
            className="px-5 py-2.5 rounded-xl bg-[#6C2BD9] hover:bg-[#5821B0] text-white text-xs font-bold transition-colors"
          >
            Contact Help Center
          </button>
        </div>
      </section>
    </div>
  );
};
