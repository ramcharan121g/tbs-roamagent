'use client';

import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  LogOut, 
  Sparkles,
  Smartphone,
  Lock,
  KeyRound,
  UserCheck
} from 'lucide-react';
import { useAuth, DEMO_USERS, UserProfile } from '@/lib/auth/auth-context';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: string;
}

export function AuthModal({ isOpen, onClose, lang = 'en' }: AuthModalProps) {
  const { user, login, loginWithPhone, loginWithEmail, logout } = useAuth();
  const [tab, setTab] = useState<'demo' | 'phone' | 'email'>('demo');

  // Phone OTP state
  const [phone, setPhone] = useState('98480 22334');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [travellerName, setTravellerName] = useState('Rajesh Kumar');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Email state
  const [email, setEmail] = useState('traveller@prayanam.in');
  const [password, setPassword] = useState('••••••••');

  if (!isOpen) return null;

  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMsg('');
    setOtpSent(true);
    setOtp('123456'); // Simulated auto-delivered OTP for hackathon demo
  };

  const handleVerifyPhone = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const ok = await loginWithPhone(phone, otp, travellerName);
      if (ok) {
        onClose();
      } else {
        setErrorMsg('Invalid OTP. Use demo code: 123456');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginWithEmail(email, password, travellerName || 'Traveller');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const isTe = lang === 'te';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-lg bg-[#0a120e] border border-emerald-500/40 rounded-3xl p-6 sm:p-7 space-y-6 shadow-[0_0_50px_rgba(16,185,129,0.2)] text-left relative overflow-hidden"
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1b2e23] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{isTe ? 'ప్రయాణికుల సైన్ ఇన్' : 'Traveller Sign In'}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Prayanam ID
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                {isTe
                  ? 'మీ ప్రయాణ బుకింగ్‌లు, పాస్‌లు మరియు రీషెడ్యూల్స్ భద్రంగా నిర్వహించండి'
                  : 'Manage bookings, live boarding passes, and disruption recovery'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#15241b] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Session Card (If signed in) */}
        {user && (
          <div className="bg-[#0f1c15] border border-emerald-800/60 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold text-sm flex items-center justify-center border border-emerald-400">
                {user.avatarInitials}
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{user.name}</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded font-mono border border-emerald-700">
                    Active
                  </span>
                </div>
                <div className="text-xs text-gray-400 font-mono">{user.phone} · {user.email}</div>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center space-x-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isTe ? 'లాగౌట్' : 'Sign Out'}</span>
            </button>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-[#080e0b] p-1 border border-[#1b2e23]">
          <button
            onClick={() => setTab('demo')}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              tab === 'demo'
                ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isTe ? '1-క్లిక్ డెమో ప్రొఫైల్స్' : '1-Click Demo Profiles'}</span>
          </button>
          <button
            onClick={() => setTab('phone')}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              tab === 'phone'
                ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{isTe ? 'మొబైల్ OTP' : 'Mobile OTP'}</span>
          </button>
          <button
            onClick={() => setTab('email')}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              tab === 'email'
                ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{isTe ? 'ఈమెయిల్' : 'Email'}</span>
          </button>
        </div>

        {/* Tab 1: Instant Demo Profiles */}
        {tab === 'demo' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400">
              {isTe
                ? 'హ్యాకథాన్ టెస్టింగ్ కోసం ఒక క్లిక్‌తో ప్రొఫైల్ ఎంచుకోండి:'
                : 'Instant 1-click profiles pre-configured with real travel preferences & corridors:'}
            </p>
            <div className="space-y-2.5">
              {DEMO_USERS.map((u) => {
                const isCurrent = user?.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => login(u)}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all group ${
                      isCurrent
                        ? 'bg-emerald-950/70 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'bg-[#0f1713] border-[#1b2e23] hover:border-emerald-600/60 hover:bg-[#121f18]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-900 border border-emerald-500/50 flex items-center justify-center text-white font-bold text-xs">
                        {u.avatarInitials}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white flex items-center gap-2">
                          <span>{u.name}</span>
                          <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800">
                            {u.badge}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 font-mono">{u.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400">
                      {isCurrent ? (
                        <span className="flex items-center gap-1 text-emerald-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Selected</span>
                        </span>
                      ) : (
                        <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          <span>Switch</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Mobile OTP Login */}
        {tab === 'phone' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                {isTe ? 'ప్రయాణికుడి పూర్తి పేరు' : 'Traveller Full Name'}
              </label>
              <input
                type="text"
                value={travellerName}
                onChange={(e) => setTravellerName(e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                className="w-full bg-[#080d0a] border border-[#1b2e23] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                {isTe ? 'భారతీయ మొబైల్ నంబర్' : 'Indian Mobile Number'}
              </label>
              <div className="flex space-x-2">
                <span className="px-3.5 py-2.5 bg-[#0f1713] border border-[#1b2e23] rounded-xl text-sm font-mono text-gray-300 flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98480 22334"
                  className="flex-1 bg-[#080d0a] border border-[#1b2e23] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
                {!otpSent && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all whitespace-nowrap shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                  >
                    {isTe ? 'OTP పంపండి' : 'Send OTP'}
                  </button>
                )}
              </div>
            </div>

            {otpSent && (
              <div className="space-y-3 pt-1 animate-fade-in">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-gray-300">
                    {isTe ? '6-అంకెల OTP కోడ్' : '6-Digit OTP Code'}
                  </label>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    Demo OTP: 123456
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-[#080d0a] border border-emerald-500/70 rounded-xl px-3.5 py-2.5 text-center text-lg tracking-widest text-emerald-300 font-mono focus:outline-none focus:border-emerald-400"
                />

                <button
                  type="button"
                  onClick={handleVerifyPhone}
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Verifying...' : (isTe ? 'లాగిన్ పూర్తి చేయండి' : 'Verify & Continue')}</span>
                </button>
              </div>
            )}

            {errorMsg && (
              <p className="text-xs text-rose-400 font-mono">{errorMsg}</p>
            )}
          </div>
        )}

        {/* Tab 3: Email Login */}
        {tab === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                {isTe ? 'ఈమెయిల్ చిరునామా' : 'Email Address'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@prayanam.in"
                required
                className="w-full bg-[#080d0a] border border-[#1b2e23] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                {isTe ? 'పాస్‌వర్డ్' : 'Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#080d0a] border border-[#1b2e23] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center justify-center space-x-2"
            >
              <Mail className="w-4 h-4" />
              <span>{isTe ? 'ఈమెయిల్‌తో లాగిన్ అవ్వండి' : 'Sign In with Email'}</span>
            </button>
          </form>
        )}

        {/* Footer Note */}
        <div className="pt-2 border-t border-[#1b2e23] flex items-center justify-between text-[11px] text-gray-500 font-mono">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-end encrypted session</span>
          </span>
          <span className="text-emerald-400">Prayanam v1.0</span>
        </div>
      </div>
    </div>
  );
}
