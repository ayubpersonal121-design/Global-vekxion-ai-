import React from 'react';
import { 
  Sparkles, 
  Layout, 
  Code2, 
  Network, 
  FileText, 
  Atom, 
  Palette, 
  Zap, 
  BrainCircuit, 
  Infinity, 
  UserCheck,
  Cpu,
  Lock
} from 'lucide-react';
import { CreationMode, IntelligenceTier, PersonaType } from '../types';

interface CreationControlsProps {
  mode: CreationMode;
  onSelectMode: (mode: CreationMode) => void;
  intelligenceTier: IntelligenceTier;
  onSelectIntelligenceTier: (tier: IntelligenceTier) => void;
  persona: PersonaType;
  onSelectPersona: (persona: PersonaType) => void;
  language: 'id' | 'en';
  isFree?: boolean;
  onRequireUpgrade?: (message: string) => void;
}

export const CreationControls: React.FC<CreationControlsProps> = ({
  mode,
  onSelectMode,
  intelligenceTier,
  onSelectIntelligenceTier,
  persona,
  onSelectPersona,
  language,
  isFree = false,
  onRequireUpgrade,
}) => {
  const isId = language !== 'en';

  const modes: { id: CreationMode; label: string; icon: React.ReactNode; desc: string; isPremium?: boolean }[] = [
    {
      id: 'omni',
      label: isId ? 'Universal Omni' : 'Universal Omni',
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      desc: isId ? 'Pembuat segala hal komprehensif' : 'Autonomous all-domain builder'
    },
    {
      id: 'web_app',
      label: isId ? 'Aplikasi Web & Sandbox' : 'Interactive Web App',
      icon: <Layout className="w-4 h-4 text-indigo-400" />,
      desc: isId ? 'Aplikasi interaktif yang jalan di sandbox langsung' : 'Live interactive sandbox widgets'
    },
    {
      id: 'code',
      label: isId ? 'Kode & Algoritma' : 'Code & Algorithms',
      icon: <Code2 className="w-4 h-4 text-emerald-400" />,
      desc: isId ? 'Python, TS, Rust, Go dengan unit tests' : 'Production-ready code & tests'
    },
    {
      id: 'architecture',
      label: isId ? 'Arsitektur Sistem' : 'System Architecture',
      icon: <Network className="w-4 h-4 text-amber-400" />,
      desc: isId ? 'Blueprint, skema DB, Mermaid & scaling' : 'Blueprints, schemas & diagrams'
    },
    {
      id: 'document',
      label: isId ? 'Dokumen & Bisnis' : 'Executive Documents',
      icon: <FileText className="w-4 h-4 text-blue-400" />,
      desc: isId ? 'Pitch deck, business plan & strategi VC' : 'Strategy briefs, whitepapers & decks'
    },
    {
      id: 'science',
      label: isId ? 'Sains & Matematika' : 'Science & Math',
      icon: <Atom className="w-4 h-4 text-purple-400" />,
      desc: isId ? 'Derivasi LaTeX, fisika & simulasi numerik' : 'Formulas, proofs & simulations'
    },
    {
      id: 'visual_art',
      label: isId ? 'Desain Grafis AI' : 'Visual Asset',
      icon: <Palette className="w-4 h-4 text-rose-400" />,
      desc: isId ? 'Generasi gambar visual & aset grafis' : 'AI image generation & creative visual',
      isPremium: true
    }
  ];

  const intelligenceTiers: { id: IntelligenceTier; title: string; subtitle: string; icon: React.ReactNode; isPremium?: boolean }[] = [
    {
      id: 'flash',
      title: 'Flash 3.8',
      subtitle: isId ? 'Sintesis Kilat (Gratis)' : 'Ultra-Fast (Free)',
      icon: <Zap className="w-3.5 h-3.5 text-amber-400" />
    },
    {
      id: 'reasoning_high',
      title: 'Cognitive Reasoning',
      subtitle: isId ? 'Penalaran Rantai Logika' : 'Chain-of-Thought',
      icon: <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />,
      isPremium: true
    },
    {
      id: 'astro_supreme',
      title: 'Astro Supreme 🌌',
      subtitle: isId ? 'Tingkat Tertinggi (o1/Astro)' : 'Apex Dual-Pass Reasoning',
      icon: <Infinity className="w-3.5 h-3.5 text-indigo-400" />,
      isPremium: true
    }
  ];

  const personas: { id: PersonaType; label: string; desc: string; isPremium?: boolean }[] = [
    {
      id: 'omni_architect',
      label: isId ? 'Omni Architect (Universal)' : 'Omni Architect (Universal)',
      desc: isId ? 'Sintesis holistik lintas domain (Standar)' : 'Holistic cross-disciplinary synthesis'
    },
    {
      id: 'fullstack_engineer',
      label: isId ? 'Principal Full-Stack Engineer [Pro]' : 'Principal Full-Stack Engineer [Pro]',
      desc: isId ? 'Arsitektur kode bersih, performa tinggi' : 'Robust scalable code & design patterns',
      isPremium: true
    },
    {
      id: 'uiux_designer',
      label: isId ? 'Chief Design Visionary [Pro]' : 'Chief Design Visionary [Pro]',
      desc: isId ? 'Estetika modern, micro-interaction' : 'Exquisite modern aesthetics & UX flow',
      isPremium: true
    },
    {
      id: 'vc_strategist',
      label: isId ? 'Tier-1 VC Partner & Strategist [Pro]' : 'Tier-1 VC Partner & Strategist [Pro]',
      desc: isId ? 'Unit economics, pasar & eksekusi' : 'Unit economics, defensibility & market fit',
      isPremium: true
    },
    {
      id: 'chief_scientist',
      label: isId ? 'Senior Research Scientist [Pro]' : 'Senior Research Scientist [Pro]',
      desc: isId ? 'Presisi matematis & metode ilmiah' : 'Mathematical rigor & scientific depth',
      isPremium: true
    },
    {
      id: 'creative_author',
      label: isId ? 'Master Creative Director [Pro]' : 'Master Creative Director [Pro]',
      desc: isId ? 'Narasi mendalam & worldbuilding' : 'Evocative storytelling & narrative lore',
      isPremium: true
    }
  ];

  const handleModeClick = (m: typeof modes[0]) => {
    if (m.isPremium && isFree) {
      onRequireUpgrade?.(isId ? `Mode ${m.label} adalah fitur Premium.` : `${m.label} is a Premium feature.`);
      return;
    }
    onSelectMode(m.id);
  };

  const handleTierClick = (t: typeof intelligenceTiers[0]) => {
    if (t.isPremium && isFree) {
      onRequireUpgrade?.(isId ? `Tingkat penalaran ${t.title} adalah fitur Premium.` : `${t.title} is a Premium feature.`);
      return;
    }
    onSelectIntelligenceTier(t.id);
  };

  const handlePersonaChange = (val: PersonaType) => {
    const selectedP = personas.find(p => p.id === val);
    if (selectedP?.isPremium && isFree) {
      onRequireUpgrade?.(isId ? `Persona spesialis ${selectedP.label} adalah fitur Premium.` : `${selectedP.label} is a Premium feature.`);
      return;
    }
    onSelectPersona(val);
  };

  return (
    <div className="space-y-4">
      {/* 1. Mode Selector Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isId ? '1. Pilih Domain Kreasi' : '1. Select Creation Domain'}</span>
          </label>
          <span className="text-[11px] text-slate-400">
            {modes.find(m => m.id === mode)?.desc}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 p-1.5 bg-slate-900/90 rounded-xl border border-slate-800">
          {modes.map((m) => {
            const isActive = mode === m.id;
            const isLocked = m.isPremium && isFree;
            return (
              <button
                key={m.id}
                onClick={() => handleModeClick(m)}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-center transition-all relative ${
                  isActive
                    ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 text-white border border-indigo-500/50 shadow-md shadow-indigo-950/50'
                    : isLocked
                    ? 'text-slate-500 hover:text-amber-300 hover:bg-slate-800/40 border border-transparent'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {isLocked && (
                  <span className="absolute top-1 right-1 p-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/60">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
                <div className={`p-1.5 rounded-md mb-1 ${isActive ? 'bg-indigo-500/20' : 'bg-slate-800/50'}`}>
                  {m.icon}
                </div>
                <span className="text-xs font-medium leading-tight line-clamp-1">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Intelligence Depth & Persona Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Intelligence Depth */}
        <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isId ? 'Tingkat Kecerdasan & Penalaran' : 'Intelligence & Reasoning Depth'}</span>
            </label>
            {isFree && (
              <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                <Lock className="w-3 h-3" /> Pro/Astro Locked
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {intelligenceTiers.map((t) => {
              const isActive = intelligenceTier === t.id;
              const isLocked = t.isPremium && isFree;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTierClick(t)}
                  className={`p-2 rounded-lg text-left transition-all flex flex-col justify-between relative ${
                    isActive
                      ? 'bg-indigo-600/20 border border-indigo-500/60 text-white shadow-sm'
                      : isLocked
                      ? 'bg-slate-950/40 border border-slate-800/80 text-slate-500 hover:border-amber-600/50 hover:text-amber-300'
                      : 'bg-slate-950/50 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {isLocked && (
                    <span className="absolute top-1.5 right-1.5 text-amber-400">
                      <Lock className="w-3 h-3" />
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 mb-1">
                    {t.icon}
                    <span className="text-xs font-bold leading-none">{t.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 leading-tight">{t.subtitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Persona Selector */}
        <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isId ? 'Spesialisasi Otak AI (Persona)' : 'AI Persona Architect'}</span>
            </label>
          </div>

          <div className="relative">
            <select
              value={persona}
              onChange={(e) => handlePersonaChange(e.target.value as PersonaType)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} — {p.desc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
