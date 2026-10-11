'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Globe,
  Radio,
  ArrowRight,
  HelpCircle,
  RotateCcw,
  Compass
} from 'lucide-react';
import { INDIAN_LANGUAGES, getLanguageByCode } from '@/lib/i18n/languages';
import { TripConstraints } from '@/lib/domain/types';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  parsedSummary?: {
    origin: string;
    destination: string;
    deadline: string;
    budget: number;
    preferredClass: string;
  };
}

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLangCode: string;
  onLanguageChange: (code: string) => void;
  onParsedTrip?: (constraints: TripConstraints) => void;
  onTriggerManualBooking?: () => void;
}

export function VoiceAssistantModal({
  isOpen,
  onClose,
  currentLangCode,
  onLanguageChange,
  onParsedTrip,
  onTriggerManualBooking,
}: VoiceAssistantModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechMuted, setSpeechMuted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  
  // Interface / Voice language and separate mic speech recognition language
  const [selectedLangCode, setSelectedLangCode] = useState(currentLangCode);
  const [micSpeechLang, setMicSpeechLang] = useState(getLanguageByCode(currentLangCode).speechCode);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const langInfo = getLanguageByCode(selectedLangCode);

  // Sync mic language when page language changes
  useEffect(() => {
    setSelectedLangCode(currentLangCode);
    setMicSpeechLang(getLanguageByCode(currentLangCode).speechCode);
  }, [currentLangCode]);

  // Initialize or update greeting message when opening
  useEffect(() => {
    if (isOpen) {
      const greetingMsg: Message = {
        id: `greet-${Date.now()}`,
        sender: 'agent',
        text: `${langInfo.welcomeSpeech}\n\n(Supported: All 22 Scheduled Indian Languages + English. Speak clearly into the mic or type below.)`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([greetingMsg]);

      if (!speechMuted) {
        speakText(langInfo.welcomeSpeech, langInfo.speechCode);
      }
    } else {
      stopSpeaking();
      stopListening();
    }
  }, [isOpen, selectedLangCode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, transcript, isListening]);

  // Text to Speech
  const speakText = (text: string, locale: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || speechMuted) return;

    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_•\n]/g, ' ').substring(0, 300);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = locale;
      utterance.rate = 0.95;

      const voices = window.speechSynthesis.getVoices();
      const matchVoice = voices.find((v) => v.lang.toLowerCase().includes(locale.split('-')[0].toLowerCase()));
      if (matchVoice) {
        utterance.voice = matchVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

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

  // Continuous Speech to Text (Web Speech Recognition)
  const startListening = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceNotice('Speech recognition is not supported in this browser. Please use keyboard typing.');
      setTimeout(() => setVoiceNotice(null), 4000);
      return;
    }

    stopSpeaking();

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = micSpeechLang;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setVoiceNotice(null);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript + ' ';
        }

        const cleaned = sanitizeSpeechInput(fullTranscript.trim());
        setTranscript(cleaned);
        setInputText(cleaned);

        // Reset silence detection debounce
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        // After 2.5 seconds of user silence, automatically conclude recognition so user can review
        silenceTimerRef.current = setTimeout(() => {
          stopListening();
        }, 2500);
      };

      recognition.onerror = (e: { error: string }) => {
        console.warn('Speech recognition notice:', e.error);
        if (e.error === 'not-allowed') {
          setVoiceNotice('Microphone access blocked. Please allow mic permission in your browser URL bar.');
          setIsListening(false);
        } else if (e.error === 'no-speech') {
          // Normal silence, don't crash
        } else {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  // Process User Voice or Text Query
  const handleSendQuery = async (queryText: string) => {
    const raw = queryText.trim();
    if (!raw) return;

    const sanitized = sanitizeSpeechInput(raw);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: sanitized,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setTranscript('');
    stopListening();
    setProcessing(true);

    try {
      // Check for manual booking intent in query
      const lower = sanitized.toLowerCase();
      if (lower.includes('manual') || lower.includes('direct') || lower.includes('నేరుగా') || lower.includes('मैनुअल') || lower.includes('timetable')) {
        const agentResponse = `Opening manual direct booking console. You can inspect scheduled buses across Tirupati, Vizag, Vijayawada, Gandikota, and Rajahmundry corridors directly.`;
        setMessages((prev) => [
          ...prev,
          {
            id: `agent-${Date.now()}`,
            sender: 'agent',
            text: agentResponse,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        speakText(agentResponse, langInfo.speechCode);
        if (onTriggerManualBooking) onTriggerManualBooking();
        setProcessing(false);
        return;
      }

      // Parse with AI / Deterministic parser
      const res = await fetch('/api/parse-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sanitized, language: selectedLangCode }),
      });

      const data = await res.json();
      if (data.success && data.constraints) {
        const c: TripConstraints = data.constraints;

        let reply = '';
        if (selectedLangCode === 'te') {
          reply = `మీ ప్రయాణ వివరాలు నిర్ధారించబడ్డాయి: ${c.origin} నుండి ${c.destination}.\nగడువు: ఉదయం 9:00 AM | బడ్జెట్: ₹${c.budgetInr} | తరగతి: ${c.preferredClass.toUpperCase()}.\nనిర్ధారిత బస్సుల లభ్యత మరియు సీట్ల వివరాలను పరిశీలిస్తున్నాము.`;
        } else if (selectedLangCode === 'hi') {
          reply = `आपकी यात्रा समझी गई: ${c.origin} से ${c.destination}.\nसमय सीमा: 9:00 AM | बजट: ₹${c.budgetInr} | श्रेणी: ${c.preferredClass.toUpperCase()}.\nसीट उपलब्धता की जांच की जा रही है।`;
        } else if (selectedLangCode === 'ta') {
          reply = `உங்கள் பயணம் புரிந்தது: ${c.origin} முதல் ${c.destination}.\nநேரம்: 9:00 AM | கட்டணம்: ₹${c.budgetInr} | வகுப்பு: ${c.preferredClass.toUpperCase()}.\nபேருந்து இடங்கள் சரிபார்க்கப்படுகின்றன.`;
        } else {
          reply = `I understood your travel request: ${c.origin} ➔ ${c.destination}.\nArriving by 9:00 AM | Budget: ₹${c.budgetInr} | Class: ${c.preferredClass.toUpperCase()}.\nComputing feasible routes across our verified operator network.`;
        }

        const agentMsg: Message = {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          parsedSummary: {
            origin: c.origin,
            destination: c.destination,
            deadline: '09:00 AM',
            budget: c.budgetInr,
            preferredClass: c.preferredClass,
          },
        };

        setMessages((prev) => [...prev, agentMsg]);
        speakText(reply, langInfo.speechCode);

        if (onParsedTrip) {
          onParsedTrip(c);
        }
      } else {
        const fallback = `I could not clearly detect both your origin and destination from "${sanitized}".\n\nCould you tell me: Where do you want to travel from and to? (e.g. "Vizag to Araku" or "Tirupati to Tirumala")`;
        setMessages((prev) => [
          ...prev,
          {
            id: `agent-${Date.now()}`,
            sender: 'agent',
            text: fallback,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        speakText(fallback, langInfo.speechCode);
      }
    } catch {
      const errReply = `Unable to connect right now. Please type your travel query or open manual direct booking.`;
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          text: errReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="glass-panel-glow max-w-2xl w-full h-[92vh] max-h-[760px] flex flex-col rounded-3xl border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.2)] overflow-hidden bg-[#070e0a]">
        
        {/* Header with 22-Language Selector & Audio Controls */}
        <div className="p-4 border-b border-[#1b2e23] bg-[#0c1611]/90 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-500/60 flex items-center justify-center text-emerald-400 relative">
              <Sparkles className="w-5 h-5 animate-pulse" />
              {isSpeaking && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-base">Prayanam Voice AI Concierge</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  22 Languages
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">
                Real-Time Voice Assistant & Timetable Planner
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Audio Mute Toggle */}
            <button
              onClick={() => {
                if (!speechMuted) stopSpeaking();
                setSpeechMuted(!speechMuted);
              }}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#15231b] border border-transparent hover:border-[#22392c] transition-all"
              title={speechMuted ? 'Unmute Audio Voice' : 'Mute Audio Voice'}
            >
              {speechMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                stopSpeaking();
                stopListening();
                onClose();
              }}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#15231b] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Language Selection & Mic Accents Bar */}
        <div className="px-4 py-2.5 bg-[#09130e] border-b border-[#1b2e23] flex flex-wrap items-center justify-between gap-2">
          {/* Main App Language */}
          <div className="flex items-center space-x-1.5 text-xs text-gray-300 font-mono">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Language:</span>
            <select
              value={selectedLangCode}
              onChange={(e) => {
                const code = e.target.value;
                setSelectedLangCode(code);
                onLanguageChange(code);
                setMicSpeechLang(getLanguageByCode(code).speechCode);
              }}
              className="px-2 py-1 rounded-lg bg-[#0f1d15] border border-emerald-700/60 text-xs text-emerald-300 font-medium focus:outline-none focus:border-emerald-400"
            >
              {INDIAN_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-[#0b1410] text-gray-200">
                  {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Mic Language Switcher */}
          <div className="flex items-center space-x-1.5 text-xs text-gray-400">
            <span className="text-[11px] font-mono text-emerald-400">Mic Listening In:</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setMicSpeechLang('en-IN')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-all ${
                  micSpeechLang === 'en-IN'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-[#121c16] text-gray-400 hover:text-white'
                }`}
                title="Listen in Indian English (en-IN)"
              >
                English
              </button>
              <button
                onClick={() => setMicSpeechLang('te-IN')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-all ${
                  micSpeechLang === 'te-IN'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-[#121c16] text-gray-400 hover:text-white'
                }`}
                title="Listen in Telugu (te-IN)"
              >
                తెలుగు
              </button>
              <button
                onClick={() => setMicSpeechLang('hi-IN')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-all ${
                  micSpeechLang === 'hi-IN'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-[#121c16] text-gray-400 hover:text-white'
                }`}
                title="Listen in Hindi (hi-IN)"
              >
                हिन्दी
              </button>
              <button
                onClick={() => setMicSpeechLang('ta-IN')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-all ${
                  micSpeechLang === 'ta-IN'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-[#121c16] text-gray-400 hover:text-white'
                }`}
                title="Listen in Tamil (ta-IN)"
              >
                தமிழ்
              </button>
            </div>
          </div>
        </div>

        {/* Notice alert if any */}
        {voiceNotice && (
          <div className="px-4 py-2 bg-amber-950/80 border-b border-amber-800 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{voiceNotice}</span>
          </div>
        )}

        {/* Chat Message History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-[#101c15] text-gray-200 border border-[#1d3224] rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Structured itinerary summary badge if parsed */}
                  {msg.parsedSummary && (
                    <div className="mt-3 pt-3 border-t border-[#1d3a27] bg-[#09150e] p-3 rounded-xl space-y-1.5 font-mono text-xs">
                      <div className="flex items-center justify-between text-emerald-400 font-bold">
                        <span>{msg.parsedSummary.origin}</span>
                        <span>➔</span>
                        <span>{msg.parsedSummary.destination}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                        <span>Deadline: {msg.parsedSummary.deadline}</span>
                        <span>Budget: ₹{msg.parsedSummary.budget}</span>
                        <span className="uppercase text-emerald-300">{msg.parsedSummary.preferredClass}</span>
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 font-mono mt-1 px-1">
                  {isUser ? 'You' : 'Prayanam'} · {msg.timestamp}
                </span>
              </div>
            );
          })}

          {/* Active Live Voice Transcription Bubble */}
          {isListening && (
            <div className="flex flex-col items-end">
              <div className="max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm bg-emerald-950/90 text-emerald-100 border border-emerald-400 rounded-br-none shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <div className="flex items-center justify-between gap-3 text-emerald-400 font-mono text-[11px] mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Listening in {micSpeechLang}...
                  </span>
                  <span className="text-[10px] text-gray-400">Speak now</span>
                </div>
                <p className="font-medium text-white min-h-[20px]">
                  {transcript || '(Listening for your voice... speak now)'}
                </p>
                <div className="mt-2.5 pt-2 border-t border-emerald-800/60 flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Tap below or stop talking to finish</span>
                  <button
                    onClick={stopListening}
                    className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-500"
                  >
                    Done Speaking
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Speaking Indicator */}
          {isSpeaking && (
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-mono bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/40 w-fit">
              <span className="flex space-x-1 items-center">
                <span className="w-1.5 h-3 bg-emerald-400 rounded animate-pulse" />
                <span className="w-1.5 h-4 bg-emerald-400 rounded animate-pulse delay-75" />
                <span className="w-1.5 h-2 bg-emerald-400 rounded animate-pulse delay-150" />
              </span>
              <span>{langInfo.ui.speaking}</span>
              <button
                onClick={stopSpeaking}
                className="ml-2 text-[10px] px-2 py-0.5 rounded bg-emerald-900 hover:bg-emerald-800 text-white"
              >
                Stop Audio
              </button>
            </div>
          )}

          {processing && (
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-mono bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/40 w-fit">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Analyzing travel request & checking verified bus seats...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Voice Queries */}
        <div className="px-4 py-2 border-t border-[#1b2e23] bg-[#0b140f] overflow-x-auto flex items-center space-x-2 flex-shrink-0">
          <span className="text-[11px] text-gray-400 font-mono flex-shrink-0">
            Suggested Prompts:
          </span>
          <button
            onClick={() => handleSendQuery('Vizag to Araku bus morning sleeper')}
            className="px-2.5 py-1 rounded-lg bg-[#14231b] hover:bg-emerald-950 text-gray-300 hover:text-emerald-300 border border-[#21382b] text-xs font-mono whitespace-nowrap transition-all"
          >
            "Vizag to Araku"
          </button>
          <button
            onClick={() => handleSendQuery('Tirupati to Tirumala bus reach by 9 AM')}
            className="px-2.5 py-1 rounded-lg bg-[#14231b] hover:bg-emerald-950 text-gray-300 hover:text-emerald-300 border border-[#21382b] text-xs font-mono whitespace-nowrap transition-all"
          >
            "Tirupati to Tirumala"
          </button>
          <button
            onClick={() => handleSendQuery('Vijayawada to Visakhapatnam sleeper')}
            className="px-2.5 py-1 rounded-lg bg-[#14231b] hover:bg-emerald-950 text-gray-300 hover:text-emerald-300 border border-[#21382b] text-xs font-mono whitespace-nowrap transition-all"
          >
            "Vijayawada to Vizag"
          </button>
          <button
            onClick={() => handleSendQuery('Kurnool to Gandikota fort')}
            className="px-2.5 py-1 rounded-lg bg-[#14231b] hover:bg-emerald-950 text-gray-300 hover:text-emerald-300 border border-[#21382b] text-xs font-mono whitespace-nowrap transition-all"
          >
            "Kurnool to Gandikota"
          </button>
        </div>

        {/* Bottom Interactive Voice / Input Control Console */}
        <div className="p-4 border-t border-[#1b2e23] bg-[#0c1611] space-y-3">
          {/* Main Voice Toggle Button */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`px-8 py-3 rounded-2xl font-bold text-sm flex items-center space-x-3 transition-all ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_25px_rgba(244,63,94,0.6)] animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.4)]'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5 animate-spin" />
                  <span>Stop & Review Voice Input</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 animate-bounce" />
                  <span>Start Speaking ({micSpeechLang})</span>
                </>
              )}
            </button>

            {/* Direct Manual Booking Shortcut */}
            {onTriggerManualBooking && (
              <button
                onClick={() => {
                  onClose();
                  onTriggerManualBooking();
                }}
                className="px-3.5 py-3 rounded-2xl bg-[#122017] hover:bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-medium flex items-center gap-1.5 transition-all"
                title="Direct Manual Bus Timetable Booking"
              >
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Manual Booking</span>
              </button>
            )}
          </div>

          {/* Editable Text / Spoken Voice Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputText.trim()) {
                handleSendQuery(inputText);
              }
            }}
            className="flex items-center space-x-2"
          >
            <div className="relative flex-1">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                type="text"
                placeholder={
                  isListening 
                    ? 'Listening... words will appear here...' 
                    : `Speak via mic above or type (e.g. "Tirupati to Tirumala", "Vizag to Araku")...`
                }
                className="w-full px-4 py-3 rounded-xl bg-[#08100c] border border-[#1b2e23] text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-sans"
              />
              {inputText && (
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={processing || !inputText.trim()}
              className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
