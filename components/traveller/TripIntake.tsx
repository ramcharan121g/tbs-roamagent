'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Mic, MicOff, Send, HelpCircle, ArrowRight } from 'lucide-react';
import { enTranslations } from '@/lib/i18n/en';
import { teTranslations } from '@/lib/i18n/te';
import { TripConstraints } from '@/lib/domain/types';

import { getLanguageByCode } from '@/lib/i18n/languages';

interface TripIntakeProps {
  onParsed: (data: { constraints: TripConstraints }) => void;
  lang: string;
}

export function TripIntake({ onParsed, lang }: TripIntakeProps) {
  const langInfo = getLanguageByCode(lang);
  const t = lang === 'te' ? teTranslations : enTranslations;
  const [query, setQuery] = useState(langInfo.samplePrompt);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // Update prompt when language changes
  useEffect(() => {
    setQuery(langInfo.samplePrompt);
  }, [lang]);

  const [micLang, setMicLang] = useState(langInfo.speechCode);

  useEffect(() => {
    setMicLang(langInfo.speechCode);
  }, [langInfo.speechCode]);

  // Clean common Indian speech-to-text phonetic mishearings
  const sanitizeSpeechInput = (raw: string): string => {
    return raw
      .replace(/\bwhy\s*zag\b/gi, 'Vizag')
      .replace(/\bvizac\b/gi, 'Vizag')
      .replace(/\bvaizag\b/gi, 'Vizag')
      .replace(/\bbejawada\b/gi, 'Vijayawada')
      .replace(/\bbezawada\b/gi, 'Vijayawada')
      .replace(/\bvijay\s*wada\b/gi, 'Vijayawada')
      .replace(/\btripati\b/gi, 'Tirupati')
      .replace(/\btirupathi\b/gi, 'Tirupati')
      .replace(/\bthirumala\b/gi, 'Tirumala')
      .replace(/\btirumalla\b/gi, 'Tirumala')
      .replace(/\ba\s*raccoon\b/gi, 'Araku')
      .replace(/\baruk\b/gi, 'Araku')
      .replace(/\bgandi\s*kota\b/gi, 'Gandikota')
      .replace(/\bballoon\s*caves\b/gi, 'Belum caves')
      .replace(/\bbellam\s*caves\b/gi, 'Belum caves')
      .replace(/\blay\s*pakshi\b/gi, 'Lepakshi')
      .replace(/\brajamahendravaram\b/gi, 'Rajahmundry');
  };

  const handleVoiceInput = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceNotice(t.voiceUnsupported);
      setTimeout(() => setVoiceNotice(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = micLang;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setListening(true);
        setVoiceNotice(null);
      };

      let timer: NodeJS.Timeout | null = null;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let full = '';
        for (let i = 0; i < event.results.length; i++) {
          full += event.results[i][0].transcript + ' ';
        }
        const cleaned = sanitizeSpeechInput(full.trim());
        if (cleaned) {
          setQuery(cleaned);
        }

        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          try { recognition.stop(); } catch {}
          setListening(false);
        }, 2200);
      };

      recognition.onerror = () => {
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.start();
    } catch {
      setVoiceNotice('Voice permission denied or unsupported.');
      setListening(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/parse-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query, language: lang }),
      });
      const data = await res.json();
      if (data.success) {
        onParsed(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-[#1b2e23] space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            {t.intakeHeading}
          </h2>
          <p className="text-xs text-gray-400 mt-1">{t.intakeSubheading}</p>
        </div>

        {/* Quick Scenario Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-emerald-400" />
            {t.samplePromptLabel}
          </span>
          <button
            type="button"
            onClick={() => {
              setQuery(t.samplePrompt1);
            }}
            className="text-[11px] px-2.5 py-1 rounded bg-[#16241c] hover:bg-emerald-950 text-emerald-300 border border-[#223d2e] transition-all"
          >
            Vizag ➔ Hyd (Sleeper)
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery(t.samplePrompt2);
            }}
            className="text-[11px] px-2.5 py-1 rounded bg-[#16241c] hover:bg-emerald-950 text-emerald-300 border border-[#223d2e] transition-all"
          >
            వైజాగ్ ➔ హైదరాబాద్ (తెలుగు)
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery('Bus from Lambasingi to Rajahmundry via Narsipatnam, reach by 10 AM, budget 1000');
            }}
            className="text-[11px] px-2.5 py-1 rounded bg-[#16241c] hover:bg-emerald-950 text-cyan-300 border border-cyan-800/40 transition-all"
            title="Tests Live Web Scraper and multi-hop transit network"
          >
            🔍 Lambasingi ➔ Rajahmundry (via Narsipatnam)
          </button>
        </div>
      </div>

      {/* Scraper Intelligence Status Indicator */}
      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#0e1712] border border-[#1b2e23] text-[11px]">
        <div className="flex items-center gap-1.5 text-gray-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Location Intelligence Scraper Active: Type or speak any AP town, tourist spot, or via stop (e.g. Lambasingi, Narsipatnam, Srisailam, Horsley Hills).</span>
        </div>
        <span className="text-emerald-400 font-mono text-[10px] hidden sm:inline">OSM + APSRTC ₹0 Engine</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            placeholder={t.inputPlaceholder}
            className="w-full bg-[#0a0f0d] border border-[#1b2e23] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-3.5 text-sm text-gray-100 placeholder-gray-500 resize-none transition-all outline-none"
          />

          <div className="absolute right-3 bottom-3 flex items-center space-x-2">
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={handleVoiceInput}
              title={listening ? t.voiceStop : t.voiceStart}
              className={`p-2 rounded-lg border transition-all ${
                listening
                  ? 'bg-rose-950 text-rose-400 border-rose-700 animate-pulse'
                  : 'bg-[#121c16] text-gray-400 hover:text-emerald-400 border-[#1b2e23]'
              }`}
            >
              {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Parse Submit Button */}
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center space-x-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
            >
              <span>{loading ? t.parsingState : t.parseButton}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {voiceNotice && (
          <p className="text-xs text-amber-400 bg-amber-950/40 border border-amber-800/60 p-2 rounded-md">
            {voiceNotice}
          </p>
        )}
      </form>
    </div>
  );
}
