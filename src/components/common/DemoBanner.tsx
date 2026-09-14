import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, UserCheck, Eye, Sparkles } from 'lucide-react';

interface DemoBannerProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ currentTab, setCurrentTab }) => {
  const { user, admin, switchDemoMode } = useAuth();

  return (
    <aside aria-label="Demo environment controls" id="swift-earn-demo-banner" className="bg-[#0F172A] text-white text-xs border-b border-[#1E293B] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-[#B8F500] text-[#0F172A] font-extrabold px-2 py-0.5 rounded tracking-wide text-[10px] uppercase">
            DEMO
          </span>
          <span className="text-zinc-300 hidden sm:inline">
            Swift Earn Dev Sandbox • All rewards & balances are test simulated
          </span>
          <span className="text-zinc-300 sm:hidden">
            Dev Sandbox
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-zinc-400 mr-1 hidden md:inline text-[11px]">Quick Switch:</span>

          <button
            id="demo-switch-guest"
            onClick={async () => {
              await switchDemoMode('guest');
              setCurrentTab('landing');
            }}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 font-medium ${
              !user && !admin
                ? 'bg-[#6C2BD9] text-white shadow-sm'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
            }`}
          >
            <Eye className="w-3 h-3" />
            Guest
          </button>

          <button
            id="demo-switch-user"
            onClick={async () => {
              await switchDemoMode('user');
              setCurrentTab('dashboard');
            }}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 font-medium ${
              user && !admin
                ? 'bg-[#6C2BD9] text-white shadow-sm'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            User: Alex (₦1,450)
          </button>

          <button
            id="demo-switch-admin"
            onClick={async () => {
              await switchDemoMode('admin');
              setCurrentTab('admin');
            }}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 font-medium ${
              admin
                ? 'bg-[#B8F500] text-[#0F172A] font-bold shadow-sm'
                : 'bg-zinc-800 hover:bg-zinc-700 text-[#B8F500]'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            Admin Portal
          </button>
        </div>
      </div>
    </aside>
  );
};
