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
  ChevronDown, 
  Zap, 
  Radio, 
  MessageSquare,
  Compass,
  ArrowRight
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  actionExecuted?: string;
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
      text: 'Hello! I am your RoamAgent AI Concierge (powered by openai/gpt-oss-20b). Speak or type to control any part of the prototype: plan routes, inject delays, coordinate operator rescue, or run benchmarks.',
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
        const { replyText, action, language } = json.data;

        let executedTag = undefined;

        // Execute action across the prototype
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
            // Trigger quick reload of data
            window.dispatchEvent(new Event('roamagent_disruption_updated'));
          }
        } else if (action?.type === 'RUN_BENCH') {
          executedTag = 'Opening RecoveryBench Suite';
          router.push('/admin/bench');
        } else if (action?.type === 'PLAN_TRIP') {
          executedTag = 'Extracted Travel Goal & Computing Feasible Routes';
          if (pathname !== '/traveller') {
            router.push('/traveller');
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
          <span>RoamAgent AI Copilot</span>
          <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-700 font-mono">
            gpt-oss-20b
          </span>
        </button>
      </div>

      {/* Expanded Omnipresent Voice & Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-50 max-w-sm sm:max-w-md w-full glass-panel-glow border border-emerald-500/50 rounded-3xl p-5 space-y-4 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-fade-in flex flex-col h-[520px]">
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
                  RoamAgent Copilot
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Active
                  </span>
                </h3>
                <p className="text-[10px] text-gray-400 font-mono">
                  Engine: openai/gpt-oss-20b via Groq
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
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-emerald-700 text-white rounded-br-none'
                      : 'bg-[#0e1713] text-gray-200 border border-[#1d3126] rounded-bl-none'
                  }`}
                >
                  <p>{m.text}</p>
                  {m.actionExecuted && (
                    <div className="mt-2 text-[10px] bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 px-2 py-1 rounded font-mono flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span>{m.actionExecuted}</span>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-gray-500 mt-1 font-mono">{m.timestamp}</span>
              </div>
            ))}
            {loading && (
              <div className="text-gray-400 text-xs flex items-center space-x-2 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Agent thinking with openai/gpt-oss-20b...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Voice / Control Action Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#1b2e23]">
            <button
              onClick={() => sendMessage('Plan a trip from Vizag to Hyderabad before 9 AM sleeper')}
              className="text-[10px] px-2 py-0.5 rounded bg-[#132219] hover:bg-[#1a3024] text-emerald-300 border border-[#203a2b]"
            >
              🧭 Plan Vizag ➔ Hyd
            </button>
            <button
              onClick={() => sendMessage('Trigger 90 min bus delay')}
              className="text-[10px] px-2 py-0.5 rounded bg-[#132219] hover:bg-[#1a3024] text-amber-300 border border-[#203a2b]"
            >
              ⚡ 90m Delay
            </button>
            <button
              onClick={() => sendMessage('Simulate 12 passenger mass rescue')}
              className="text-[10px] px-2 py-0.5 rounded bg-[#132219] hover:bg-[#1a3024] text-emerald-300 border border-[#203a2b]"
            >
              👥 12 Pax Rescue
            </button>
            <button
              onClick={() => sendMessage('Run RecoveryBench tests')}
              className="text-[10px] px-2 py-0.5 rounded bg-[#132219] hover:bg-[#1a3024] text-gray-300 border border-[#203a2b]"
            >
              📊 RecoveryBench
            </button>
          </div>

          {/* Interactive Voice Waveform Indicator */}
          {isListening && (
            <div className="bg-rose-950/40 border border-rose-800/60 p-2 rounded-xl flex items-center justify-between text-xs text-rose-300 font-mono animate-pulse">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" />
                <span>Listening to speech... Speak in English or Telugu</span>
              </span>
              <span className="text-[10px]">Recording</span>
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center space-x-2 pt-1"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything or command the prototype..."
              className="flex-1 bg-[#090e0c] border border-[#1b2e23] focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-gray-100 placeholder-gray-500 outline-none"
            />

            {/* Mic Toggle Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                  : 'bg-[#121c16] text-gray-300 hover:text-emerald-400 border-[#1f3527]'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
