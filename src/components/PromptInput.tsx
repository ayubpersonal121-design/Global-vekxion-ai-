import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Wand2, 
  Check, 
  X, 
  Lightbulb, 
  Loader2, 
  Image as ImageIcon,
  Lock
} from 'lucide-react';
import { CreationMode } from '../types';

interface PromptInputProps {
  mode: CreationMode;
  prompt: string;
  setPrompt: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  language: 'id' | 'en';
  aspectRatio: string;
  setAspectRatio: (ar: string) => void;
  isFree?: boolean;
  onRequireUpgrade?: (message: string) => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  mode,
  prompt,
  setPrompt,
  onSubmit,
  isLoading,
  language,
  aspectRatio,
  setAspectRatio,
  isFree = false,
  onRequireUpgrade,
}) => {
  const isId = language !== 'en';
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<string | null>(null);

  const getPlaceholder = () => {
    if (isId) {
      switch (mode) {
        case 'web_app':
          return 'Contoh: Buatkan aplikasi simulator fisika luar angkasa interaktif dengan HTML5 canvas, kontrol kecepatan, orbit realistis, dan kontrol UI modern...';
        case 'code':
          return 'Contoh: Tulis implementasi Algoritma A* Pathfinding dalam TypeScript dengan grid visual, test case lengkap, dan analisis Big-O...';
        case 'architecture':
          return 'Contoh: Rancang arsitektur sistem real-time financial trading dengan latency <5ms, diagram Mermaid, skema PostgreSQL, dan event sourcing...';
        case 'document':
          return 'Contoh: Susun Pitch Deck eksekutif untuk Startup AI MedTech: problem, TAM, teknologi proprietary, proyeksi keuangan 5 tahun...';
        case 'science':
          return 'Contoh: Turunkan persamaan relativitas umum medan Einstein, jelaskan tensor kelengkungan Riemann, dan kode simulasi orbit Merkurius...';
        case 'visual_art':
          return 'Contoh: Pemandangan kota metropolitan cyberpunk futuristik tahun 2099 dengan neon cyan, menara holografis, dan hujan reflektif...';
        default:
          return 'Deskripsikan apa pun yang ingin Anda ciptakan — aplikasi, kode, sistem, strategi, ide sains, atau karya lainnya...';
      }
    } else {
      switch (mode) {
        case 'web_app':
          return 'E.g., Build an interactive financial dashboard widget with responsive charts, dark mode UI, and live expense calculation...';
        case 'code':
          return 'E.g., Write a thread-safe distributed lock implementation in Go with Redis, integration tests, and edge case handling...';
        case 'architecture':
          return 'E.g., Architect a hyper-scalable real-time notification engine supporting 10M concurrent users with Kafka and WebSockets...';
        default:
          return 'Describe whatever you want to forge — apps, code, architectures, executive docs, scientific models...';
      }
    }
  };

  interface PresetItem {
    label: string;
    isPro?: boolean;
  }

  const getPresets = (): PresetItem[] => {
    if (isId) {
      switch (mode) {
        case 'web_app':
          return [
            { label: 'Kalkulator Tabungan Interaktif', isPro: false },
            { label: 'Visualizer Algoritma Sorting', isPro: false },
            { label: 'Game Simulasi Gravitasi Orbit Neon di Canvas', isPro: true },
            { label: 'Dashboard SaaS Finansial Enterprise Multi-Tier', isPro: true }
          ];
        case 'code':
          return [
            { label: 'Validasi Email & Regex Cleaner', isPro: false },
            { label: 'Binary Search & Test Case', isPro: false },
            { label: 'Rate Limiter Token Bucket Thread-Safe (Redis)', isPro: true },
            { label: 'Algoritma Micrograd Neural Net Autograd (Python)', isPro: true }
          ];
        case 'architecture':
          return [
            { label: 'Skema Database Relasional PostgreSQL', isPro: false },
            { label: 'Arsitektur Video Streaming Global (HLS + Edge CDN)', isPro: true },
            { label: 'Platform IoT Telemetri Miliaran Event/Hari (Kafka)', isPro: true }
          ];
        case 'document':
          return [
            { label: 'Ringkasan Eksekutif Bisnis', isPro: false },
            { label: 'Pitch Deck Startup SaaS AI $3M Seed Round', isPro: true },
            { label: 'Whitepaper Protokol Zero-Knowledge Rollup', isPro: true }
          ];
        case 'science':
          return [
            { label: 'Kalkulasi Hukum Newton & Gerak Parabola', isPro: false },
            { label: 'Derivasi Persamaan Schrodinger & Simulasi Kuantum', isPro: true },
            { label: 'Model Epidemiologi Dinamis SEIR Intervensi Vaksin', isPro: true }
          ];
        case 'visual_art':
          return [
            { label: 'Cybernetic Core with Bioluminescent Circuitry', isPro: true },
            { label: 'Solarpunk Floating Citadel in Atmospheric Clouds', isPro: true }
          ];
        default:
          return [
            { label: 'Kalkulator Konversi Satuan Interaktif', isPro: false },
            { label: 'Simulator Tata Surya 3D Canvas Interaktif', isPro: true },
            { label: 'Executive Blueprint Platform AI Enterprise', isPro: true }
          ];
      }
    } else {
      return [
        { label: 'Simple Unit Converter App', isPro: false },
        { label: 'Interactive Physics Sandbox in HTML5 Canvas', isPro: true },
        { label: 'High-Performance In-Memory Cache with TTL', isPro: true },
        { label: 'Global Scale Microservices Architecture Blueprint', isPro: true }
      ];
    }
  };

  const handlePresetClick = (preset: PresetItem) => {
    if (preset.isPro && isFree) {
      onRequireUpgrade?.(isId ? `Preset Spesialis Pro ("${preset.label}") memerlukan akun Premium.` : `Pro Specialized Preset ("${preset.label}") requires a Premium account.`);
      return;
    }
    setPrompt(preset.label);
  };

  // Enhance prompt handler
  const handleEnhance = async () => {
    if (isFree) {
      onRequireUpgrade?.(isId ? 'Fitur Tingkatkan Prompt (Supercharge) tingkat arsitek memerlukan akun Premium.' : 'Supercharge Prompt requires a Premium account.');
      return;
    }
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    setEnhancedResult(null);

    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, mode, language }),
      });
      const data = await res.json();
      if (data.enhancedPrompt) {
        setEnhancedResult(data.enhancedPrompt);
      }
    } catch (err) {
      console.error('Enhance failed:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && prompt.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Textarea Container */}
      <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-xl">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          rows={4}
          className="w-full bg-transparent p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
        />

        {/* Bottom Bar inside Input */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-t border-slate-800/80 bg-slate-950/40 rounded-b-2xl">
          <div className="flex items-center gap-2">
            {/* Enhance Button */}
            <button
              onClick={handleEnhance}
              disabled={(!isFree && (isEnhancing || !prompt.trim() || isLoading))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all hover:text-white ${
                isFree 
                  ? 'bg-amber-950/40 border-amber-600/50 text-amber-300 hover:bg-amber-900/60' 
                  : 'bg-indigo-950/70 hover:bg-indigo-900/80 border-indigo-700/50 text-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
              title={isFree ? 'Fitur Premium (Terkunci)' : 'Tingkatkan prompt secara otomatis'}
            >
              {isEnhancing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : isFree ? (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>{isId ? 'Tingkatkan Prompt' : 'Supercharge Prompt'}</span>
              {isFree && <span className="text-[10px] font-mono text-amber-400 uppercase">[Pro]</span>}
            </button>

            {/* Aspect Ratio Selector for visual_art mode */}
            {mode === 'visual_art' && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-slate-400">Rasio:</span>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="bg-transparent text-white font-mono text-xs focus:outline-none"
                >
                  <option value="1:1" className="bg-slate-900">1:1 (Kotak)</option>
                  <option value="16:9" className="bg-slate-900">16:9 (Landscape)</option>
                  <option value="9:16" className="bg-slate-900">9:16 (Portrait)</option>
                  <option value="4:3" className="bg-slate-900">4:3 (Standar)</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Ctrl/Cmd + Enter
            </span>
            <button
              onClick={onSubmit}
              disabled={isLoading || !prompt.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-cyan-600 to-emerald-600 hover:from-indigo-500 hover:via-cyan-500 hover:to-emerald-500 text-white font-semibold text-xs shadow-lg shadow-cyan-900/30 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isId ? 'Menciptakan...' : 'Forging...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isId ? 'Ciptakan Sekarang' : 'Forge Now'}</span>
                  <Send className="w-3.5 h-3.5 opacity-80" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Prompt Suggestion Box */}
      {enhancedResult && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/90 to-slate-900 border border-indigo-500/40 shadow-lg text-xs space-y-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between text-indigo-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              {isId ? 'Prompt Di-Supercharge (Tingkat Arsitek)' : 'Supercharged Prompt Specification'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setPrompt(enhancedResult);
                  setEnhancedResult(null);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
              >
                <Check className="w-3 h-3" />
                <span>{isId ? 'Gunakan Prompt Ini' : 'Apply'}</span>
              </button>
              <button
                onClick={() => setEnhancedResult(null)}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="text-slate-300 leading-relaxed italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            "{enhancedResult}"
          </p>
        </div>
      )}

      {/* Quick Inspiration Chips */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-slate-400 flex items-center gap-1 text-[11px] font-medium">
          <Lightbulb className="w-3 h-3 text-amber-400" />
          {isId ? 'Inspirasi Cepat:' : 'Quick Sparks:'}
        </span>
        {getPresets().map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handlePresetClick(preset)}
            className={`text-left text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
              preset.isPro && isFree
                ? 'bg-amber-950/30 hover:bg-amber-900/50 text-amber-300 border-amber-800/50'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border-slate-800'
            }`}
          >
            {preset.isPro && (
              <span className="text-amber-400">
                {isFree ? <Lock className="w-2.5 h-2.5" /> : <Sparkles className="w-2.5 h-2.5 text-cyan-400" />}
              </span>
            )}
            <span>{preset.label}</span>
            {preset.isPro && (
              <span className="text-[9px] font-mono px-1 rounded bg-amber-950/80 text-amber-400 border border-amber-800/60 uppercase">
                PRO
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
