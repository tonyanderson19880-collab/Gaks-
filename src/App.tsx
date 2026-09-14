import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { NotificationModal } from './components/common/NotificationModal';
import { AdExperienceModal } from './components/rewards/AdExperienceModal';

import { LandingPage } from './pages/LandingPage';
import { SignUpPage } from './pages/SignUpPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { EarnPage } from './pages/EarnPage';
import { WalletPage } from './pages/WalletPage';
import { WithdrawPage } from './pages/WithdrawPage';
import { ReferralsPage } from './pages/ReferralsPage';
import { ProfilePage } from './pages/ProfilePage';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { LegalPages } from './pages/LegalPages';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { RewardOpportunity } from './types';

const MainAppContent: React.FC = () => {
  const { user, admin } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [initialRefCode, setInitialRefCode] = useState<string>('');
  const [activeAdOpportunity, setActiveAdOpportunity] = useState<RewardOpportunity | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Check URL query parameters for referral or direct links on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setInitialRefCode(ref);
      if (!user) {
        setCurrentTab('signup');
      }
    }
  }, [user]);

  // When user signs in, if on landing/login/signup, route to dashboard
  useEffect(() => {
    if (user && (currentTab === 'landing' || currentTab === 'login' || currentTab === 'signup')) {
      setCurrentTab('dashboard');
    }
  }, [user]);

  // Handle navigation
  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartReward = (opportunity: RewardOpportunity) => {
    if (!user) {
      setCurrentTab('login');
      return;
    }
    setActiveAdOpportunity(opportunity);
  };

  const handleRewardClaimed = () => {
    // Wallet is updated in AuthContext
  };

  // Render current view
  const renderCurrentPage = () => {
    switch (currentTab) {
      case 'landing':
        return (
          <LandingPage
            onStartEarning={() => handleNavigate(user ? 'earn' : 'signup')}
            onNavigate={handleNavigate}
          />
        );
      case 'signup':
        return <SignUpPage onNavigate={handleNavigate} initialReferralCode={initialRefCode} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'dashboard':
        return (
          <DashboardPage
            onNavigate={handleNavigate}
            onStartRewardOpportunity={handleStartReward}
          />
        );
      case 'earn':
        return <EarnPage onStartOpportunity={handleStartReward} />;
      case 'wallet':
        return <WalletPage onNavigate={handleNavigate} />;
      case 'withdraw':
        return <WithdrawPage onNavigate={handleNavigate} />;
      case 'referrals':
        return <ReferralsPage onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      case 'help':
        return <HelpCenterPage />;
      case 'legal-terms':
        return <LegalPages initialTab="terms" />;
      case 'legal-privacy':
        return <LegalPages initialTab="privacy" />;
      case 'legal-reward':
        return <LegalPages initialTab="reward" />;
      case 'legal-withdrawal':
        return <LegalPages initialTab="withdrawal" />;
      case 'admin':
        return <AdminDashboardPage onNavigate={handleNavigate} />;
      default:
        return (
          <LandingPage
            onStartEarning={() => handleNavigate(user ? 'earn' : 'signup')}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-[#B8F500] selection:text-[#0F172A]">
      {/* 1. Top Header (unless on dedicated admin view) */}
      {currentTab !== 'admin' && (
        <Header
          currentTab={currentTab}
          setCurrentTab={handleNavigate}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />
      )}

      {/* 3. Main Page Content */}
      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      {/* 4. Bottom Navigation Bar */}
      {currentTab !== 'admin' && (
        <BottomNav currentTab={currentTab} setCurrentTab={handleNavigate} />
      )}

      {/* 6. Notifications Slide-over/Modal */}
      <NotificationModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onNavigate={(tab) => {
          setNotificationsOpen(false);
          handleNavigate(tab);
        }}
      />

      {/* 7. Rewarded Ad Experience Modal with Server Cryptographic Verification */}
      {activeAdOpportunity && (
        <AdExperienceModal
          opportunity={activeAdOpportunity}
          onClose={() => setActiveAdOpportunity(null)}
          onRewardClaimed={handleRewardClaimed}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
