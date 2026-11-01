import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Volume2, VolumeX, Sparkles, Loader2, ArrowRight } from 'lucide-react';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVoiceMessage: (text: string) => Promise<string | void>;
  language: 'id' | 'en';
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  onSendVoiceMessage,
  language,
}) => {
  if (!isOpen) return null;
  const isId = language !== 'en';

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponseText, setAiResponseText] = useState('');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = isId ? 'id-ID' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recognition.onend = async () => {
        setIsListening(false);
        if (transcript.trim()) {
          await handleSendVoiceText(transcript.trim());
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, transcript]);

  const startListening = () => {
    if (!recognitionRef.current) {
      alert(isId ? 'Browser ini belum mendukung input suara audio langsung.' : 'Voice recognition not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    setTranscript('');
    setAiResponseText('');
    setIsAiSpeaking(false);
    try {
      recognitionRef.current.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleSendVoiceText = async (textToSend: string) => {
    setIsProcessing(true);
    try {
      const res = await onSendVoiceMessage(textToSend);
      if (typeof res === 'string' && res) {
        setAiResponseText(res);
        speakResponse(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = (text: string) => {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*`_\[\]()]/g, '').slice(0, 500);
    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.lang = isId ? 'id-ID' : 'en-US';
    utter.rate = 1.05;
    utter.onstart = () => setIsAiSpeaking(true);
    utter.onend = () => setIsAiSpeaking(false);
    utter.onerror = () => setIsAiSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in">
      <div className="w-full max-w-lg h-[620px] bg-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-2xl relative overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-tr from-cyan-600/20 via-indigo-600/20 to-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="w-full flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
              {isId ? 'Voice Mode · Live Audio Interaktif Real-Time' : 'Voice Mode · Live Audio'}
            </span>
          </div>
          <button
            onClick={() => {
              window.speechSynthesis.cancel();
              if (recognitionRef.current) recognitionRef.current.stop();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Pulsating Futuristic Animated Voice Orb */}
        <div className="relative my-auto flex flex-col items-center justify-center z-10">
          <div className="relative flex items-center justify-center">
            {/* Outer pulsating wave rings */}
            <div className={`absolute w-52 h-52 rounded-full border border-cyan-500/30 transition-all duration-700 ${
              isListening || isAiSpeaking ? 'scale-125 opacity-80 animate-ping' : 'scale-95 opacity-20'
            }`} />
            <div className={`absolute w-44 h-44 rounded-full border border-indigo-500/40 transition-all duration-500 ${
              isListening || isAiSpeaking ? 'scale-110 opacity-70 animate-pulse' : 'scale-90 opacity-20'
            }`} />

            {/* Core glowing sphere */}
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`w-36 h-36 rounded-full flex items-center justify-center p-1 transition-all duration-300 shadow-2xl ${
                isListening
                  ? 'bg-gradient-to-tr from-rose-500 via-pink-600 to-indigo-600 shadow-rose-500/50 scale-105'
                  : isAiSpeaking
                  ? 'bg-gradient-to-tr from-cyan-400 via-indigo-600 to-emerald-400 shadow-cyan-500/50 scale-105 animate-pulse'
                  : 'bg-gradient-to-tr from-cyan-600 via-indigo-700 to-slate-900 shadow-indigo-600/30 hover:scale-105'
              }`}
            >
              <div className="w-full h-full rounded-full bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-1.5 text-white">
                {isProcessing ? (
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                ) : isListening ? (
                  <>
                    <Mic className="w-8 h-8 text-rose-400 animate-bounce" />
                    <span className="text-[10px] font-mono font-bold text-rose-300 uppercase">Mendengarkan</span>
                  </>
                ) : isAiSpeaking ? (
                  <>
                    <Volume2 className="w-8 h-8 text-cyan-300 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase">Menjawab</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-8 h-8 text-slate-300" />
                    <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase">Ketuk Bicara</span>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Status Label */}
          <div className="mt-6 space-y-1">
            <h4 className="text-sm font-bold text-white">
              {isListening 
                ? 'Silakan berbicara...' 
                : isProcessing 
                ? 'VEXION AI sedang berpikir...' 
                : isAiSpeaking 
                ? 'VEXION AI sedang berbicara...' 
                : 'Ketuk bola untuk mulai berbicara'}
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto line-clamp-2">
              {transcript ? `"${transcript}"` : 'Tanyakan apa saja secara langsung layaknya berbicara dengan manusia.'}
            </p>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="w-full pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 z-10">
          <span className="text-[11px] font-mono text-slate-500">
            Ayyub Kenda Pratama Engine
          </span>
          <button
            onClick={isListening ? stopListening : startListening}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors border border-slate-800"
          >
            {isListening ? 'Selesai Bicara' : 'Mulai Bicara'}
          </button>
        </div>
      </div>
    </div>
  );
};
