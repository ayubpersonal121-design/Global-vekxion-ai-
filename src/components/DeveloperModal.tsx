import React from 'react';
import { X, Award, ShieldCheck, Sparkles, Terminal, Heart, Code2, Globe } from 'lucide-react';

interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'id' | 'en';
}

export const DeveloperModal: React.FC<DeveloperModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  if (!isOpen) return null;
  const isId = language !== 'en';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Developer Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-[2px] shadow-xl shadow-indigo-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <span className="text-2xl font-black bg-gradient-to-tr from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                AKP
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Ayyub Kenda Pratama
              </h3>
              <span title="Verified Creator">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
              </span>
            </div>
            <p className="text-xs text-cyan-400 font-medium mt-0.5">
              {isId ? 'Lead Creator & Developer VEXION AI' : 'Lead Creator & Developer of VEXION AI'}
            </p>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                AI Systems Engineer
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Full-Stack Architect
              </span>
            </div>
          </div>
        </div>

        {/* Bio & Vision */}
        <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <p>
            {isId
              ? 'VEXION AI dirancang dan dikembangkan secara eksklusif oleh Ayyub Kenda Pratama untuk menghadirkan platform kecerdasan buatan tingkat tinggi yang menggabungkan kemampuan dialog interaktif cerdas (GPT Astra & Gemini 4 Argon) dengan kekuatan studio pembuat apa pun berbasis live sandbox.'
              : 'VEXION AI is exclusively engineered by Ayyub Kenda Pratama to deliver a high-level artificial intelligence platform combining fluent conversational intellect (GPT Astra & Gemini 4 Argon) with an autonomous builder studio and real-time live sandbox execution.'}
          </p>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Core Model: GPT Astra High-Intelligence Neural Engine</span>
            <span className="text-cyan-400 font-mono">v2.5 Flagship</span>
          </div>
        </div>

        {/* Signature Features by Developer */}
        <div className="grid grid-cols-2 gap-2.5 my-4">
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-1">
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full-Stack Sandbox</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {isId ? 'Eksekusi aplikasi HTML, Tailwind & JS interaktif secara instan.' : 'Instant execution of interactive HTML5, Tailwind & JS web apps.'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white mb-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cognitive Reasoning</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {isId ? 'Rantai penalaran kognitif multi-tahap dengan kecerdasan tingkat tinggi (GPT Astra Core).' : 'Multi-step cognitive breakdown with high-level intelligence (GPT Astra Core).'}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-800">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> by Ayyub Kenda Pratama
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            {isId ? 'Tutup Profil' : 'Close Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};
