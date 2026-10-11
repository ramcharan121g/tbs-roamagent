'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'traveller' | 'operator' | 'admin';
  avatarInitials: string;
  badge?: string;
  preferredLanguage?: string;
  joinedAt: string;
}

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'usr-rajesh-01',
    name: 'Rajesh Kumar',
    phone: '+91 98480 22334',
    email: 'rajesh.kumar@gmail.com',
    role: 'traveller',
    avatarInitials: 'RK',
    badge: 'Frequent Commuter',
    preferredLanguage: 'te',
    joinedAt: '2025-08-12',
  },
  {
    id: 'usr-sunita-02',
    name: 'Sunita Rao',
    phone: '+91 94401 55667',
    email: 'sunita.rao@outlook.com',
    role: 'traveller',
    avatarInitials: 'SR',
    badge: 'Senior Citizen Priority',
    preferredLanguage: 'te',
    joinedAt: '2025-11-04',
  },
  {
    id: 'usr-vikram-03',
    name: 'Vikram Varma',
    phone: '+91 91000 88991',
    email: 'vikram.varma@techcorp.in',
    role: 'traveller',
    avatarInitials: 'VV',
    badge: 'HITEC City Express',
    preferredLanguage: 'en',
    joinedAt: '2026-01-20',
  },
];

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (profile: UserProfile) => void;
  loginWithPhone: (phone: string, otp: string, name?: string) => Promise<boolean>;
  loginWithEmail: (email: string, pass: string, name?: string) => Promise<boolean>;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'prayanam_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Default to Rajesh Kumar as standard active session for seamless hackathon walkthrough
        setUser(DEMO_USERS[0]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_USERS[0]));
      }
    } catch {
      setUser(DEMO_USERS[0]);
    }
  }, []);

  const login = (profile: UserProfile) => {
    setUser(profile);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // storage unavailable
    }
    setIsAuthModalOpen(false);
  };

  const loginWithPhone = async (phone: string, otp: string, name = 'Traveller'): Promise<boolean> => {
    // Simulated instant OTP verification
    if (otp !== '123456' && otp.length < 4) {
      return false;
    }
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'TR';

    const newProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      name,
      phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@prayanam.in`,
      role: 'traveller',
      avatarInitials: initials,
      badge: 'Verified Mobile',
      preferredLanguage: 'en',
      joinedAt: new Date().toISOString().split('T')[0],
    };
    login(newProfile);
    return true;
  };

  const loginWithEmail = async (email: string, _pass: string, name = 'Traveller'): Promise<boolean> => {
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'TR';

    const newProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      name,
      phone: '+91 98765 43210',
      email,
      role: 'traveller',
      avatarInitials: initials,
      badge: 'Email Verified',
      preferredLanguage: 'en',
      joinedAt: new Date().toISOString().split('T')[0],
    };
    login(newProfile);
    return true;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: mounted ? user : null,
        isAuthenticated: mounted && !!user,
        login,
        loginWithPhone,
        loginWithEmail,
        logout,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
