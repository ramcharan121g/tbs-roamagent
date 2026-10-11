'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  Compass, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Users, 
  Bus, 
  Clock, 
  IndianRupee,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';

interface StepInfo {
  step: string;
  title: string;
  tag: string;
  badgeColor: string;
  desc: string;
  tech: string;
  invariant: string;
}

export function LifecycleFlowDiagram() {
  const [selectedStep, setSelectedStep] = useState<string | null>('01');

  const stepsData: Record<string, StepInfo> = {
    '01': {
      step: '01',
      title: 'Traveller Input',
      tag: 'Trip Intake',
      badgeColor: 'emerald',
      desc: 'Traveller speaks or types goals in English or Telugu (origin, destination, arrival deadline, budget, seat class, luggage).',
      tech: 'Browser Speech API / Whisper Audio Pipeline / Blank Station Search',
      invariant: 'Section 1 (Reactions 1–7): Full constraint validation; no silent dropping of arrival deadlines.',
    },
    '02': {
      step: '02',
      title: 'Llama AI Agent',
      tag: 'Extract + Validate',
      badgeColor: 'emerald',
      desc: 'Extracts structured constraints into strict Zod schema with instant fallback to deterministic normalization.',
      tech: 'Groq openai/gpt-oss-20b + Deterministic Demo Parser',
      invariant: 'Section 7 (Reactions 37–42): Deterministic fallback activates if AI is offline, rate-limited, or invalid.',
    },
    '03': {
      step: '03',
      title: 'Route Engine',
      tag: 'Feasibility Checks',
      badgeColor: 'emerald',
      desc: 'Deterministic multi-leg graph search evaluating APSRTC timetables, transfer buffer slack, and maximum budgets.',
      tech: 'Dijkstra Multi-Hop Router + Decision Evidence Engine',
      invariant: 'Section 2 (Reactions 8–13): 0 over-budget or late itineraries in feasible set; factual rejection reasons.',
    },
    '04': {
      step: '04',
      title: 'Explicit Consent',
      tag: 'Booking Gate',
      badgeColor: 'emerald',
      desc: 'Direct or AI-selected itineraries enter mandatory human review mode. Booking occurs ONLY after explicit confirmation.',
      tech: 'Human Booking Approval & Atomic Inventory Lock',
      invariant: 'Section 3 & 8 (Reactions 14–17, 43): Zero auto-booking without traveller consent; zero real financial credentials.',
    },
    '05': {
      step: '05',
      title: 'Disruption Event',
      tag: 'Delay / Missed Bus',
      badgeColor: 'amber',
      desc: 'Highway incidents occur in simulation: 90-minute delay, bus cancellation, or missed passenger boarding.',
      tech: 'Disruption Simulator & Event Broadcast',
      invariant: 'Section 4 (Reactions 18–23): Invalidation of dead legs; recalculation of revised arrival buffers.',
    },
    '06': {
      step: '06',
      title: 'Recovery Match',
      tag: 'Capacity + Constraints',
      badgeColor: 'amber',
      desc: 'Journey Rescue Network evaluates reachable future services against individual traveller deadlines and remaining seats.',
      tech: 'Rescue Optimizer & Deliberate Scarcity Engine',
      invariant: 'Section 6 (Reactions 31–36): Deliberate scarcity (11 seats for 12 passengers) truthfully reports unassigned passengers.',
    },
    '07': {
      step: '07',
      title: 'Operator Approval',
      tag: 'Seat Hold',
      badgeColor: 'emerald',
      desc: 'Operator workbench accepts rescue request, creating a 5-minute atomic inventory hold without auto-charging.',
      tech: 'Operator Workbench & Atomic Hold Controller',
      invariant: 'Section 5 (Reactions 24–30): Hold expiry auto-releases capacity; traveller consent confirms replacement under ₹0 cover.',
    },
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#1b2e23] space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#182a20] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs uppercase font-bold tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>End-to-End System Architecture</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Prayanam Complete Operating Flow
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            AI extracts and explains · Deterministic algorithms plan and validate · Decisions stay strictly human.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/traveller"
            className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <span>Test Planning (01-04)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/admin/simulator"
            className="px-3.5 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-600/60 text-amber-300 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <span>Test Disruption (05-07)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Track 1: Normal Travel & Booking Pipeline (01 -> 02 -> 03 -> 04) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            TRACK 1: NORMAL PLANNING & BOOKING PIPELINE
          </span>
          <span className="text-gray-500 text-[11px]">Strict Feasibility Gate</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Step 01 */}
          <button
            onClick={() => setSelectedStep('01')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedStep === '01'
                ? 'bg-emerald-950/70 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                : 'bg-[#0b1410] border-[#182a20] hover:border-emerald-700/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-emerald-400">01</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Intake
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">Traveller Input</h4>
            <p className="text-[11px] text-gray-400 mt-1">Budget / Deadline / Preferences</p>
          </button>

          {/* Step 02 */}
          <button
            onClick={() => setSelectedStep('02')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedStep === '02'
                ? 'bg-emerald-950/70 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                : 'bg-[#0b1410] border-[#182a20] hover:border-emerald-700/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-emerald-400">02</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Agentic NLP
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">Llama AI Agent</h4>
            <p className="text-[11px] text-gray-400 mt-1">Extract + Validate Constraints</p>
          </button>

          {/* Step 03 */}
          <button
            onClick={() => setSelectedStep('03')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedStep === '03'
                ? 'bg-emerald-950/70 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                : 'bg-[#0b1410] border-[#182a20] hover:border-emerald-700/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-emerald-400">03</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Deterministic
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">Route Engine</h4>
            <p className="text-[11px] text-gray-400 mt-1">Feasibility & Buffer Checks</p>
          </button>

          {/* Step 04 */}
          <button
            onClick={() => setSelectedStep('04')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedStep === '04'
                ? 'bg-emerald-950/70 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                : 'bg-[#0b1410] border-[#182a20] hover:border-emerald-700/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-emerald-400">04</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Human Consent
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">Explicit Approval</h4>
            <p className="text-[11px] text-gray-400 mt-1">Mandatory Consent & Pass Issued</p>
          </button>
        </div>
      </div>

      {/* Track 2: Disruption & Recovery Lifecycle (05 -> 06 -> 07 & Fallback) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-mono text-amber-400">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            TRACK 2: DISRUPTION & OPERATOR RECOVERY LIFECYCLE
          </span>
          <span className="text-gray-500 text-[11px]">Resilience Heuristics Active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Step 05 */}
          <button
            onClick={() => setSelectedStep('05')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedStep === '05'
                ? 'bg-amber-950/70 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                : 'bg-[#12100a] border-[#2b2214] hover:border-amber-700/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-amber-400">05</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                Incident
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">Disruption Event</h4>
            <p className="text-[11px] text-gray-400 mt-1">90m Highway Delay / Missed Bus</p>
          </button>

          {/* Step 06 */}
          <button
            onClick={() => setSelectedStep('06')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedStep === '06'
                ? 'bg-amber-950/70 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                : 'bg-[#12100a] border-[#2b2214] hover:border-amber-700/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-amber-400">06</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                Optimization
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">Recovery Match</h4>
            <p className="text-[11px] text-gray-400 mt-1">Capacity + Deadline Constraints</p>
          </button>

          {/* Step 07 */}
          <button
            onClick={() => setSelectedStep('07')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedStep === '07'
                ? 'bg-emerald-950/70 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                : 'bg-[#0b1410] border-[#182a20] hover:border-emerald-700/60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-emerald-400">07</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Authorization
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">Operator Approval</h4>
            <p className="text-[11px] text-gray-400 mt-1">Atomic Seat Hold Created</p>
          </button>
        </div>

        {/* Fallback & Invariant Branch Banner */}
        <div className="p-4 rounded-2xl bg-[#0e120f] border border-[#223328] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>No eligible seat or missing approval?</span>
            </div>
            <p className="text-gray-400 text-[11px]">
              Truthfully reports unresolved passengers with factual reasons. Zero double-booking, automatic hold release after 5 minutes, and no fabricated recovery numbers.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800">
              ✓ Invariant Verified
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-rose-950 text-rose-300 border border-rose-800">
              Zero Fake Seats
            </span>
          </div>
        </div>
      </div>

      {/* Selected Step Deep Dive Details */}
      {selectedStep && stepsData[selectedStep] && (
        <div className="p-5 rounded-2xl bg-[#08100c] border border-emerald-500/40 space-y-3 animate-fade-in text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1b2e23] pb-2.5">
            <div className="flex items-center space-x-2.5">
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold">
                STEP {stepsData[selectedStep].step}
              </span>
              <span className="font-bold text-sm text-white">{stepsData[selectedStep].title}</span>
              <span className="text-gray-400 font-mono">({stepsData[selectedStep].tag})</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">
              Underlying Engine: {stepsData[selectedStep].tech}
            </span>
          </div>

          <p className="text-gray-300 leading-relaxed">
            {stepsData[selectedStep].desc}
          </p>

          <div className="bg-[#0e1713] p-3 rounded-xl border border-[#1b2e23] flex items-start gap-2 text-[11px] text-gray-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Authoritative Domain Invariant: </span>
              <span>{stepsData[selectedStep].invariant}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
