import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ setCurrentTab }) => {
  const { user } = useAuth();

  const handleNav = (tab: string) => {
    setCurrentTab(tab);
  };

  return (
    <header id="swift-earn-main-header" className="bg-white border-b border-zinc-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-center">
        <button
          id="brand-logo-btn"
          onClick={() => handleNav(user ? 'dashboard' : 'landing')}
          className="text-center group cursor-pointer focus:outline-hidden"
          title="Swift Earn"
        >
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#6C2BD9] hover:opacity-90 transition-opacity">
            Swift Earn
          </span>
        </button>
      </div>
    </header>
  );
};
