import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Users,
  Wallet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Settings,
  RefreshCw,
  XCircle,
  Eye,
  Sliders,
  LogOut,
  Gift,
  Plus,
  Play,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { api } from '../api';
import { RewardOpportunity } from '../types';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { admin, adminLogout, adminLogin } = useAuth();
  const [adminEmail, setAdminEmail] = useState('admin@swiftearn.demo');
  const [adminPassword, setAdminPassword] = useState('AdminPassword123!');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'withdrawals' | 'rewards' | 'users' | 'security' | 'settings'>('rewards');
  const [metrics, setMetrics] = useState<any>(null);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<RewardOpportunity[]>([]);
  const [rewardSessions, setRewardSessions] = useState<any[]>([]);
  const [fraudEvents, setFraudEvents] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOpp, setNewOpp] = useState({
    name: '',
    description: '',
    reward_amount: 10,
    estimated_duration: 30,
    daily_limit: 10,
    provider: 'Demo',
    category: 'video' as 'video' | 'survey' | 'app_trial' | 'sponsored_task',
    status: 'active' as 'active' | 'inactive',
  });

  const [settings, setSettings] = useState<any>({
    minimum_withdrawal: 500,
    point_value_naira: 1.0,
    demo_mode: true,
  });
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchAdminData = async () => {
    if (!admin) return;
    try {
      setLoading(true);
      const [overviewRes, withRes, usersRes, logsRes, rewardsRes] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminWithdrawals(),
        api.getAdminUsers(),
        api.getAdminAuditLogs(),
        api.getAdminRewards(),
      ]);
      setMetrics(overviewRes.metrics);
      setSettings(overviewRes.settings);
      setWithdrawals(withRes.withdrawals || []);
      setUsersList(usersRes.users || []);
      setAuditLogs(logsRes.auditLogs || []);
      setRewardSessions(rewardsRes.sessions || []);
      setFraudEvents(rewardsRes.fraudEvents || []);
      if (rewardsRes.opportunities) {
        setOpportunities(rewardsRes.opportunities);
      } else {
        const oppsRes = await api.getAdminRewardOpportunities().catch(() => ({ opportunities: [] }));
        setOpportunities(oppsRes.opportunities || []);
      }
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin) {
      fetchAdminData();
    }
  }, [admin]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      setLoading(true);
      await adminLogin(adminEmail, adminPassword);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOpportunity = async (id: string) => {
    try {
      await api.toggleAdminRewardOpportunity(id);
      setActionSuccess('Reward opportunity status updated');
      setTimeout(() => setActionSuccess(null), 3000);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle opportunity');
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdminRewardOpportunity(newOpp);
      setShowCreateModal(false);
      setActionSuccess('New reward opportunity created successfully');
      setTimeout(() => setActionSuccess(null), 3000);
      setNewOpp({
        name: '',
        description: '',
        reward_amount: 10,
        estimated_duration: 30,
        daily_limit: 10,
        provider: 'Demo',
        category: 'video',
        status: 'active',
      });
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to create opportunity');
    }
  };

  const handleUpdateWithdrawalStatus = async (
    id: string,
    status: 'processing' | 'completed' | 'rejected',
    rejectionReason?: string
  ) => {
    try {
      await api.updateWithdrawalStatus(id, {
        status,
        rejectionReason,
        providerReference: status === 'completed' ? `PAY-REF-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
      });
      setActionSuccess(`Withdrawal updated to ${status}`);
      setTimeout(() => setActionSuccess(null), 3000);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update withdrawal status');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await api.updateUserStatus(userId, newStatus);
      setActionSuccess(`User status changed to ${newStatus}`);
      setTimeout(() => setActionSuccess(null), 3000);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updatePlatformSettings(settings);
      setActionSuccess('Platform settings successfully applied.');
      setTimeout(() => setActionSuccess(null), 3000);
      await fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    }
  };

  // If not logged in as Admin, show Admin Login Box
  if (!admin) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#6C2BD9] text-[#B8F500] flex items-center justify-center mx-auto shadow-lg mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">Swift Earn</span>
          <h2 className="text-xl font-extrabold text-[#B8F500] mt-1">Admin Portal Access</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Restricted compliance and payout verification dashboard
          </p>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-zinc-900 py-8 px-6 rounded-3xl border border-zinc-800 shadow-xl">
            {loginError && (
              <div className="mb-4 bg-red-950/60 border border-red-800 text-red-200 rounded-xl p-3 text-xs">
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-hidden focus:border-[#B8F500]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-hidden focus:border-[#B8F500]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#B8F500] hover:bg-[#A3DC00] text-[#0F172A] font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Authenticating...' : 'Access Admin Console'}</span>
                </button>
              </div>
            </form>

            <div className="mt-4 pt-4 border-t border-zinc-800 text-center">
              <button
                onClick={() => onNavigate('landing')}
                className="text-xs text-zinc-400 hover:text-white"
              >
                &larr; Return to Public Site
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0F172A] text-white min-h-screen pb-24 md:pb-12 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6C2BD9] text-[#B8F500] flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-white">Swift Earn</span>
                <span className="bg-[#B8F500] text-[#0F172A] text-[10px] font-black px-2 py-0.5 rounded uppercase">
                  ADMIN CONSOLE
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Logged in as <strong>{admin.email}</strong> ({admin.role})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchAdminData}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 transition-colors"
            >
              User App View
            </button>
            <button
              onClick={adminLogout}
              className="px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-800 hover:bg-purple-900 text-xs font-bold text-purple-200 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Admin Logout</span>
            </button>
          </div>
        </div>

        {/* Global Toast Success Message */}
        {actionSuccess && (
          <div className="bg-[#B8F500] text-[#0F172A] font-bold text-xs p-3 rounded-xl flex items-center gap-2 shadow-lg animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Platform Overview Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Total Users</span>
            <div className="text-2xl font-black text-white">{metrics?.totalUsers || 0}</div>
            <span className="text-[10px] text-zinc-500">Registered members</span>
          </div>

          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Rewards Verified</span>
            <div className="text-2xl font-black text-[#B8F500]">{metrics?.totalRewardsCompleted || 0}</div>
            <span className="text-[10px] text-zinc-500">Ad sessions verified</span>
          </div>

          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Rewards Issued</span>
            <div className="text-2xl font-black text-white">₦{(metrics?.totalRewardsIssued || 0).toFixed(2)}</div>
            <span className="text-[10px] text-zinc-500">Credited into ledger</span>
          </div>

          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Total Withdrawn</span>
            <div className="text-2xl font-black text-white">₦{(metrics?.totalWithdrawn || 0).toFixed(2)}</div>
            <span className="text-[10px] text-zinc-500">Settled to banks</span>
          </div>

          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-1 col-span-2 lg:col-span-1">
            <span className="text-[10px] uppercase font-bold text-purple-400">Pending Withdrawals</span>
            <div className="text-2xl font-black text-[#B8F500]">{metrics?.pendingWithdrawalsCount || 0}</div>
            <span className="text-[10px] text-zinc-400">₦{(metrics?.pendingWithdrawalsAmount || 0).toFixed(2)} in queue</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'rewards'
                ? 'bg-[#6C2BD9] text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-[#B8F500]" />
            <span>Reward Engine & Ops ({opportunities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'withdrawals'
                ? 'bg-[#6C2BD9] text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Withdrawals Queue ({withdrawals.filter((w) => w.status === 'pending').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-[#6C2BD9] text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users & Balances ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-[#6C2BD9] text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Fraud & Security ({fraudEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-[#6C2BD9] text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Platform Controls</span>
          </button>
        </div>

        {/* Tab: Reward Engine & Opportunities */}
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white">Reward Opportunities</h3>
                    <span className="bg-[#B8F500] text-[#0F172A] font-black text-[10px] px-2 py-0.5 rounded uppercase">
                      DEMO & LIVE
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Manage catalog of rewarded video, surveys, and partner activities with daily caps
                  </p>
                </div>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#B8F500] hover:bg-[#A3DC00] text-[#0F172A] font-extrabold text-xs flex items-center gap-2 shadow-md transition-all self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>New Opportunity</span>
                </button>
              </div>

              {opportunities.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500">No reward opportunities configured.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Campaign / Name</th>
                        <th className="p-3">Provider</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Reward Points</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Daily Limit</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {opportunities.map((opp) => (
                        <tr key={opp.id} className="hover:bg-zinc-800/50">
                          <td className="p-3">
                            <div className="font-bold text-white">{opp.name || opp.title}</div>
                            <div className="text-[11px] text-zinc-400 line-clamp-1 max-w-xs">{opp.description}</div>
                          </td>
                          <td className="p-3 font-medium text-zinc-300">
                            <span className="px-2 py-0.5 rounded bg-zinc-800 text-[11px] text-zinc-200">
                              {opp.provider}
                            </span>
                          </td>
                          <td className="p-3 capitalize text-zinc-300">{opp.category || 'video'}</td>
                          <td className="p-3 font-extrabold text-[#B8F500] text-sm">
                            +{opp.reward_amount || opp.reward_points} pts
                          </td>
                          <td className="p-3 text-zinc-300 font-mono text-xs">
                            {opp.estimated_duration || opp.estimated_seconds || 30}s
                          </td>
                          <td className="p-3 text-zinc-300 font-mono text-xs">
                            {opp.daily_limit || opp.daily_cap || 10} / day
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                opp.status === 'active' || opp.active
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                              }`}
                            >
                              {opp.status || (opp.active ? 'active' : 'inactive')}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleToggleOpportunity(opp.id)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                                opp.status === 'active' || opp.active
                                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                                  : 'bg-[#6C2BD9] hover:bg-[#5821B0] text-white'
                              }`}
                            >
                              {opp.status === 'active' || opp.active ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Live Reward Sessions Stream */}
            <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white">Recent Verified Reward Sessions</h3>
                  <p className="text-xs text-zinc-400">Server-side HMAC validated completions and idempotency keys</p>
                </div>
              </div>

              {rewardSessions.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">No reward sessions recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Session ID</th>
                        <th className="p-3">User ID</th>
                        <th className="p-3">Opportunity</th>
                        <th className="p-3">Reward</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Started</th>
                        <th className="p-3">Completed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {rewardSessions.slice(0, 15).map((s) => (
                        <tr key={s.id} className="hover:bg-zinc-800/50">
                          <td className="p-3 font-mono text-[11px] text-zinc-300">{s.id.slice(0, 12)}...</td>
                          <td className="p-3 font-mono text-[11px] text-zinc-400">{s.user_id.slice(0, 8)}...</td>
                          <td className="p-3 font-medium text-white">{s.opportunity_title || s.opportunity_name || 'Demo Video'}</td>
                          <td className="p-3 font-bold text-[#B8F500]">+{s.reward_amount || s.reward_points} pts</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                s.status === 'completed'
                                  ? 'bg-[#B8F500] text-[#0F172A]'
                                  : s.status === 'started'
                                  ? 'bg-blue-900 text-blue-200'
                                  : 'bg-red-950 text-red-200'
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                          <td className="p-3 text-[11px] text-zinc-400">
                            {new Date(s.started_at).toLocaleTimeString()}
                          </td>
                          <td className="p-3 text-[11px] text-zinc-400">
                            {s.completed_at ? new Date(s.completed_at).toLocaleTimeString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Create Opportunity */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
            <div className="bg-[#0F172A] border border-zinc-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="text-lg font-extrabold text-white">Create Reward Opportunity</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 text-zinc-400 hover:text-white rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateOpportunity} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                    Opportunity Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Demo Rewarded Video"
                    value={newOpp.name}
                    onChange={(e) => setNewOpp({ ...newOpp, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-hidden focus:border-[#B8F500]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                    Description
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. Watch a 30-second partner demonstration..."
                    value={newOpp.description}
                    onChange={(e) => setNewOpp({ ...newOpp, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-hidden focus:border-[#B8F500]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                      Reward (Points)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newOpp.reward_amount}
                      onChange={(e) => setNewOpp({ ...newOpp, reward_amount: parseFloat(e.target.value) || 10 })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-bold text-[#B8F500]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                      Duration (Seconds)
                    </label>
                    <input
                      type="number"
                      required
                      min="5"
                      value={newOpp.estimated_duration}
                      onChange={(e) => setNewOpp({ ...newOpp, estimated_duration: parseInt(e.target.value) || 30 })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                      Daily Limit / User
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newOpp.daily_limit}
                      onChange={(e) => setNewOpp({ ...newOpp, daily_limit: parseInt(e.target.value) || 10 })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                      Category
                    </label>
                    <select
                      value={newOpp.category}
                      onChange={(e) => setNewOpp({ ...newOpp, category: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-bold"
                    >
                      <option value="video">Rewarded Video</option>
                      <option value="survey">Interactive Survey</option>
                      <option value="app_trial">App Engagement</option>
                      <option value="sponsored_task">Sponsored Task</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#B8F500] hover:bg-[#A3DC00] text-[#0F172A] font-extrabold text-xs shadow-md transition-all"
                  >
                    Save Opportunity
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-semibold text-xs hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab 1: Withdrawals Queue */}
        {activeTab === 'withdrawals' && (
          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white">Withdrawal Requests</h3>
                <p className="text-xs text-zinc-400">Review, process, and confirm banking disbursements</p>
              </div>
            </div>

            {withdrawals.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">No withdrawal requests found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Reference</th>
                      <th className="p-3">User</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Method & Details</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-zinc-800/50">
                        <td className="p-3 font-mono font-bold text-white">{w.reference}</td>
                        <td className="p-3">
                          <div className="font-bold text-white">{w.user_name || 'Member'}</div>
                          <div className="text-[11px] text-zinc-400">{w.user_email}</div>
                        </td>
                        <td className="p-3 font-extrabold text-[#B8F500] text-sm">
                          ₦{w.amount.toFixed(2)}
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-white capitalize block">
                            {w.payout_method.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            {w.account_details?.bankName || w.account_details?.walletProvider}: {w.account_details?.accountNumber || w.account_details?.walletAccountId} ({w.account_details?.accountName})
                          </span>
                        </td>
                        <td className="p-3 text-zinc-400 text-[11px]">
                          {new Date(w.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                              w.status === 'completed'
                                ? 'bg-[#B8F500] text-[#0F172A]'
                                : w.status === 'processing'
                                ? 'bg-blue-900 text-blue-200'
                                : w.status === 'pending'
                                ? 'bg-[#6C2BD9] text-white'
                                : 'bg-red-950 text-red-200'
                            }`}
                          >
                            {w.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          {w.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateWithdrawalStatus(w.id, 'processing')}
                                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px]"
                              >
                                Mark Processing
                              </button>
                              <button
                                onClick={() => handleUpdateWithdrawalStatus(w.id, 'rejected', 'Failed anti-fraud validation')}
                                className="px-2 py-1 rounded bg-red-900 hover:bg-red-800 text-red-200 font-bold text-[11px]"
                              >
                                Reject & Refund
                              </button>
                            </>
                          )}
                          {w.status === 'processing' && (
                            <button
                              onClick={() => handleUpdateWithdrawalStatus(w.id, 'completed')}
                              className="px-2.5 py-1 rounded bg-[#B8F500] hover:bg-[#A3DC00] text-[#0F172A] font-extrabold text-[11px]"
                            >
                              Confirm Payout
                            </button>
                          )}
                          {w.status === 'completed' && (
                            <span className="text-[11px] text-zinc-500 font-mono">
                              Settled ({w.provider_reference || 'Confirmed'})
                            </span>
                          )}
                          {w.status === 'rejected' && (
                            <span className="text-[11px] text-red-400">
                              {w.rejection_reason || 'Rejected'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Users Management */}
        {activeTab === 'users' && (
          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 space-y-4">
            <h3 className="text-base font-extrabold text-white">Registered User Accounts</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Available Balance</th>
                    <th className="p-3">Total Earned</th>
                    <th className="p-3">Total Withdrawn</th>
                    <th className="p-3">Referral Code</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Account Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-800/50">
                      <td className="p-3">
                        <div className="font-bold text-white">{u.full_name}</div>
                        <div className="text-[11px] text-zinc-400">{u.email}</div>
                      </td>
                      <td className="p-3 font-extrabold text-[#B8F500]">
                        ₦{(u.available_balance || 0).toFixed(2)}
                      </td>
                      <td className="p-3 text-white">₦{(u.total_earned || 0).toFixed(2)}</td>
                      <td className="p-3 text-zinc-400">₦{(u.total_withdrawn || 0).toFixed(2)}</td>
                      <td className="p-3 font-mono text-[#6C2BD9]">{u.referral_code}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            u.status === 'active'
                              ? 'bg-emerald-950 text-emerald-300'
                              : 'bg-red-950 text-red-300'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.status)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                            u.status === 'active'
                              ? 'bg-red-900/60 hover:bg-red-800 text-red-200'
                              : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Unsuspend'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Security & Fraud Audit Logs */}
        {activeTab === 'security' && (
          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white">Fraud & Security Audit Trail</h3>
                <p className="text-xs text-zinc-400">Real-time system telemetry, token checks, and anti-cheat detections</p>
              </div>
            </div>

            <div className="divide-y divide-zinc-800">
              {auditLogs.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500">No security incidents logged.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            log.severity === 'HIGH'
                              ? 'bg-red-900 text-red-100'
                              : log.severity === 'MEDIUM'
                              ? 'bg-amber-900 text-amber-100'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {log.severity || 'INFO'}
                        </span>
                        <span className="font-bold text-white">{log.event_type}</span>
                        <span className="text-[11px] font-mono text-zinc-400">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-zinc-400 mt-1">{log.details}</p>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        User: {log.user_id || 'system'} • IP: {log.ip_address || '127.0.0.1'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Platform Settings */}
        {activeTab === 'settings' && (
          <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 max-w-2xl space-y-5">
            <div>
              <h3 className="text-base font-extrabold text-white">Platform Controls & Rules</h3>
              <p className="text-xs text-zinc-400">Configure global thresholds, point value, and display numbers</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                  Minimum Withdrawal Threshold (₦)
                </label>
                <input
                  type="number"
                  min="100"
                  step="50"
                  value={settings.minimum_withdrawal}
                  onChange={(e) =>
                    setSettings({ ...settings, minimum_withdrawal: parseFloat(e.target.value) || 500 })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">
                  Point Exchange Value (1 Point = ₦X)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.point_value_naira}
                  onChange={(e) =>
                    setSettings({ ...settings, point_value_naira: parseFloat(e.target.value) || 1.0 })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white text-xs font-bold"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#B8F500] hover:bg-[#A3DC00] text-[#0F172A] font-extrabold text-xs shadow-md transition-all"
                >
                  Save Platform Settings
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
