'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  Sparkles, 
  X, 
  Zap, 
  Radio, 
  MessageSquare,
  Compass,
  ArrowRight,
  Shield,
  CheckCircle2,
  Clock,
  Bus,
  AlertTriangle
} from 'lucide-react';
import { TripConstraints } from '@/lib/domain/types';

export interface PlanCardItem {
  id: string;
  operator: string;
  fromStop: string;
  toStop: string;
  departureTime: string;
  arrivalTime: string;
  fare: number;
  seatClass: string;
  bufferMins: number;
  resilienceIndex: string;
  legsCount: number;
}

export interface CopilotPlanData {
  constraints: TripConstraints;
  primary: PlanCardItem;
  backup?: PlanCardItem | null;
  feasibleCount: number;
  infeasibleCount?: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  actionExecuted?: string;
  planData?: CopilotPlanData | null;
  suggestedPrompts?: string[];
  timestamp: string;
}

export function OmniVoiceAgent() {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'agent',
      text: 'Hello! I am your Prayanam AI Concierge. Speak or type to control any part of the platform: plan trips with resilient backup options, inject live disruptions, book tickets, or inspect fleet recovery.',
      suggestedPrompts: [
        'Plan a trip from Vizag to Hyderabad before 9 AM sleeper',
        'Trigger 90 min bus delay',
        'Simulate 12 passenger mass rescue',
        'Open Operator Console'
      ],
      timestamp: '18:00',
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Text to Speech Helper
  const speakText = (text: string, lang = 'en') => {
    if (!ttsEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'te' ? 'te-IN' : 'en-IN';
    utterance.rate = 1.05;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Speech to Text Helper
  const handleToggleVoice = () => {
    if (typeof window === 'undefined') return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use text input.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setInputText(transcript);
          sendMessage(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSelectAndBook = (itineraryId: string) => {
    if (pathname !== '/traveller') {
      router.push('/traveller');
    }
    window.dispatchEvent(
      new CustomEvent('prayanam_copilot_book', { detail: { itineraryId } })
    );
  };

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/agent-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          currentPath: pathname,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const { replyText, action, language, suggestedPrompts } = json.data;

        let executedTag = undefined;

        // Execute actions seamlessly across the prototype
        if (action?.type === 'NAVIGATE' && action.targetPath) {
          executedTag = `Navigated to ${action.targetPath}`;
          router.push(action.targetPath);
        } else if (action?.type === 'TRIGGER_DISRUPTION' && action.disruptionType) {
          executedTag = `Triggered disruption: ${action.disruptionType}`;
          await fetch('/api/disruptions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: action.disruptionType }),
          });
          if (pathname !== '/traveller' && pathname !== '/admin/simulator') {
            router.push('/traveller');
          } else {
            window.dispatchEvent(new Event('prayanam_disruption_updated'));
          }
        } else if (action?.type === 'RUN_BENCH') {
          executedTag = 'Opening RecoveryBench Suite';
          router.push('/admin/bench');
        } else if (action?.type === 'PLAN_TRIP') {
          executedTag = action.planData?.primary
            ? `Planned Primary (${action.planData.primary.operator}) & Backup Options`
            : 'Calculated Travel Constraints';

          if (action.planData) {
            try {
              localStorage.setItem('prayanam_copilot_trip', JSON.stringify(action.planData));
            } catch (_) {}
            window.dispatchEvent(
              new CustomEvent('prayanam_copilot_trip', { detail: action.planData })
            );
          }
        } else if (action?.type === 'BOOK_ITINERARY') {
          executedTag = 'Triggered Booking Review Mode';
          if (pathname !== '/traveller') {
            router.push('/traveller');
          }
          if (action.selectItineraryId) {
            window.dispatchEvent(
              new CustomEvent('prayanam_copilot_book', { detail: { itineraryId: action.selectItineraryId } })
            );
          }
        } else if (action?.type === 'RESET_DEMO') {
          executedTag = 'Restored initial deterministic seed state';
          await fetch('/api/disruptions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'RESET' }),
          });
          window.location.reload();
        }

        const agentMsg: ChatMessage = {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          text: replyText,
          actionExecuted: executedTag,
          planData: action?.planData || null,
          suggestedPrompts: suggestedPrompts || [],
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
        };

        setMessages((prev) => [...prev, agentMsg]);
        speakText(replyText, language);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2.5 px-4 py-3 rounded-full shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all font-semibold text-xs ${
            isOpen
              ? 'bg-[#121c16] text-gray-200 border border-emerald-600/50'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white animate-bounce-subtle'
          }`}
        >
          <div className="relative">
            <Bot className="w-4 h-4 text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-lime-400 animate-ping" />
          </div>
          <span>Prayanam Copilot</span>
          <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-700 font-mono">
            Active
          </span>
        </button>
      </div>

      {/* Expanded Omnipresent Voice & Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-50 max-w-sm sm:max-w-lg w-full glass-panel-glow border border-emerald-500/50 rounded-3xl p-5 space-y-4 shadow-[0_0_50px_rgba(0,0,0,0.85)] backdrop-blur-xl animate-fade-in flex flex-col h-[580px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1b2e23] pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-700 relative">
                <Bot className="w-5 h-5" />
                {isSpeaking && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  Prayanam Copilot
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Active Control
                  </span>
                </h3>
                <p className="text-[10px] text-gray-400 font-mono">
                  Full Platform Concierge & Multi-Leg Router
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              {/* TTS Mute Toggle */}
              <button
                onClick={() => setTtsEnabled(!ttsEnabled)}
                title={ttsEnabled ? 'Mute Speech Voice' : 'Enable Speech Voice'}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-[#0f1813] border border-[#1b2e23]"
              >
                {ttsEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-[#0f1813] border border-[#1b2e23]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[92%] rounded-2xl p-3.5 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-emerald-700 text-white rounded-br-none'
                      : 'bg-[#0e1713] text-gray-200 border border-[#1d3126] rounded-bl-none shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* Tag for executed platform action */}
                  {m.actionExecuted && (
                    <div className="mt-2.5 text-[10px] bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 px-2 py-1 rounded font-mono flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span>{m.actionExecuted}</span>
                    </div>
                  )}

                  {/* Rich Primary & Backup Plan Interactive Cards */}
                  {m.planData && (
                    <div className="mt-3.5 space-y-2.5">
                      {/* Primary Recommended Plan Card */}
                      <div className="bg-[#0b1610] border border-emerald-500/70 rounded-xl p-3 space-y-2 shadow-[0_0_15px_rgba(16,185,129,0.18)]">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            PRIMARY RECOMMENDED PLAN
                          </span>
                          <span className="text-xs font-bold text-emerald-400">
                            ₹{m.planData.primary.fare}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-0.5">
                          <div>
                            <span className="font-bold text-white block flex items-center gap-1.5">
                              <Bus className="w-3.5 h-3.5 text-emerald-400" />
                              {m.planData.primary.operator}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {m.planData.primary.fromStop} ➔ {m.planData.primary.toStop}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#132219] text-gray-300 border border-[#203a2b] uppercase">
                            {m.planData.primary.seatClass}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono text-gray-300 pt-1.5 border-t border-[#182a20]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-400" />
                            {m.planData.primary.departureTime} — {m.planData.primary.arrivalTime}
                          </span>
                          <span className="text-emerald-400 font-semibold">
                            +{m.planData.primary.bufferMins}m safety buffer
                          </span>
                        </div>

                        <button
                          onClick={() => handleSelectAndBook(m.planData!.primary.id)}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] mt-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Select & Review Booking (₹{m.planData.primary.fare})</span>
                        </button>
                      </div>

                      {/* Backup Resilience Plan Card */}
                      {m.planData.backup && (
                        <div className="bg-[#0e1614] border border-cyan-800/70 rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 flex items-center gap-1">
                              <Shield className="w-3 h-3 text-cyan-400" />
                              RESILIENCE PASSPORT BACKUP
                            </span>
                            <span className="text-xs font-bold text-cyan-300">
                              ₹{m.planData.backup.fare}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-0.5">
                            <div>
                              <span className="font-bold text-white block">
                                {m.planData.backup.operator}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                {m.planData.backup.fromStop} ➔ {m.planData.backup.toStop}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#152520] text-gray-300 border border-cyan-900 uppercase">
                              {m.planData.backup.seatClass}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] font-mono text-gray-300 pt-1.5 border-t border-[#182a20]">
                            <span>
                              {m.planData.backup.departureTime} — {m.planData.backup.arrivalTime}
                            </span>
                            <span className="text-cyan-400 font-semibold">
                              +{m.planData.backup.bufferMins}m buffer
                            </span>
                          </div>

                          <div className="text-[10px] text-gray-400 italic">
                            🛡️ Verified backup reserve if highway delay occurs.
                          </div>
                        </div>
                      )}

                      {/* Quick Navigate Link */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => router.push('/traveller')}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono transition-all"
                        >
                          <span>View on Traveller Workbench</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Dynamic Action Suggestions */}
                  {m.suggestedPrompts && m.suggestedPrompts.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[#1b2e23] flex flex-wrap gap-1.5">
                      {m.suggestedPrompts.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(p)}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-[#132219] hover:bg-[#1a3024] text-emerald-300 border border-[#203a2b] transition-all"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-gray-500 mt-1 font-mono">{m.timestamp}</span>
              </div>
            ))}
            {loading && (
              <div className="text-gray-400 text-xs flex items-center space-x-2 font-mono p-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Computing feasible routes & resilience passport...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#1b2e23]">
            <button
              onClick={() => sendMessage('Plan a trip from Vizag to Hyderabad before 9 AM sleeper')}
              className="text-[10px] px-2 py-1 rounded bg-[#132219] hover:bg-[#1a3024] text-emerald-300 border border-[#203a2b]"
            >
              🧭 Plan Vizag ➔ Hyd Sleeper
            </button>
            <button
              onClick={() => sendMessage('Trigger 90 min bus delay')}
              className="text-[10px] px-2 py-1 rounded bg-[#132219] hover:bg-[#1a3024] text-amber-300 border border-[#203a2b]"
            >
              ⚡ 90m Delay
            </button>
            <button
              onClick={() => sendMessage('Simulate 12 passenger mass rescue')}
              className="text-[10px] px-2 py-1 rounded bg-[#132219] hover:bg-[#1a3024] text-emerald-300 border border-[#203a2b]"
            >
              👥 12 Pax Rescue
            </button>
            <button
              onClick={() => sendMessage('Run RecoveryBench tests')}
              className="text-[10px] px-2 py-1 rounded bg-[#132219] hover:bg-[#1a3024] text-gray-300 border border-[#203a2b]"
            >
              📊 RecoveryBench
            </button>
          </div>

          {/* Voice Waveform Indicator */}
          {isListening && (
            <div className="bg-rose-950/40 border border-rose-800/60 p-2 rounded-xl flex items-center justify-between text-xs text-rose-300 font-mono animate-pulse">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" />
                <span>Listening... Speak your goal in English or Telugu</span>
              </span>
              <span className="text-[10px]">Recording</span>
            </div>
          )}

          {/* Input Box */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
              placeholder="Tell Prayanam (e.g. Plan Vizag to Hyd before 9 AM sleeper)..."
              className="flex-1 bg-[#090e0b] border border-[#1b2e23] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />

            <button
              onClick={handleToggleVoice}
              title="Voice Input (Speech recognition)"
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                  : 'bg-[#0e1713] text-gray-300 border-[#1b2e23] hover:text-white hover:border-emerald-500'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              onClick={() => sendMessage()}
              disabled={loading || !inputText.trim()}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
