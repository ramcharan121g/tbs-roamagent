'use client';

import React from 'react';
import { Mic, Sparkles } from 'lucide-react';
import { getLanguageByCode } from '@/lib/i18n/languages';

interface VoiceAssistantWidgetProps {
  onClick: () => void;
  currentLangCode: string;
}

export function VoiceAssistantWidget({ onClick, currentLangCode }: VoiceAssistantWidgetProps) {
  const langInfo = getLanguageByCode(currentLangCode);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center space-x-2">
      <button
        onClick={onClick}
        className="group relative flex items-center space-x-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-[0_0_30px_rgba(16,185,129,0.45)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] border border-emerald-400/40 hover:scale-105 active:scale-95"
        title="Open Two-Way Voice Assistant (Supports 22 Official Indian Languages)"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-200" />
        </span>

        <Mic className="w-4 h-4 text-white group-hover:animate-bounce" />
        <span className="font-bold tracking-wide">
          {langInfo.ui.voiceAssistant}
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 hidden sm:inline-block">
          22 Languages
        </span>
      </button>
    </div>
  );
}
