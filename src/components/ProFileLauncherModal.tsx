import React from 'react';
import { 
  X, 
  Play, 
  Lock, 
  Crown, 
  Sparkles, 
  Layers, 
  FileCode, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { CreationItem } from '../types';

export interface ProTemplate {
  id: string;
  title: string;
  category: string;
  badge: string;
  description: string;
  tags: string[];
  codeSnippet: string;
}

export const PRO_TEMPLATES: ProTemplate[] = [
  {
    id: 'pro-saas-dashboard',
    title: 'Enterprise AI SaaS Analytics & Billing Dashboard',
    category: 'Full-Stack Web App',
    badge: 'Pro Flagship',
    description: 'Dashboard multi-tenant interaktif dengan analitik real-time, grafik SVG responsif, manajemen token API, dan simulasi penagihan Stripe/Midtrans.',
    tags: ['React', 'Tailwind', 'SVG Charts', 'Sandbox Ready'],
    codeSnippet: `<!DOCTYPE html>
<html lang="id" class="dark">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>body{font-family:system-ui,sans-serif;background:#030712;color:#f3f4f6;}</style>
</head>
<body class="p-6">
  <div class="max-w-4xl mx-auto space-y-4">
    <div class="flex items-center justify-between border-b border-slate-800 pb-4">
      <div>
        <h1 class="text-xl font-bold text-white">VEXION AI Enterprise Console</h1>
        <p class="text-xs text-slate-400">Arsitektur & Peluncur Berkas Produksi Tingkat Lanjut karya Ayyub Kenda Pratama</p>
      </div>
      <span class="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 text-xs font-mono border border-emerald-800">ONLINE · 99.99%</span>
    </div>
    <div class="grid grid-cols-3 gap-3">
      <div class="p-4 bg-slate-900 rounded-xl border border-slate-800"><div class="text-xs text-slate-400">Total Permintaan</div><div class="text-2xl font-bold text-cyan-400">1,248,900</div></div>
      <div class="p-4 bg-slate-900 rounded-xl border border-slate-800"><div class="text-xs text-slate-400">Latency P99</div><div class="text-2xl font-bold text-emerald-400">14.2 ms</div></div>
      <div class="p-4 bg-slate-900 rounded-xl border border-slate-800"><div class="text-xs text-slate-400">Efisiensi Biaya</div><div class="text-2xl font-bold text-indigo-400">+42.8%</div></div>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'pro-gravity-engine',
    title: 'Neon Orbit 3D Gravitational Field Physics Engine',
    category: 'Interactive Physics Sandbox',
    badge: 'High Performance',
    description: 'Simulasi interaktif n-body gravitational mechanics dengan visualisasi partikel neon bercahaya, penyesuaian gravitasi real-time, dan deteksi tumbukan.',
    tags: ['Canvas 60FPS', 'Vector Math', 'Physics Engine'],
    codeSnippet: `<!DOCTYPE html><html><body style="margin:0;background:#000;color:#fff;overflow:hidden;"><canvas id="c"></canvas><script>const c=document.getElementById('c'),x=c.getContext('2d');c.width=window.innerWidth;c.height=window.innerHeight;x.fillStyle="#00f3ff";x.fillText("Neon Orbit Pro Engine Active",20,30);</script></body></html>`
  },
  {
    id: 'pro-trading-algo',
    title: 'High-Frequency Order Book & Execution Simulator',
    category: 'Algorithms & Quantitative Math',
    badge: 'Quant Special',
    description: 'Mesin pencocokan pesanan limit order book mikrodetik, simulasi spread bid/ask, dan analisis Monte Carlo untuk volatilitas pasar.',
    tags: ['TypeScript', 'Quant Math', 'Zero-Allocation'],
    codeSnippet: `// High-Frequency Order Book Matching Engine\nexport class OrderBook { private bids = new Map(); private asks = new Map(); }`
  },
  {
    id: 'pro-microservices-blueprint',
    title: 'Global Resilient Microservices with Event Sourcing & CQRS',
    category: 'System Architecture',
    badge: 'Ultra Architect',
    description: 'Blueprint lengkap arsitektur 100,000 req/detik, Kafka event streaming, isolasi database read/write CQRS, dan diagram visual.',
    tags: ['Kafka', 'CQRS', 'PostgreSQL', 'Docker'],
    codeSnippet: `graph TD\n  Client[API Gateway] --> Ingest[Event Ingestion Service]\n  Ingest --> Kafka[Kafka Cluster 100k msg/s]\n  Kafka --> Workers[Async Worker Cluster]`
  }
];

interface ProFileLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFree: boolean;
  onRequireUpgrade: (message: string) => void;
  onLaunchTemplate: (template: ProTemplate) => void;
  language: 'id' | 'en';
}

export const ProFileLauncherModal: React.FC<ProFileLauncherModalProps> = ({
  isOpen,
  onClose,
  isFree,
  onRequireUpgrade,
  onLaunchTemplate,
  language,
}) => {
  if (!isOpen) return null;
  const isId = language !== 'en';

  const handleLaunch = (template: ProTemplate) => {
    if (isFree) {
      onClose();
      onRequireUpgrade(
        isId 
          ? `Pro File Launcher ("${template.title}") adalah fitur Premium terkunci.`
          : `Pro File Launcher ("${template.title}") is a locked Premium feature.`
      );
      return;
    }
    onLaunchTemplate(template);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative my-auto animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-left mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-950/80 to-indigo-950/80 border border-amber-500/40 text-amber-300 text-xs font-semibold mb-2">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Pro File Launcher · Peluncur Berkas & Proyek Produksi</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Peluncur Berkas Pro (Pro File Launcher)</span>
            {isFree && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800/80 font-mono font-normal flex items-center gap-1">
                <Lock className="w-3 h-3" /> Premium Lock
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
            Jalankan berkas dan arsitektur aplikasi web tingkat lanjut secara instan langsung ke Live Sandbox tanpa kompilasi manual.
          </p>
        </div>

        {/* Free Tier Warning Banner */}
        {isFree && (
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-600/40 flex items-start gap-3 text-xs text-amber-200 shadow-md">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-300 text-sm block">Akses Pro File Launcher Terkunci untuk Akun Gratis</span>
              <p className="text-slate-300 leading-relaxed">
                Anda sedang menggunakan tier Gratis. Klik salah satu berkas di bawah untuk membuka Checkout Modal Pembayaran Manual (GoPay / DANA) dan mengaktifkan akses premium mulai dari Rp 50.000.
              </p>
            </div>
          </div>
        )}

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[55vh] overflow-y-auto pr-1">
          {PRO_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-3 transition-all relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-semibold">
                    {tmpl.category}
                  </span>
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                    {tmpl.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {tmpl.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {tmpl.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {tmpl.tags.map((t, i) => (
                    <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleLaunch(tmpl)}
                className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isFree
                    ? 'bg-amber-950/50 hover:bg-amber-900/60 border border-amber-600/50 text-amber-300'
                    : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-md shadow-cyan-950/40'
                }`}
              >
                {isFree ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Luncurkan Berkas Pro [Terkunci]</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Luncurkan ke Live Sandbox</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>VEXION AI Pro Launcher · Developer: Ayyub Kenda Pratama</span>
          <button
            onClick={() => {
              onClose();
              onRequireUpgrade('Buka paket langganan Premium untuk akses semua berkas.');
            }}
            className="text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            Lihat Paket Pembayaran (Rp 50rb - 700rb) →
          </button>
        </div>
      </div>
    </div>
  );
};
