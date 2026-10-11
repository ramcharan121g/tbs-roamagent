'use client';

import React from 'react';
import { X, ShieldCheck, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { ResiliencePassport } from '@/lib/domain/types';

interface ResiliencePassportModalProps {
  passport: ResiliencePassport | null;
  onClose: () => void;
}

export function ResiliencePassportModal({ passport, onClose }: ResiliencePassportModalProps) {
  if (!passport) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-panel-glow max-w-2xl w-full p-6 rounded-2xl border border-emerald-500/40 text-left space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#1b2e23] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Resilience Passport
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 font-mono border border-emerald-700">
                  Rating: {passport.heuristicScore}
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Transparent heuristic evaluation of disruption tolerance and backup feasibility.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1b2e23] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scenarios Covered Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Simulated Disruption Scenarios Evaluated
          </h4>
          <div className="space-y-2">
            {passport.scenariosCovered.map((sc, i) => (
              <div
                key={i}
                className="bg-[#0b120e] p-3 rounded-xl border border-[#1a2d22] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-1">
                  <div className="font-semibold text-gray-200 flex items-center gap-1.5">
                    {sc.viable ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    <span>{sc.scenario}</span>
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Backups identified: {sc.availableBackups} · Extra cost:{' '}
                    {sc.estimatedExtraFareInr > 0 ? `+₹${sc.estimatedExtraFareInr}` : '₹0'}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`font-mono font-semibold px-2 py-0.5 rounded text-[11px] ${
                      sc.revisedArrivalBufferMinutes >= 0
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {sc.revisedArrivalBufferMinutes >= 0
                      ? `+${sc.revisedArrivalBufferMinutes}m buffer remains`
                      : `${Math.abs(sc.revisedArrivalBufferMinutes)}m deadline breach`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Identified Vulnerabilities */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Identified Vulnerabilities & Limitations
          </h4>
          <ul className="space-y-1.5 text-xs text-amber-300/90 bg-amber-950/20 border border-amber-900/40 p-3 rounded-xl">
            {passport.vulnerabilities.map((v, i) => (
              <li key={i} className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Simulation Assumptions & Heuristic Note */}
        <div className="bg-[#0b120e] p-3 rounded-xl border border-[#1b2e23] space-y-2 text-xs text-gray-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <Info className="w-3.5 h-3.5" />
            <span>Data Freshness & Transparency Notice</span>
          </div>
          <p className="text-[11px]">
            This score is a transparent heuristic derived from bounded graph search over simulated
            timetables. It does not fabricate live GPS feeds, statistical probability guarantees, or
            unverified real-world operator capacity.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all"
          >
            Close Passport
          </button>
        </div>
      </div>
    </div>
  );
}
