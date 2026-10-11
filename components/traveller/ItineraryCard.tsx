'use client';

import React from 'react';
import { 
  Bus, 
  Car, 
  ArrowRight, 
  ShieldAlert, 
  ShieldCheck, 
  FileText, 
  Clock, 
  IndianRupee, 
  CheckCircle, 
  Check,
  ChevronRight
} from 'lucide-react';
import { Itinerary, ResiliencePassport, DecisionEvidence } from '@/lib/domain/types';
import { formatTimeOnly, formatDuration } from '@/lib/domain/time';
import { enTranslations } from '@/lib/i18n/en';
import { teTranslations } from '@/lib/i18n/te';

interface ItineraryCardProps {
  itinerary: Itinerary;
  resiliencePassport?: ResiliencePassport;
  decisionEvidence?: DecisionEvidence;
  onOpenPassport: (p: ResiliencePassport) => void;
  onOpenEvidence: (e: DecisionEvidence) => void;
  onSelectBooking: (it: Itinerary) => void;
  lang: string;
}

export function ItineraryCard({
  itinerary,
  resiliencePassport,
  decisionEvidence,
  onOpenPassport,
  onOpenEvidence,
  onSelectBooking,
  lang,
}: ItineraryCardProps) {
  const t = lang === 'te' ? teTranslations : enTranslations;

  const busLeg = itinerary.legs.find((l) => l.mode === 'bus');
  const lastMileLeg = itinerary.legs.find((l) => l.mode === 'cab' || l.mode === 'auto' || l.mode === 'metro');

  const resilienceBadgeColor =
    itinerary.heuristicResilience === 'Higher'
      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
      : itinerary.heuristicResilience === 'Moderate'
      ? 'bg-amber-950/80 text-amber-300 border-amber-600/50'
      : 'bg-rose-950/80 text-rose-300 border-rose-600/50';

  return (
    <div className="glass-panel hover:glass-panel-glow rounded-2xl p-5 border border-[#1b2e23] transition-all space-y-4">
      {/* Top Bar: Ranking Badge, Resilience Indicator, Total Fare */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1b2e23] pb-3">
        <div className="flex items-center space-x-2">
          {itinerary.badge && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-900/60 text-emerald-300 border border-emerald-600/50 uppercase tracking-wide">
              {itinerary.badge}
            </span>
          )}
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-mono border flex items-center gap-1 ${resilienceBadgeColor}`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>Resilience: {itinerary.heuristicResilience}</span>
          </span>
        </div>

        <div className="text-right">
          <div className="text-xl font-bold text-emerald-400 flex items-center justify-end">
            <IndianRupee className="w-4 h-4 mr-0.5" />
            <span>{itinerary.totalFareInr}</span>
          </div>
          <span className="text-[10px] text-gray-400 block">Complete Journey (All Legs)</span>
        </div>
      </div>

      {/* Multi-Leg Travel Timeline */}
      <div className="space-y-3">
        {/* Intercity Bus Leg */}
        {busLeg && (
          <div className="bg-[#0b120e] rounded-xl p-3 border border-[#182a20] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                <Bus className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-100">{busLeg.operatorName}</div>
                <div className="text-xs text-gray-400">
                  {busLeg.origin.name} ➔ {busLeg.destination.name}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono text-gray-200">
                {formatTimeOnly(busLeg.departureTime)} — {formatTimeOnly(busLeg.arrivalTime)}
              </div>
              <div className="text-[11px] text-emerald-400 font-mono">₹{busLeg.fareInr} · {busLeg.seatClass}</div>
            </div>
          </div>
        )}

        {/* Transfer wait indicator if 2 legs */}
        {itinerary.legs.length > 1 && (
          <div className="px-4 flex items-center space-x-2 text-[11px] text-amber-400 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Transfer buffer at interchange: {itinerary.transferTimeMinutes} mins</span>
          </div>
        )}

        {/* Last-Mile Leg */}
        {lastMileLeg && (
          <div className="bg-[#0b120e] rounded-xl p-3 border border-[#182a20] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-100">{lastMileLeg.operatorName}</div>
                <div className="text-xs text-gray-400">
                  {lastMileLeg.origin.name} ➔ {lastMileLeg.destination.name}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono text-gray-200">
                {formatTimeOnly(lastMileLeg.departureTime)} — {formatTimeOnly(lastMileLeg.arrivalTime)}
              </div>
              <div className="text-[11px] text-emerald-400 font-mono">₹{lastMileLeg.fareInr} (Last-mile ride)</div>
            </div>
          </div>
        )}
      </div>

      {/* Arrival & Deadline Buffer Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#0d1612] p-3 rounded-xl border border-[#1a2d22] text-xs">
        <div>
          <span className="text-gray-400 block text-[10px]">Final Destination Arrival</span>
          <span className="font-semibold text-gray-200 font-mono">
            {formatTimeOnly(itinerary.finalArrivalTime)}
          </span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px]">Deadline Safety Buffer</span>
          <span
            className={`font-semibold font-mono ${
              itinerary.deadlineBufferMinutes >= 45 ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            +{itinerary.deadlineBufferMinutes} mins safety
          </span>
        </div>
        <div>
          <span className="text-gray-400 block text-[10px]">Total Journey Time</span>
          <span className="font-semibold text-gray-200 font-mono">
            {formatDuration(itinerary.totalDurationMinutes)}
          </span>
        </div>
      </div>

      {/* Action Buttons: Resilience Passport, Decision Evidence, Book */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#1b2e23]">
        <div className="flex items-center space-x-2">
          {resiliencePassport && (
            <button
              onClick={() => onOpenPassport(resiliencePassport)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800 transition-all flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t.resiliencePassportBtn}</span>
            </button>
          )}

          {decisionEvidence && (
            <button
              onClick={() => onOpenEvidence(decisionEvidence)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white bg-[#14211a] hover:bg-[#1a2e24] border border-[#223d2e] transition-all flex items-center space-x-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t.evidenceBtn}</span>
            </button>
          )}
        </div>

        <button
          onClick={() => onSelectBooking(itinerary)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center space-x-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] ml-auto"
        >
          <span>{t.selectItineraryBtn}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
