'use client';

import React from 'react';
import { X, FileText, CheckCircle2, XCircle, Info } from 'lucide-react';
import { DecisionEvidence } from '@/lib/domain/types';

interface DecisionEvidenceModalProps {
  evidence: DecisionEvidence | null;
  onClose: () => void;
}

export function DecisionEvidenceModal({ evidence, onClose }: DecisionEvidenceModalProps) {
  if (!evidence) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-panel-glow max-w-2xl w-full p-6 rounded-2xl border border-emerald-500/40 text-left space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#1b2e23] pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Decision Evidence Panel
              </h3>
              <p className="text-xs text-gray-400">
                Factual deterministic criteria evaluated. Zero hidden LLM speculation.
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

        {/* Hard Constraints Checklist */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Hard Validation Invariants Checked
          </h4>
          <div className="space-y-2">
            {evidence.hardChecks.map((hc, i) => (
              <div
                key={i}
                className="bg-[#0b120e] p-3 rounded-xl border border-[#1a2d22] flex items-start space-x-3 text-xs"
              >
                {hc.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <div className="font-semibold text-gray-200">{hc.name}</div>
                  <div className="text-[11px] text-gray-400">{hc.details}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alternatives Rejected */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Alternatives Ruled Out During Graph Search
            </h4>
            <span className="text-xs text-gray-500 font-mono">
              Evaluated {evidence.alternativesEvaluated} options
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {evidence.alternativesRejected.map((alt, i) => (
              <div
                key={i}
                className="bg-[#0b120e] p-2.5 rounded-lg border border-[#1b2e23] flex items-start space-x-2.5 text-xs"
              >
                <XCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-gray-300">{alt.routeSummary}</span>
                  <p className="text-[11px] text-gray-400">{alt.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all"
          >
            Close Evidence
          </button>
        </div>
      </div>
    </div>
  );
}
