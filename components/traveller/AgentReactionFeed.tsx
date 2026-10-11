'use client';

import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Clock, 
  ArrowRight,
  Compass,
  Bus,
  RefreshCw
} from 'lucide-react';

export interface AgentReactionState {
  reactionId: string; // e.g. "Reaction 1", "Reaction 2", "Reaction 8", "Reaction 15", "Reaction 18", etc.
  title: string;
  message: string;
  whatHappensNext: string;
  currentStep: 'Understand' | 'Validate' | 'Act' | 'Respond';
  statusType: 'info' | 'success' | 'warning' | 'alert';
}

interface AgentReactionFeedProps {
  reaction: AgentReactionState;
  onOpenManualBooking: () => void;
  onSelectSamplePrompt: (prompt: string) => void;
  onTriggerDisruption?: (type: 'DELAY_90' | 'CANCEL_BUS') => void;
  lang: string;
}

export function AgentReactionFeed({
  reaction,
  onOpenManualBooking,
  onSelectSamplePrompt,
  onTriggerDisruption,
  lang,
}: AgentReactionFeedProps) {
  const steps: ('Understand' | 'Validate' | 'Act' | 'Respond')[] = [
    'Understand',
    'Validate',
    'Act',
    'Respond',
  ];

  return (
    <div className="glass-panel-glow border-emerald-500/40 p-5 rounded-2xl bg-[#09120d]/80 space-y-4 transition-all">
      {/* Top Banner & 4-Pillar Pipeline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1b2e23] pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-white">{reaction.title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                {reaction.reactionId}
              </span>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              RoamAgent Contract: Deterministic Verification Active
            </span>
          </div>
        </div>

        {/* 4 Steps Indicator */}
        <div className="flex items-center space-x-1 sm:space-x-2 text-[10px] font-mono">
          {steps.map((step, idx) => {
            const isCurrent = reaction.currentStep === step;
            return (
              <React.Fragment key={step}>
                <span
                  className={`px-2 py-0.5 rounded-full ${
                    isCurrent
                      ? 'bg-emerald-500 text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                      : 'bg-[#121c16] text-gray-400 border border-[#1e3025]'
                  }`}
                >
                  {idx + 1}. {step}
                </span>
                {idx < steps.length - 1 && <span className="text-gray-600">➔</span>}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Agent Response Message */}
      <div className="p-4 rounded-xl bg-[#0b140f] border border-[#1b2e23] space-y-2">
        <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-sans whitespace-pre-line">
          {reaction.message}
        </p>
      </div>

      {/* What Happens Next Explanation Card */}
      <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-start space-x-3 text-xs">
        <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-emerald-300 font-mono text-[11px] uppercase tracking-wider block">
            What Happens Next:
          </span>
          <p className="text-gray-300 text-xs leading-relaxed">{reaction.whatHappensNext}</p>
        </div>
      </div>

      {/* Quick Action Badges */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] text-gray-400 font-mono mr-1">Quick Actions:</span>

        {/* Manual Booking Button */}
        <button
          onClick={onOpenManualBooking}
          className="px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/70 text-xs font-semibold font-mono flex items-center space-x-1.5 transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)]"
        >
          <Bus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Manual Direct Booking</span>
        </button>

        {/* Tourist Samples */}
        <button
          onClick={() =>
            onSelectSamplePrompt(
              'Vizag to Araku Valley, reach by 11 AM, super luxury bus, with luggage'
            )
          }
          className="px-2.5 py-1.5 rounded-lg bg-[#121c16] hover:bg-[#1a2c22] text-gray-300 border border-[#203629] text-xs font-mono transition-all"
        >
          Sample: Araku Valley
        </button>

        <button
          onClick={() =>
            onSelectSamplePrompt(
              'Kadapa to Gandikota, departure morning, low budget, 1 passenger'
            )
          }
          className="px-2.5 py-1.5 rounded-lg bg-[#121c16] hover:bg-[#1a2c22] text-gray-300 border border-[#203629] text-xs font-mono transition-all"
        >
          Sample: Gandikota Fort
        </button>

        <button
          onClick={() =>
            onSelectSamplePrompt(
              'Tirupati to Tirumala, reach by 8 AM, express bus, 2 passengers'
            )
          }
          className="px-2.5 py-1.5 rounded-lg bg-[#121c16] hover:bg-[#1a2c22] text-gray-300 border border-[#203629] text-xs font-mono transition-all"
        >
          Sample: Tirumala Temple
        </button>

        {onTriggerDisruption && (
          <>
            <button
              onClick={() => onTriggerDisruption('DELAY_90')}
              className="px-2.5 py-1.5 rounded-lg bg-amber-950/50 hover:bg-amber-900 text-amber-300 border border-amber-800/80 text-xs font-mono transition-all"
            >
              Test: +90m Delay
            </button>
            <button
              onClick={() => onTriggerDisruption('CANCEL_BUS')}
              className="px-2.5 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-300 border border-rose-800/80 text-xs font-mono transition-all"
            >
              Test: Bus Cancelled
            </button>
          </>
        )}
      </div>
    </div>
  );
}
