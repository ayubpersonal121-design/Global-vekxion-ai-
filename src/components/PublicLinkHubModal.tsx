import React, { useState } from 'react';
import { 
  X, 
  Globe, 
  Copy, 
  Check, 
  Share2, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  QrCode, 
  Server, 
  ArrowRight,
  Flame,
  CheckCircle2,
  SlidersHorizontal,
  Save
} from 'lucide-react';
import { getCustomPublicDomain, saveCustomPublicDomain } from '../utils/safeStorage';

interface PublicLinkHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToPublicEdition: () => void;
  isCurrentlyPublic: boolean;
}

export const PublicLinkHubModal: React.FC<PublicLinkHubModalProps> = ({
  isOpen,
  onClose,
  onSwitchToPublicEdition,
  isCurrentlyPublic
}) => {
  const [customDomain, setCustomDomain] = useState<string>(() => getCustomPublicDomain());
  const [isEditingDomain, setIsEditingDomain] = useState(false);
  const [domainInput, setDomainInput] = useState(customDomain);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const cleanDomain = customDomain || 'globalpixelai.com';
  
  // Branded links (completely distinct from raw internal Cloud Run ais-dev / ais-pre links!)
  const links = [
    {
      id: 'brand_primary',
      title: 'Domain Publik Utama (Branded)',
      url: `https://${cleanDomain}`,
      tag: 'Domain Resmi',
      badgeColor: 'border-emerald-500/50 bg-emerald-950/60 text-emerald-300',
      description: 'Alamat resmi publik untuk promosi, kartu nama, bio media sosial, dan branding global tanpa embel-embel Cloud Run teknis.'
    },
    {
      id: 'portal_direct',
      title: 'Tautan Portal Publik Langsung',
      url: `https://${cleanDomain}/public`,
      tag: 'Langsung Mode Publik',
      badgeColor: 'border-sky-500/50 bg-sky-950/60 text-sky-300',
      description: 'Membuka aplikasi langsung ke Tampilan Pengguna Publik bersih tanpa bar rahasia atau kontrol developer.'
    },
    {
      id: 'app_route_live',
      title: 'Tautan Rute Lokal Langsung',
      url: `${origin}/public`,
      tag: 'Rute Path /public',
      badgeColor: 'border-purple-500/50 bg-purple-950/60 text-purple-300',
      description: 'Rute khusus di hosting saat ini yang otomatis mengunci sesi ke Versi Publik mandiri.'
    },
    {
      id: 'shortlink',
      title: 'Shortlink Cepat (Vanity Link)',
      url: 'https://pixelads.ai/live',
      tag: 'Ringkas & Mudah Dihafal',
      badgeColor: 'border-amber-500/50 bg-amber-950/60 text-amber-300',
      description: 'Tautan pendek untuk SMS, chat singkat WhatsApp, iklan TikTok/Instagram Stories.'
    }
  ];

  const handleCopy = (key: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSaveDomain = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = domainInput.trim().toLowerCase().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    if (clean) {
      saveCustomPublicDomain(clean);
      setCustomDomain(clean);
      setIsEditingDomain(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleShareWhatsApp = () => {
    const primaryUrl = `https://${cleanDomain}`;
    const text = `🌟 *Global Pixel AI – Aplikasi & Workspace AI Generatif Publik*\n\nKini Anda bisa menggunakan kecerdasan AI untuk:\n• Generator Aplikasi Web & Toko Online Langsung Jadi\n• Pembuat Game Interaktif Canvas\n• Strategi Iklan Digital & Desain Otomatis\n• Percakapan Cerdas Gemini & ChatGPT Core\n\nBuka langsung di tautan publik resmi:\n👉 *${primaryUrl}*\n(Atau portal akses: ${origin}/public)\n\n_Bisa diakses langsung dari browser Handphone (Android/iOS) maupun Windows PC!_`;
    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div 
        className="w-full max-w-2xl max-h-[92vh] bg-[#121217] border border-sky-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-gradient-to-r from-sky-950/70 via-[#161726] to-indigo-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/40 flex items-center justify-center shadow-lg shadow-sky-500/10">
              <Globe className="w-5 h-5 text-sky-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Pusat Tautan Publik &amp; Custom Domain
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 border border-sky-500/40 text-sky-300 font-bold">
                  Branded URLs
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Tautan profesional siap sebar untuk publik (Bukan link teknis Google Cloud Run ais-dev / ais-pre)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Versi Publik Status Switcher Banner */}
        <div className="bg-[#181926] border-b border-neutral-800 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
            <div>
              <span className="text-neutral-300 font-medium">Status Aplikasi Saat Ini: </span>
              <span className={`font-bold ${isCurrentlyPublic ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isCurrentlyPublic ? '🌐 Mode Versi Publik Aktif' : '👑 Mode Developer Aktif'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCurrentlyPublic ? (
              <button
                onClick={() => {
                  onSwitchToPublicEdition();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                title="Beralih ke tampilan yang dilihat oleh publik"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Lihat / Beralih ke Versi Publik</span>
              </button>
            ) : (
              <span className="text-[11px] text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-semibold">
                ✓ Pengunjung melihat tampilan publik murni
              </span>
            )}
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[calc(92vh-180px)]">
          {/* Custom Domain Bar & Notice */}
          <div className="bg-gradient-to-r from-sky-950/30 to-indigo-950/30 border border-sky-500/30 rounded-xl p-3 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                Domain Publik Terhubung: <span className="font-mono text-white underline">https://{cleanDomain}</span>
              </span>
              <button
                onClick={() => setIsEditingDomain(!isEditingDomain)}
                className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>{isEditingDomain ? 'Batal Ubah' : 'Ganti Domain Pribadi'}</span>
              </button>
            </div>

            {isEditingDomain && (
              <form onSubmit={handleSaveDomain} className="pt-2 flex items-center gap-2 animate-fadeIn">
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="Contoh: globalpixelai.com atau ai.namabisnismu.com"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-sky-500/50 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-sky-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan</span>
                </button>
              </form>
            )}

            {savedSuccess && (
              <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Domain custom berhasil disimpan! Semua tautan di bawah otomatis diperbarui.</span>
              </div>
            )}

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              💡 <strong>Catatan Khusus:</strong> URL internal seperti <code className="text-neutral-300 bg-neutral-900 px-1 py-0.5 rounded">ais-dev-...</code> dan <code className="text-neutral-300 bg-neutral-900 px-1 py-0.5 rounded">ais-pre-...</code> adalah alamat kontainer Cloud Run sementara. Untuk keperluan pengguna publik, gunakan tautan resmi yang telah dibersihkan di bawah ini.
            </p>
          </div>

          {/* Links List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Pilihan Tautan Publik Siap Bagikan</span>
            </h3>

            {links.map((item) => (
              <div 
                key={item.id}
                className="bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 rounded-xl p-3 sm:p-4 space-y-2 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs sm:text-sm">
                      {item.title}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${item.badgeColor}`}>
                      {item.tag}
                    </span>
                  </div>
                </div>

                {/* URL Bar */}
                <div className="flex items-center gap-2 bg-[#0c0d12] border border-neutral-800 rounded-xl p-2 sm:p-2.5">
                  <span className="font-mono text-xs sm:text-sm text-sky-300 flex-1 select-all truncate">
                    {item.url}
                  </span>

                  <button
                    onClick={() => handleCopy(item.id, item.url)}
                    className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                    title="Salin Tautan"
                  >
                    {copiedKey === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* WhatsApp & Quick Share Section */}
          <div className="bg-gradient-to-br from-emerald-950/40 to-teal-950/30 border border-emerald-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="font-bold text-emerald-300 text-xs sm:text-sm flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Bagikan ke WhatsApp dengan Format Profesional</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Mengirimkan pesan promosi siap kirim dengan tautan resmi <strong className="text-white">https://{cleanDomain}</strong> ke calon pengguna atau grup.
              </p>
            </div>

            <button
              onClick={handleShareWhatsApp}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan via WhatsApp</span>
            </button>
          </div>

          {/* DNS / Custom Domain Setup Guide */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="font-bold text-neutral-300 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-sky-400" />
              <span>Panduan Menghubungkan Domain Sendiri (Bila punya domain di Niagahoster/GoDaddy/Cloudflare):</span>
            </div>
            <div className="font-mono text-[11px] bg-black/60 p-2.5 rounded-lg border border-neutral-800 space-y-1 text-neutral-300">
              <div>Type: <strong>CNAME</strong> | Name/Host: <strong>@</strong> atau <strong>ai</strong></div>
              <div>Target: <strong>ghs.googlehosted.com</strong> (Proxy: Aktif / DNS Only)</div>
            </div>
            <p className="text-[11px] text-neutral-400">
              Setelah DNS tersambung, domain Anda langsung aktif menggantikan seluruh alamat teknis default.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-neutral-800 bg-[#0c0d12] flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
            <span>Global Pixel AI Dedicated Public Routing</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
