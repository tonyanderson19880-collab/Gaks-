import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Profile, Wallet } from '../types';
import { api, getToken, setToken, removeToken, getAdminToken, setAdminToken, removeAdminToken } from '../api';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  wallet: Wallet | null;
  unreadCount: number;
  admin: any | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (payload: any) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  adminLogin: (email: string, pass: string) => Promise<void>;
  adminLogout: () => void;
  switchDemoMode: (mode: 'guest' | 'user' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [admin, setAdmin] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUserData = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setProfile(null);
      setWallet(null);
      return;
    }
    try {
      const data = await api.getMe();
      setUser(data.user);
      setProfile(data.profile);
      setWallet(data.wallet);
      setUnreadCount(data.unreadNotificationsCount || 0);
    } catch {
      removeToken();
      setUser(null);
      setProfile(null);
      setWallet(null);
    }
  };

  const refreshAdminData = async () => {
    const adminToken = getAdminToken();
    if (!adminToken) {
      setAdmin(null);
      return;
    }
    try {
      const data = await api.getAdminMe();
      setAdmin(data.admin);
    } catch {
      removeAdminToken();
      setAdmin(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([refreshUserData(), refreshAdminData()]);
      setIsLoading(false);
    };
    init();
  }, []);

  const login = async (email: string, pass: string) => {
    const data = await api.login({ email, password: pass });
    setToken(data.token);
    setUser(data.user);
    setProfile(data.profile);
    setWallet(data.wallet);
    await refreshUserData();
  };

  const signup = async (payload: any) => {
    const data = await api.signup(payload);
    setToken(data.token);
    setUser(data.user);
    setProfile(data.profile);
    setWallet(data.wallet);
  };

  const logout = () => {
    removeToken();
    setUser(null);
    setProfile(null);
    setWallet(null);
    setUnreadCount(0);
  };

  const adminLogin = async (email: string, pass: string) => {
    const data = await api.adminLogin({ email, password: pass });
    setAdminToken(data.token);
    setAdmin(data.admin);
  };

  const adminLogout = () => {
    removeAdminToken();
    setAdmin(null);
  };

  const switchDemoMode = async (mode: 'guest' | 'user' | 'admin') => {
    if (mode === 'guest') {
      logout();
    } else if (mode === 'user') {
      await login('user@swiftearn.demo', 'UserPassword123!');
    } else if (mode === 'admin') {
      await adminLogin('admin@swiftearn.demo', 'AdminPassword123!');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        wallet,
        unreadCount,
        admin,
        isLoading,
        login,
        signup,
        logout,
        refreshUserData,
        adminLogin,
        adminLogout,
        switchDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
