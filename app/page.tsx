'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { WhisperVoiceModal } from '@/components/voice/WhisperVoiceModal';
import { VoiceAssistantWidget } from '@/components/voice/VoiceAssistantWidget';
import { 
  Compass, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  ArrowRight, 
  Shield, 
  CheckCircle2, 
  Sparkles, 
  Users, 
  Bus, 
  Lock,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [lang, setLang] = useState('en');
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#080c0a] text-gray-100">
      <Navbar 
        currentLang={lang} 
        onLangChange={setLang} 
        onOpenVoiceAssistant={() => setShowVoiceAssistant(true)} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto pt-6">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Prayanam
          </h1>
          <p className="text-xl sm:text-2xl font-medium text-emerald-400">
            Travel planned. Disruptions handled. Decisions stay yours.
          </p>

          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            An agentic AI concierge for Indian intercity travel. Blends conversational understanding in
            English and Telugu with deterministic route planning, transparent resilience heuristics,
            and operator-coordinated rescue when delays occur.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/traveller"
              className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center space-x-2.5 transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] group"
            >
              <span>Launch Traveller Concierge</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/admin/bench"
              className="px-6 py-3.5 rounded-2xl bg-[#121f18] hover:bg-[#182c22] text-emerald-300 border border-[#223d2e] font-semibold text-sm flex items-center space-x-2 transition-all"
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>View RecoveryBench (100% Pass)</span>
            </Link>
          </div>
        </div>

        {/* 3 Core Differentiators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Differentiator 1 */}
          <div className="glass-panel p-6 rounded-2xl border border-[#1b2e23] hover:border-emerald-600/50 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Prayanam Resilience Passport</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Before booking, inspect your itinerary’s disruption tolerance. Validates highway delays,
              transfer buffer slack, and identified backup services using honest heuristics rather than
              fabricated probability numbers.
            </p>
            <div className="pt-2 text-xs text-emerald-400 font-mono flex items-center gap-1">
              <span>Transparent Heuristic Index</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Differentiator 2 */}
          <div className="glass-panel p-6 rounded-2xl border border-[#1b2e23] hover:border-emerald-600/50 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Journey Rescue Network</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              When a bus is cancelled, coordinates replacement capacity between travellers and
              operators. Uses transactional seat holds to prevent double-booking, and requires operator
              authorization + traveller consent.
            </p>
            <div className="pt-2 text-xs text-emerald-400 font-mono flex items-center gap-1">
              <span>Operator & Traveller Coordinated</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Differentiator 3 */}
          <div className="glass-panel p-6 rounded-2xl border border-[#1b2e23] hover:border-emerald-600/50 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center">
              <Bus className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Smart Missed-Bus Reboarding</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Missed your bus at the terminal? The agent detects absent boarding records, scans future
              departures from your current location, places a seat hold, and issues a revised simulated
              boarding pass upon your approval.
            </p>
            <div className="pt-2 text-xs text-emerald-400 font-mono flex items-center gap-1">
              <span>Current-State Re-planning</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* 5-Pipeline Operating Flow Banner */}
        <div className="glass-panel p-8 rounded-3xl border border-[#1b2e23] space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-white">The Trusted Travel Pipeline</h2>
            <p className="text-xs text-gray-400">
              AI parses and explains; deterministic algorithms plan and validate; decisions stay strictly yours.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="bg-[#0b120e] p-4 rounded-xl border border-[#182a20] space-y-1">
              <div className="text-emerald-400 font-mono text-xs font-bold">01. UNDERSTAND</div>
              <div className="text-[11px] text-gray-300">English / Telugu extraction</div>
            </div>
            <div className="bg-[#0b120e] p-4 rounded-xl border border-[#182a20] space-y-1">
              <div className="text-emerald-400 font-mono text-xs font-bold">02. VALIDATE</div>
              <div className="text-[11px] text-gray-300">Interactive constraint edits</div>
            </div>
            <div className="bg-[#0b120e] p-4 rounded-xl border border-[#182a20] space-y-1">
              <div className="text-emerald-400 font-mono text-xs font-bold">03. PLAN & COMPARE</div>
              <div className="text-[11px] text-gray-300">Multi-leg graph search</div>
            </div>
            <div className="bg-[#0b120e] p-4 rounded-xl border border-[#182a20] space-y-1">
              <div className="text-emerald-400 font-mono text-xs font-bold">04. EXPLICIT CONSENT</div>
              <div className="text-[11px] text-gray-300">Strict booking approval gate</div>
            </div>
            <div className="bg-[#0b120e] p-4 rounded-xl border border-[#182a20] space-y-1 col-span-2 sm:col-span-1">
              <div className="text-emerald-400 font-mono text-xs font-bold">05. RECOVER</div>
              <div className="text-[11px] text-gray-300">Current-state replanning</div>
            </div>
          </div>
        </div>

        {/* Quick Links to Workbenches */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <Link
            href="/operator"
            className="p-4 rounded-xl bg-[#0d1612] hover:bg-[#13221b] border border-[#1b2e23] flex items-center justify-between transition-all"
          >
            <div>
              <span className="font-semibold text-gray-200 block">Operator Workbench</span>
              <span className="text-gray-400 text-[11px]">Fleet capacity & hold authorization</span>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </Link>

          <Link
            href="/admin/simulator"
            className="p-4 rounded-xl bg-[#0d1612] hover:bg-[#13221b] border border-[#1b2e23] flex items-center justify-between transition-all"
          >
            <div>
              <span className="font-semibold text-gray-200 block">Disruption Simulator</span>
              <span className="text-gray-400 text-[11px]">Inject 90m delay, cancel, or 12 pax test</span>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </Link>

          <Link
            href="/admin/bench"
            className="p-4 rounded-xl bg-[#0d1612] hover:bg-[#13221b] border border-[#1b2e23] flex items-center justify-between transition-all"
          >
            <div>
              <span className="font-semibold text-gray-200 block">RecoveryBench Suite</span>
              <span className="text-gray-400 text-[11px]">Automated tests & measured evidence</span>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1b2e23] py-6 text-center text-xs text-gray-500 font-mono">
        <div>Prayanam · Autonomous Multi-Modal Transit & Resilience Engine</div>
        <div className="text-[11px] text-gray-600 mt-1">
          Simulated transport timetables, inventory, and boarding passes. Not connected to real financial credentials.
        </div>
      </footer>

      {/* Floating Two-Way Voice Assistant Widget */}
      <VoiceAssistantWidget
        onClick={() => setShowVoiceAssistant(true)}
        currentLangCode={lang}
      />

      {/* Multilingual Whisper Speech-Recognition & Travel Intent Pipeline */}
      <WhisperVoiceModal
        isOpen={showVoiceAssistant}
        onClose={() => setShowVoiceAssistant(false)}
        currentLangCode={lang}
        onParsedTrip={() => {
          setShowVoiceAssistant(false);
          router.push('/traveller');
        }}
        onTriggerManualBooking={() => {
          setShowVoiceAssistant(false);
          router.push('/traveller');
        }}
      />
    </div>
  );
}
