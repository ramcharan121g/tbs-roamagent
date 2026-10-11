'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Compass, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  RotateCcw, 
  Clock, 
  Languages,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';
import { enTranslations } from '@/lib/i18n/en';
import { teTranslations } from '@/lib/i18n/te';
import { INDIAN_LANGUAGES, getLanguageByCode } from '@/lib/i18n/languages';
import { Mic, Globe } from 'lucide-react';

interface NavbarProps {
  currentLang?: string;
  onLangChange?: (lang: string) => void;
  onOpenVoiceAssistant?: () => void;
}

export function Navbar({ currentLang = 'en', onLangChange, onOpenVoiceAssistant }: NavbarProps) {
  const pathname = usePathname();
  const [lang, setLang] = useState<string>(currentLang);
  const [clock, setClock] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);

  const activeLang = getLanguageByCode(lang);
  const t = lang === 'te' ? teTranslations : enTranslations;

  const handleLanguageToggle = (newLang: string) => {
    setLang(newLang);
    if (onLangChange) onLangChange(newLang);
    localStorage.setItem('prayanam_lang', newLang);
    setShowLangModal(false);
  };

  // Live accurate clock in Indian Standard Time (IST / UTC+5:30)
  useEffect(() => {
    const formatAccurateIST = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).toUpperCase();
      const dateStr = now.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
      });
      return `${dateStr}, ${timeStr} IST`;
    };

    setClock(formatAccurateIST());
    const timer = setInterval(() => {
      setClock(formatAccurateIST());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('prayanam_lang') as 'en' | 'te';
    if (saved) {
      setLang(saved);
      if (onLangChange) onLangChange(saved);
    }
  }, [onLangChange]);

  const handleReset = async () => {
    setResetting(true);
    try {
      await fetch('/api/disruptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET' }),
      });
      setShowResetConfirm(false);
      window.location.reload();
    } finally {
      setResetting(false);
    }
  };

  const navLinks = [
    { href: '/traveller', label: t.navTraveller, icon: Compass },
    { href: '/operator', label: t.navOperator, icon: ShieldCheck },
    { href: '/admin/simulator', label: t.navSimulator, icon: Zap },
    { href: '/admin/bench', label: t.navBench, icon: BarChart3 },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-[#1b2e23] bg-[#090d0b]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <Compass className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                  Prayanam
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Agentic AI
                  </span>
                </span>
              </div>
            </Link>

            {/* Persistent Pill - Demo Mode / Simulated Data */}
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-950/60 border border-emerald-700/50 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{t.demoPill}</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-2 transition-all ${
                    isActive
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#121c16]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions & Language Toggle */}
          <div className="flex items-center space-x-2.5">
            {/* Live Accurate IST / ISD Clock Badge */}
            <div 
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#0f1713] border border-[#1b2e23] text-gray-300 text-xs font-mono shadow-[0_0_12px_rgba(16,185,129,0.08)]"
              title="Accurate Indian Standard Time (IST / ISD · UTC+5:30)"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{clock || 'Syncing IST...'}</span>
            </div>

            {/* Voice Assistant Button */}
            {onOpenVoiceAssistant && (
              <button
                onClick={onOpenVoiceAssistant}
                className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-950/70 border border-emerald-600/70 text-emerald-300 text-xs font-medium hover:bg-emerald-900 transition-all shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                title="Launch Voice Assistant (22 Indian Languages)"
              >
                <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Voice AI</span>
              </button>
            )}

            {/* 22 Indian Languages Selector */}
            <button
              onClick={() => setShowLangModal(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#0f1713] border border-[#1b2e23] hover:border-emerald-600/60 text-emerald-300 text-xs font-mono transition-all"
              title="Select from 22 Official Scheduled Indian Languages"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{activeLang.nativeName}</span>
              <span className="text-[10px] text-gray-400">({activeLang.code.toUpperCase()})</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={() => setShowResetConfirm(true)}
              title={t.navClearData}
              className="p-1.5 rounded-md text-gray-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-gray-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#1b2e23] bg-[#090d0b] px-4 pt-2 pb-4 space-y-2">
            <div className="flex items-center space-x-2 px-3 py-2 text-xs font-mono text-emerald-300 bg-[#0f1713] rounded-lg border border-[#1b2e23]">
              <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>IST: {clock || 'Syncing IST...'}</span>
            </div>
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2.5 ${
                    isActive
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                      : 'text-gray-300 hover:bg-[#121c16]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel-glow max-w-md w-full p-6 rounded-xl text-left space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-semibold text-lg text-white">Reset Demo Environment?</h3>
            </div>
            <p className="text-sm text-gray-300">
              This will restore all simulated service timetables, seat inventories, temporary holds,
              and passenger bookings back to their initial deterministic seed state.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#1b2e23]"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-rose-600 hover:bg-rose-500 text-white transition-all"
              >
                {resetting ? 'Resetting...' : 'Yes, Restore Seed State'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 22 Indian Languages Selection Modal */}
      {showLangModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="glass-panel-glow max-w-2xl w-full p-6 rounded-2xl text-left space-y-4 max-h-[90vh] overflow-y-auto border border-emerald-500/40">
            <div className="flex items-center justify-between border-b border-[#1b2e23] pb-3">
              <div className="flex items-center space-x-2.5 text-emerald-400">
                <Globe className="w-5 h-5" />
                <h3 className="font-bold text-lg text-white">Select Language (22 Scheduled Indian Languages)</h3>
              </div>
              <button
                onClick={() => setShowLangModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#121c16]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              India is a multilingual nation. Prayanam provides two-way voice assistance and interface translation across all 22 official scheduled languages.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 max-h-[60vh] overflow-y-auto pr-1">
              {INDIAN_LANGUAGES.map((l) => {
                const isSelected = lang === l.code;
                return (
                  <button
                    key={l.code}
                    onClick={() => handleLanguageToggle(l.code)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-950/80 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : 'bg-[#0d1712] border-[#1b2e23] hover:border-emerald-700/60'
                    }`}
                  >
                    <div className="font-bold text-sm text-white">{l.nativeName}</div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">
                      {l.name} <span className="text-[10px] text-emerald-400/80">({l.region})</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#1b2e23]">
              <button
                onClick={() => setShowLangModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-gray-300 hover:bg-[#121c16]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
