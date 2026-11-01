import React, { useState } from 'react';
import { 
  PanelLeft, 
  Crown, 
  Download, 
  KeyRound, 
  Sparkles, 
  Plus, 
  ShieldCheck, 
  Zap, 
  Share2, 
  Check, 
  Globe,
  Flame,
  Smartphone,
  Monitor,
  Usb,
  Clock,
  Radio,
  Tv
} from 'lucide-react';
import { ParticleLogo } from './ParticleLogo';
import { PlanId, AppEdition, DeviceTarget } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  currentPlanId: PlanId;
  isAdmin?: boolean;
  isArgonUnlocked?: boolean;
  isFree?: boolean;
  freeMessagesUsed?: number;
  freeMessageLimit?: number;
  onOpenPricing: () => void;
  onOpenAdmin: () => void;
  onOpenInstall: () => void;
  onOpenRouterBridge?: () => void;
  onOpenPasscode5H?: () => void;
  onOpenPublicLinkHub?: () => void;
  onOpenDolphyLab?: () => void;
  onOpenTvRemoteModal?: (initialBrand?: string) => void;
  onNewChat: () => void;
  appEdition?: AppEdition;
  onToggleAppEdition?: (edition: AppEdition) => void;
  targetDevice?: DeviceTarget;
  onSelectTargetDevice?: (device: DeviceTarget) => void;
  versionTag?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isSidebarOpen,
  currentPlanId,
  isAdmin = false,
  isArgonUnlocked = false,
  isFree = false,
  freeMessagesUsed = 0,
  freeMessageLimit = 3,
  onOpenPricing,
  onOpenAdmin,
  onOpenInstall,
  onOpenRouterBridge,
  onOpenPasscode5H,
  onOpenPublicLinkHub,
  onOpenDolphyLab,
  onOpenTvRemoteModal,
  onNewChat,
  appEdition = 'public',
  onToggleAppEdition,
  targetDevice = 'auto',
  onSelectTargetDevice,
  versionTag = 'v3.6.0'
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  const handleShare = async () => {
    try {
      const shareData = {
        title: 'Global Pixel AI',
        text: 'Global Pixel AI – Apex-tier generative AI workspace untuk simulasi aplikasi interaktif, game canvas, website, dan strategi iklan bisnis.',
        url: window.location.href,
      };
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      }
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-neutral-800/80 bg-[#141414] px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 select-none">
      {/* Zone 1: Sidebar Toggle & Brand Title */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          title={isSidebarOpen ? 'Collapse Sidebar' : 'Open Sidebar'}
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        <ParticleLogo />

        {/* Dynamic Model Status Tag */}
        {isArgonUnlocked || isAdmin ? (
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-sky-950/80 to-indigo-950/80 border border-sky-500/40 text-sky-300 text-[11px] font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>AI Argon & 4 Astro Aktif</span>
            {isAdmin && <span className="text-[9px] bg-amber-500/30 text-amber-200 px-1.5 py-0.5 rounded font-mono ml-1">VIP</span>}
          </div>
        ) : (
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 text-[11px] font-medium">
            <Zap className="w-3 h-3 text-neutral-400" />
            <span>Gemini & ChatGPT Core</span>
          </div>
        )}
      </div>

      {/* Zone 2: Edition Switcher & Cross-Platform Device Controllers */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Mode Status: If Admin/Developer, allow toggle/preview. If Public, show clean public badge (NO switching controls!) */}
        {isAdmin ? (
          <div className="flex items-center p-1 rounded-xl bg-[#1c1d27] border border-amber-500/50 shadow-inner">
            <button
              onClick={() => onToggleAppEdition?.('developer')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                appEdition === 'developer'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30 font-extrabold animate-pulse'
                  : 'text-neutral-400 hover:text-amber-300'
              }`}
              title="Mode Developer (Pemilik PWA/AI Aktif)"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Versi Developer</span>
            </button>

            <button
              onClick={() => onToggleAppEdition?.('public')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                appEdition === 'public'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Preview Tampilan Pengguna Publik"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preview Publik</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenPublicLinkHub}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-sky-500/40 text-xs text-neutral-300 hover:text-white font-medium transition-all cursor-pointer"
            title="Klik untuk membuka Pusat Tautan Resmi Versi Publik"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>Versi Publik</span>
          </button>
        )}

        {/* Device Switcher (Handphone & Windows PC Control) */}
        <div className="hidden lg:flex items-center p-1 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
          <button
            onClick={() => onSelectTargetDevice?.('mobile')}
            className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer text-[11px] ${
              targetDevice === 'mobile'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Optimasi Tampilan Handphone"
          >
            <Smartphone className="w-3 h-3 text-emerald-400" />
            <span>Handphone</span>
          </button>

          <button
            onClick={() => onSelectTargetDevice?.('windows')}
            className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer text-[11px] ${
              targetDevice === 'windows'
                ? 'bg-sky-950 text-sky-300 border border-sky-500/40 font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
            title="Optimasi Tampilan Windows Desktop"
          >
            <Monitor className="w-3 h-3 text-sky-400" />
            <span>Windows</span>
          </button>
        </div>
      </div>

      {/* Zone 3: Actions & Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        
        {/* =========================================================================
            TOMBOL DEVELOPER / ADMIN DI HEADER (WAJIB ADA DI KEDUA VERSI)
            Instruksi Spesifik: "Kedua versi tadi tetaplah pasang memasang tombol 
            developer/admin header!"
            ========================================================================= */}
        <button
          onClick={onOpenAdmin}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 whitespace-nowrap ${
            appEdition === 'developer' || isAdmin
              ? 'border-amber-500/70 bg-gradient-to-r from-amber-950/90 to-amber-900/90 text-amber-300 hover:border-amber-400 shadow-amber-950/50'
              : 'border-neutral-700/80 bg-[#1c1d27] hover:bg-[#252736] text-neutral-200 hover:text-amber-300'
          }`}
          title="Buka Pusat Update Aplikasi/Web & Panel Developer Administrator"
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="hidden sm:inline">Developer / Admin</span>
          <span className="sm:hidden text-[11px]">Dev / Admin</span>
        </button>

        {/* Quick New Chat button */}
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 text-xs text-neutral-200 font-semibold transition-all cursor-pointer shadow-sm"
          title="Mulai Percakapan Baru"
        >
          <Plus className="w-4 h-4 text-sky-400" />
          <span className="hidden md:inline">Chat Baru</span>
        </button>

        {/* Quick USB Router Bridge Status Button (Tetap dipertahankan persis seperti awal) */}
        <button
          onClick={onOpenRouterBridge}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-xs text-cyan-300 font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
          title="Status Koneksi USB Router Wi-Fi & Penambatan HP"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <Usb className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden lg:inline text-[11px]">USB Router</span>
        </button>

        {/* Dolphy Wireless & Protocol Lab Button (Flipper Zero .IR, BLE, NFC, Wi-Fi Spectrum) */}
        <button
          onClick={onOpenDolphyLab}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border border-orange-500/50 bg-gradient-to-r from-orange-950/70 to-amber-950/70 hover:from-orange-900/80 hover:to-amber-900/80 text-xs text-orange-300 font-bold transition-all cursor-pointer shadow-md active:scale-95 whitespace-nowrap"
          title="Buka Dolphy Wireless & Protocol Lab (Infrared .IR, BLE, NFC, Wi-Fi Spectrum v2.6)"
        >
          <span className="text-xs">🐬</span>
          <Radio className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
          <span className="hidden lg:inline text-[11px]">Dolphy Lab</span>
        </button>

        {/* Universal TV Remote Control Button (Remot TV Apapun) */}
        <button
          onClick={() => onOpenTvRemoteModal?.('toshiba')}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border border-rose-500/50 bg-gradient-to-r from-rose-950/70 to-amber-950/70 hover:from-rose-900/80 hover:to-amber-900/80 text-xs text-rose-300 font-bold transition-all cursor-pointer shadow-md active:scale-95 whitespace-nowrap"
          title="Buka Remot TV Universal (Toshiba, Samsung, LG, Sony, Xiaomi, Polytron, Sharp, dll.)"
        >
          <Tv className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span className="hidden sm:inline text-[11px]">Remot TV</span>
          <span className="sm:hidden text-[10px]">Remot</span>
        </button>

        {/* Fitur Pembuatan & Penukaran Kode Sekali Pakai 5 Jam */}
        <button
          onClick={onOpenPasscode5H}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-950/70 to-orange-950/70 hover:from-amber-900/80 hover:to-orange-900/80 text-xs text-amber-300 font-bold transition-all cursor-pointer shadow-md active:scale-95 whitespace-nowrap"
          title="Buat atau Tukarkan Kode Akses Sekali Pakai (Berlaku 5 Jam)"
        >
          <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="hidden sm:inline">Kode 5 Jam</span>
          <span className="sm:hidden text-[11px]">Kode 5J</span>
        </button>

        {/* Pusat Tautan Publik Branded Button (Bukan ais-dev / ais-pre) */}
        <button
          onClick={onOpenPublicLinkHub || handleShare}
          className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-sky-500/50 bg-gradient-to-r from-sky-950/70 to-indigo-950/70 hover:from-sky-900/80 hover:to-indigo-900/80 text-xs text-sky-300 font-bold transition-all cursor-pointer shadow-md active:scale-95 whitespace-nowrap"
          title="Buka Pusat Tautan Publik Branded & Custom Domain (Bukan Ais Dev / Ais Pre)"
        >
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span>Link Publik</span>
        </button>

        {/* Prominent Universal Download App Button (PWA Auto-Installer Handphone & Windows) */}
        <button
          onClick={onOpenInstall}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-950/70 via-teal-950/70 to-emerald-950/70 hover:from-emerald-900/80 hover:to-teal-900/80 text-xs text-emerald-300 font-bold transition-all shadow-md shadow-emerald-950/60 cursor-pointer active:scale-95 whitespace-nowrap"
          title="Download App / Pasang ke Layar Utama Handphone atau Desktop Windows (PWA)"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">Download App</span>
          <span className="sm:hidden">Install</span>
        </button>

        {/* Plan Status / Upgrade Button */}
        <button
          onClick={onOpenPricing}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap shrink-0 ${
            currentPlanId === 'vip_argon_astro_8m' || currentPlanId === 'titan_700k' || (isAdmin && currentPlanId !== 'free')
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-black shadow-amber-500/20'
              : isFree
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-sky-500/20'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
          }`}
        >
          <Crown className={`w-3.5 h-3.5 ${currentPlanId === 'vip_argon_astro_8m' || currentPlanId === 'titan_700k' || isAdmin ? 'text-black fill-black' : 'text-amber-300 fill-amber-300'}`} />
          <span className="hidden sm:inline">
            {isAdmin || currentPlanId === 'titan_700k'
              ? '🌟 Titan VIP Pro' 
              : currentPlanId === 'vip_argon_astro_8m' 
              ? 'VIP Argon & 4 Astro' 
              : isFree 
              ? `Upgrade (${freeMessagesUsed}/${freeMessageLimit})` 
              : 'Premium Aktif'}
          </span>
          <span className="sm:hidden">
            {isAdmin || currentPlanId === 'titan_700k' ? 'VIP' : isFree ? 'Upgrade' : 'Pro'}
          </span>
        </button>
      </div>
    </header>
  );
};
