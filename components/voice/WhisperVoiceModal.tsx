'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Sparkles, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Globe,
  Radio,
  RotateCcw,
  Volume2,
  VolumeX,
  Compass,
  ArrowRight,
  Edit3
} from 'lucide-react';
import { INDIAN_LANGUAGES, getLanguageByCode } from '@/lib/i18n/languages';
import { TripConstraints } from '@/lib/domain/types';

export type VoiceState = 
  | 'idle' 
  | 'recording' 
  | 'transcribing' 
  | 'review_required' 
  | 'ready_to_submit' 
  | 'processing_failed' 
  | 'completed';

interface WhisperVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLangCode: string;
  onParsedTrip?: (constraints: TripConstraints) => void;
  onTriggerManualBooking?: () => void;
}

export function WhisperVoiceModal({
  isOpen,
  onClose,
  currentLangCode,
  onParsedTrip,
  onTriggerManualBooking,
}: WhisperVoiceModalProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Real audio recording & analysis references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>([10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);

  // Transcribed state & review editor
  const [editableTranscript, setEditableTranscript] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('en');
  const [languageConfidence, setLanguageConfidence] = useState<number | null>(null);
  const [engineUsed, setEngineUsed] = useState<string>('local-whisper-pipeline');
  
  // Fallback text input
  const [fallbackText, setFallbackText] = useState('');
  const [selectedLanguageHint, setSelectedLanguageHint] = useState<string>('auto');

  // Client speech recognition assistive hook
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientSpeechRef = useRef<any>(null);
  const clientSpokenTextRef = useRef<string>('');

  // Structured extraction preview
  const [extractedConstraints, setExtractedConstraints] = useState<TripConstraints | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopRecordingAndAudio();
      setVoiceState('idle');
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecordingAndAudio();
    };
  }, []);

  const stopRecordingAndAudio = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch {}
      audioContextRef.current = null;
    }
    if (clientSpeechRef.current) {
      try { clientSpeechRef.current.stop(); } catch {}
      clientSpeechRef.current = null;
    }
  };

  // Stage A: Real Audio Capture with Web Audio Level Meter
  const startRecording = async () => {
    setErrorMessage(null);
    setVoiceState('recording');
    audioChunksRef.current = [];
    clientSpokenTextRef.current = '';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // 1. Setup real audio visualizer with Web Audio API
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevels = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Normalize 10 visual frequency bars
        const step = Math.floor(dataArray.length / 10);
        const bars: number[] = [];
        for (let i = 0; i < 10; i++) {
          const val = dataArray[i * step] || 0;
          bars.push(Math.max(12, Math.min(90, Math.round((val / 255) * 85) + 10)));
        }
        setAudioLevels(bars);
        animFrameRef.current = requestAnimationFrame(updateLevels);
      };
      updateLevels();

      // 2. Setup MediaRecorder for actual audio blob capture
      const options = MediaRecorder.isTypeSupported('audio/webm') 
        ? { mimeType: 'audio/webm' } 
        : undefined;

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: recorder.mimeType || 'audio/webm' 
        });
        processAudioBlob(audioBlob);
      };

      recorder.start(250);

      // 3. Assistive browser STT for instant phonetic reference
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.lang = selectedLanguageHint === 'te' ? 'te-IN' : selectedLanguageHint === 'hi' ? 'hi-IN' : 'en-IN';
          rec.continuous = true;
          rec.interimResults = true;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rec.onresult = (e: any) => {
            let full = '';
            for (let i = 0; i < e.results.length; i++) {
              full += e.results[i][0].transcript + ' ';
            }
            clientSpokenTextRef.current = full.trim();
          };
          rec.start();
          clientSpeechRef.current = rec;
        } catch {}
      }

    } catch (err: unknown) {
      console.error(err);
      setVoiceState('processing_failed');
      setErrorMessage(
        'Microphone permission was denied. Please allow microphone access in your browser or type your request below.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      setVoiceState('transcribing');
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (clientSpeechRef.current) {
        try { clientSpeechRef.current.stop(); } catch {}
      }
      mediaRecorderRef.current.stop();
    }
  };

  // Stage C, D, E, F: Send to Backend Whisper Transcription API
  const processAudioBlob = async (blob: Blob) => {
    if (blob.size < 1000 && !clientSpokenTextRef.current) {
      setVoiceState('processing_failed');
      setErrorMessage("I couldn't hear any speech. Please try recording again.");
      return;
    }

    setVoiceState('transcribing');

    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('language', selectedLanguageHint);
      formData.append('clientHint', clientSpokenTextRef.current);

      const res = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.transcript) {
        setEditableTranscript(data.transcript);
        setDetectedLanguage(data.detected_language || 'en');
        setLanguageConfidence(data.language_probability ?? null);
        setEngineUsed(data.engine || 'local-whisper-pipeline');
        setVoiceState('review_required');
      } else {
        setVoiceState('processing_failed');
        setErrorMessage(data.error || "I couldn't hear any speech. Please try recording again.");
      }
    } catch {
      setVoiceState('processing_failed');
      setErrorMessage('Voice transcription is unavailable right now. You can type your travel request instead.');
    }
  };

  // Stage H: Structured Travel Extraction from Confirmed Transcript
  const handleConfirmTranscript = async () => {
    if (!editableTranscript.trim()) return;

    setVoiceState('transcribing');
    try {
      const res = await fetch('/api/parse-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: editableTranscript.trim(), 
          language: detectedLanguage 
        }),
      });

      const data = await res.json();
      if (data.success && data.constraints) {
        setExtractedConstraints(data.constraints);
        setVoiceState('completed');

        if (onParsedTrip) {
          onParsedTrip(data.constraints);
        }
      } else {
        setVoiceState('processing_failed');
        setErrorMessage('Unable to extract origin and destination. Please clarify your locations.');
      }
    } catch {
      setVoiceState('processing_failed');
      setErrorMessage('Trip processing failed. Please verify your connection or use manual booking.');
    }
  };

  const handleManualTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fallbackText.trim()) return;
    setEditableTranscript(fallbackText.trim());
    setDetectedLanguage(selectedLanguageHint !== 'auto' ? selectedLanguageHint : 'en');
    setLanguageConfidence(1.0);
    setVoiceState('review_required');
    setFallbackText('');
  };

  if (!isOpen) return null;

  const currentLang = getLanguageByCode(detectedLanguage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="glass-panel-glow max-w-xl w-full flex flex-col rounded-3xl border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.2)] overflow-hidden bg-[#070e0a]">
        
        {/* Header */}
        <div className="p-4 border-b border-[#1b2e23] bg-[#0c1611]/90 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-500/60 flex items-center justify-center text-emerald-400">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-base">Prayanam Voice AI</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Whisper Pipeline (₹0 AI Budget)
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">
                Multilingual Speech Recognition & Travel Intent
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopRecordingAndAudio();
              onClose();
            }}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#15231b] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selection & Audio Pipeline Header */}
        <div className="px-4 py-2.5 bg-[#09130e] border-b border-[#1b2e23] flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-gray-400 font-mono">Language Mode:</span>
            <select
              value={selectedLanguageHint}
              onChange={(e) => setSelectedLanguageHint(e.target.value)}
              disabled={voiceState === 'recording' || voiceState === 'transcribing'}
              className="px-2 py-1 rounded-lg bg-[#0e1c14] border border-emerald-700/60 text-emerald-300 font-medium text-xs focus:outline-none"
            >
              <option value="auto">Auto-Detect Language (Telugu / English / Mixed)</option>
              <option value="en">English Priority</option>
              <option value="te">తెలుగు (Telugu Priority)</option>
              <option value="hi">हिन्दी (Hindi Priority)</option>
            </select>
          </div>

          <span className="text-[11px] font-mono text-gray-500">
            Engine: {engineUsed.includes('faster') ? 'Faster-Whisper' : 'Whisper-Local'}
          </span>
        </div>

        {/* Content Body State Machine */}
        <div className="p-6 space-y-6">

          {/* STATE 1: IDLE */}
          {voiceState === 'idle' && (
            <div className="text-center space-y-5 py-4">
              <div className="space-y-1.5">
                <h4 className="text-lg font-bold text-white">Speak Your Journey</h4>
                <p className="text-xs text-gray-300 max-w-md mx-auto">
                  Speak naturally in <span className="text-emerald-400 font-semibold">English</span>, <span className="text-emerald-400 font-semibold">Telugu</span>, or <span className="text-emerald-400 font-semibold">English–Telugu mixed</span>. 
                  Whisper will transcribe and identify the language before route planning.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center gap-3">
                <button
                  onClick={startRecording}
                  className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.35)] transition-all hover:scale-105"
                >
                  <Mic className="w-5 h-5 animate-bounce" />
                  <span>Start Recording Microphone</span>
                </button>
                <span className="text-[11px] font-mono text-gray-500">
                  Privacy Guaranteed: Processed locally · Temporary audio discarded
                </span>
              </div>

              {/* Sample Prompts */}
              <div className="pt-2 border-t border-[#1b2e23] text-left space-y-2">
                <span className="text-[11px] font-mono text-gray-400 block">Try saying:</span>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  <button
                    onClick={() => {
                      setEditableTranscript('I want to go from Vizag to Hyderabad tomorrow morning.');
                      setDetectedLanguage('en');
                      setLanguageConfidence(0.96);
                      setVoiceState('review_required');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#111e17] text-gray-300 hover:text-emerald-300 border border-[#1e3427] text-[11px]"
                  >
                    "Vizag to Hyderabad tomorrow morning" (English)
                  </button>
                  <button
                    onClick={() => {
                      setEditableTranscript('విశాఖపట్నం నుంచి హైదరాబాద్ వెళ్లాలి. ఉదయం తొమ్మిది గంటల లోపు చేరాలి.');
                      setDetectedLanguage('te');
                      setLanguageConfidence(0.95);
                      setVoiceState('review_required');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#111e17] text-gray-300 hover:text-emerald-300 border border-[#1e3427] text-[11px]"
                  >
                    "విశాఖపట్నం నుంచి హైదరాబాద్..." (Telugu)
                  </button>
                  <button
                    onClick={() => {
                      setEditableTranscript('Vizag నుంచి Hyderabad వెళ్లాలి, morning 9 AM లోపు reach అవ్వాలి.');
                      setDetectedLanguage('te');
                      setLanguageConfidence(0.92);
                      setVoiceState('review_required');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#111e17] text-gray-300 hover:text-emerald-300 border border-[#1e3427] text-[11px]"
                  >
                    "Vizag నుంచి Hyderabad, morning 9 AM..." (Mixed)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: RECORDING (Active Real-Time Waveform) */}
          {voiceState === 'recording' && (
            <div className="text-center space-y-6 py-4">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2 text-rose-400 font-mono text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-bold tracking-wider uppercase">Recording User Speech...</span>
                </div>
                <h4 className="text-base font-bold text-white">Speak Clearly Into Microphone</h4>
              </div>

              {/* Real Web Audio Spectrum Waveform Bars */}
              <div className="h-20 flex items-center justify-center gap-1.5 bg-[#0b1410] p-4 rounded-2xl border border-emerald-950">
                {audioLevels.map((level, i) => (
                  <div
                    key={i}
                    style={{ height: `${level}%` }}
                    className="w-2 rounded-full bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-75"
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={stopRecording}
                  className="px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(244,63,94,0.5)] transition-all"
                >
                  <MicOff className="w-5 h-5" />
                  <span>Stop Recording & Transcribe</span>
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: TRANSCRIBING */}
          {voiceState === 'transcribing' && (
            <div className="text-center space-y-4 py-8">
              <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base">Transcribing Audio & Identifying Language</h4>
                <p className="text-xs text-gray-400 font-mono">
                  Applying Whisper acoustic normalization and transport vocabulary hints...
                </p>
              </div>
            </div>
          )}

          {/* STATE 4: REVIEW REQUIRED (Review, Edit & Confirm) */}
          {voiceState === 'review_required' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1b2e23] pb-2">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white text-sm">Review & Edit Speech Transcript</span>
                </div>

                {/* Detected Language Pill */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 text-xs font-mono">
                  <span>Detected: {currentLang.nativeName} ({detectedLanguage.toUpperCase()})</span>
                  {languageConfidence && (
                    <span className="text-[10px] text-emerald-400 font-bold">
                      · {Math.round(languageConfidence * 100)}%
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-300">
                Whisper transcribed your speech. You can correct any names, numbers, or deadlines before travel requirements are extracted:
              </p>

              {/* Editable Transcript Textarea */}
              <div className="space-y-1.5">
                <textarea
                  value={editableTranscript}
                  onChange={(e) => setEditableTranscript(e.target.value)}
                  rows={3}
                  className="w-full p-3.5 rounded-xl bg-[#09140e] border border-emerald-600/60 text-sm text-white font-sans focus:outline-none focus:border-emerald-400"
                  placeholder="Review your spoken query..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => {
                    setVoiceState('idle');
                    setEditableTranscript('');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#122017] hover:bg-[#1a2e21] text-gray-300 text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Record Again</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setVoiceState('idle');
                      onClose();
                    }}
                    className="px-4 py-2.5 rounded-xl text-gray-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmTranscript}
                    disabled={!editableTranscript.trim()}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                  >
                    <span>Use Transcript & Plan Trip</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATE 5: PROCESSING FAILED / UNCERTAIN SPEECH */}
          {voiceState === 'processing_failed' && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
                <div className="space-y-1">
                  <p className="font-bold text-white">Voice Processing Notice</p>
                  <p>{errorMessage || "I couldn't hear any speech. Please try recording again."}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setVoiceState('idle');
                    setErrorMessage(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Try Recording Again
                </button>
              </div>
            </div>
          )}

          {/* STATE 6: COMPLETED */}
          {voiceState === 'completed' && extractedConstraints && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-600/60 text-emerald-200 text-xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Travel Requirements Extracted Successfully</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 p-3 bg-[#0a150f] rounded-xl border border-emerald-900 font-mono">
                  <div><span className="text-gray-400">Origin:</span> {extractedConstraints.origin}</div>
                  <div><span className="text-gray-400">Destination:</span> {extractedConstraints.destination}</div>
                  <div><span className="text-gray-400">Budget:</span> ₹{extractedConstraints.budgetInr}</div>
                  <div><span className="text-gray-400">Class:</span> {extractedConstraints.preferredClass.toUpperCase()}</div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  <span>View Recommended Routes</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Text-Input Fallback (Always Accessible) */}
          <div className="pt-4 border-t border-[#1b2e23] space-y-2">
            <span className="text-[11px] font-mono text-gray-400 block">
              Keyboard Text Fallback (or if mic is unavailable):
            </span>
            <form onSubmit={handleManualTextSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={fallbackText}
                onChange={(e) => setFallbackText(e.target.value)}
                placeholder="Type here in English or Telugu (e.g. Tirupati to Tirumala sleeper)..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#09140e] border border-[#1b2e23] text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 font-sans"
              />
              <button
                type="submit"
                disabled={!fallbackText.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#122017] hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-xs font-medium disabled:opacity-40"
              >
                Use Text
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
