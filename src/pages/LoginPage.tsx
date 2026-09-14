import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, AlertCircle, Database, CheckCircle2, Settings, Mail, Lock } from 'lucide-react';
import { SupabaseConfigModal } from '../components/common/SupabaseConfigModal';

interface LoginPageProps {
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, isSupabase } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please provide your email address.');
      return;
    }
    if (!password) {
      setError('Please provide your password.');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoUser = () => {
    setEmail('user@swiftearn.demo');
    setPassword('UserPassword123!');
    setError('');
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@swiftearn.demo');
    setPassword('AdminPassword123!');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <button
          onClick={() => onNavigate('landing')}
          className="text-xs font-bold text-zinc-500 hover:text-[#6C2BD9] mb-4 inline-flex items-center gap-1 transition-colors cursor-pointer"
        >
          ← Back to Home
        </button>

        {/* Brand Display */}
        <span className="text-3xl font-extrabold text-[#6C2BD9] tracking-tight block">
          Swift Earn
        </span>
        <h2 className="mt-3 text-2xl font-extrabold text-zinc-900 tracking-tight">
          Welcome Back
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Sign in to access your confirmed rewards and available balance
        </p>

        {/* Supabase Connection Status Pill */}
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => setConfigModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-zinc-200 shadow-2xs hover:border-[#6C2BD9]/40 transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-[#6C2BD9]" />
            {isSupabase ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Supabase Connected
              </span>
            ) : (
              <span className="text-zinc-600">
                Auth: <strong className="text-[#6C2BD9]">Supabase Ready</strong>
              </span>
            )}
            <Settings className="w-3 h-3 text-zinc-400 ml-0.5" />
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-sm border border-zinc-200">
          {error && (
            <div className="mb-5 bg-purple-50 border border-purple-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-zinc-900">
              <AlertCircle className="w-4 h-4 text-[#6C2BD9] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:border-[#6C2BD9] focus:ring-2 focus:ring-[#6C2BD9]/20 text-sm"
                />
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Password
                </label>
                <button
                  type="button"
                  id="btn-forgot-password"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-xs font-semibold text-[#6C2BD9] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-300 focus:outline-hidden focus:border-[#6C2BD9] focus:ring-2 focus:ring-[#6C2BD9]/20 text-sm"
                />
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="pt-2">
              <button
                id="btn-login-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#6C2BD9] hover:bg-[#5821B0] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Log In</span>
                    <ArrowRight className="w-4 h-4 text-[#B8F500]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Pre-fills when not yet connected to custom Supabase */}
          {!isSupabase && (
            <div className="mt-6 pt-5 border-t border-zinc-100 space-y-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block text-center">
                Quick 1-Click Demo Fill:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-demo-fill-user"
                  type="button"
                  onClick={handleFillDemoUser}
                  className="px-2.5 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold text-center transition-colors cursor-pointer"
                >
                  User: Alex
                </button>
                <button
                  id="btn-demo-fill-admin"
                  type="button"
                  onClick={handleFillDemoAdmin}
                  className="px-2.5 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#6C2BD9] text-xs font-semibold text-center transition-colors cursor-pointer"
                >
                  Admin Account
                </button>
              </div>
            </div>
          )}

          {/* Switch to sign up */}
          <div className="mt-6 text-center pt-4 border-t border-zinc-100">
            <span className="text-xs text-zinc-600">Don't have an account? </span>
            <button
              id="link-to-signup"
              onClick={() => onNavigate('signup')}
              className="text-xs font-bold text-[#6C2BD9] hover:underline cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* Supabase Config Modal */}
      <SupabaseConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
      />
    </div>
  );
};
