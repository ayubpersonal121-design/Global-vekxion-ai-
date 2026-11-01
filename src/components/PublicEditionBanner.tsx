import React from 'react';
import { Globe, Share2, Sparkles, Crown, Download, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

interface PublicEditionBannerProps {
  isAdmin?: boolean;
  onOpenPublicLinkHub: () => void;
  onOpenPricing: () => void;
  onOpenInstall: () => void;
  onSwitchToDeveloperEdition?: () => void;
}

export const PublicEditionBanner: React.FC<PublicEditionBannerProps> = ({
  isAdmin = false,
  onOpenPublicLinkHub,
  onOpenPricing,
  onOpenInstall,
  onSwitchToDeveloperEdition
}) => {
  return (
    <div className="bg-gradient-to-r from-sky-950/80 via-[#131627] to-indigo-950/80 border-b border-sky-500/40 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs flex-wrap z-20 shadow-lg shadow-black/40">
      {/* Brand & Status */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
        </span>

        <div className="flex items-center gap-1.5 font-bold text-sky-300">
          <Globe className="w-4 h-4 text-sky-400" />
          <span>VERSI PUBLIK RESMI (LIVE PUBLIC EDITION)</span>
        </div>

        <span className="hidden md:inline text-neutral-400 text-[11px] border-l border-neutral-700 pl-2">
          Mode Pengguna Terbuka • Siap Diakses Klien &amp; Tamu
        </span>
      </div>

      {/* Quick Action Badges */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenPublicLinkHub}
          className="px-2.5 sm:px-3 py-1 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
          title="Buka Pusat Link Publik Branded (Bukan Ais Dev/Ais Pre)"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Link Publik Branded</span>
        </button>

        <button
          onClick={onOpenPricing}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-semibold transition-all cursor-pointer"
        >
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>Paket Layanan</span>
        </button>

        {isAdmin && onSwitchToDeveloperEdition && (
          <button
            onClick={onSwitchToDeveloperEdition}
            className="px-2.5 py-1 rounded-xl bg-amber-950/70 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            title="Kembali ke Mode Developer Pemilik"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Kembali ke</span> Versi Developer
          </button>
        )}
      </div>
    </div>
  );
};
