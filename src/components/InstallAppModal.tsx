import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Smartphone, 
  Monitor, 
  Apple, 
  CheckCircle2, 
  Share, 
  Sparkles, 
  Bell, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'id' | 'en';
  deferredPrompt?: BeforeInstallPromptEvent | null;
  onInstalledSuccess?: () => void;
  isFree?: boolean;
  onRequireUpgrade?: (reason: string) => void;
  onDownloadComplete?: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  language,
  deferredPrompt = null,
  onInstalledSuccess,
  isFree = false,
  onRequireUpgrade,
  onDownloadComplete,
}) => {
  const isId = language === 'id';
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop'>('android');
  const [installing, setInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode
    const standaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standaloneMode);

    // Detect User Agent
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform('ios');
    } else if (/android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setInstalling(true);
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setInstallSuccess(true);
          onInstalledSuccess?.();
        }
      } catch (err) {
        console.error('PWA Install Error:', err);
      } finally {
        setInstalling(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 animate-fadeIn">
      <div 
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-2xl shadow-emerald-950/40 text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Download className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {isId ? 'Pasang VEXION AI Sebagai Aplikasi' : 'Install VEXION AI as an App'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                  PWA Ready
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {isId 
                  ? 'Pasang langsung di layar utama HP atau Komputer Anda seperti aplikasi resmi' 
                  : 'Install directly to your phone or desktop home screen like a native app'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Status Box: Standalone vs Not Installed */}
          {isStandalone || installSuccess ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-300 text-sm">
                    {isId ? 'Aplikasi VEXION AI Aktif' : 'VEXION AI App Active'}
                  </p>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    {isId 
                      ? 'VEXION AI telah terintegrasi di perangkat Anda. Sistem kecerdasan dan seluruh pembaruan telah sinkron.' 
                      : 'VEXION AI is currently active on your device with latest system updates.'}
                  </p>
                </div>
              </div>

              {/* Tips Memperbarui Nama Ikon di Layar Utama HP */}
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{isId ? 'Cara Memperbarui Nama Ikon di Layar Beranda HP:' : 'How to Update Icon Name on Phone Home Screen:'}</span>
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  {isId 
                    ? 'Launcher Android (seperti Xiaomi / MIUI / HyperOS) menyimpan teks pintasan lama dari saat pertama kali dipasang. Untuk mengganti nama ikon di layar beranda menjadi "VEXION AI":' 
                    : 'Android launcher caches the shortcut name from initial installation. To refresh it to "VEXION AI":'}
                </p>
                <ol className="list-decimal list-inside text-[11px] text-amber-200/90 space-y-1 pl-1">
                  <li>{isId ? 'Hapus/buang ikon pintasan lama "GlobalPixel" dari layar beranda HP Anda.' : 'Remove the old "GlobalPixel" shortcut from your phone home screen.'}</li>
                  <li>{isId ? 'Buka tautan web ini di Google Chrome HP Anda.' : 'Open this link in Google Chrome on your phone.'}</li>
                  <li>{isId ? 'Ketuk menu titik tiga (⋮) Chrome lalu pilih "Tambahkan ke Layar Utama" / "Instal Aplikasi".' : 'Tap Chrome menu (⋮) and choose "Add to Home Screen" / "Install App".'}</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#171717] border border-neutral-800">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-pink-500 flex items-center justify-center shadow-lg p-2 shrink-0">
                    <img src="/icon.svg" alt="App Icon" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">VEXION AI</h3>
                    <p className="text-xs text-neutral-400">
                      {isId ? 'Kecerdasan Tingkat Tinggi Gemini & ChatGPT' : 'High-Level Conversational & Ad Engine'}
                    </p>
                  </div>
                </div>

                {deferredPrompt ? (
                  <button
                    onClick={handleInstallClick}
                    disabled={installing}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{installing ? (isId ? 'Memproses...' : 'Processing...') : (isId ? 'Pasang Sekarang (1-Klik)' : 'Install Now (1-Click)')}</span>
                  </button>
                ) : (
                  <span className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 font-mono">
                    {isId ? 'Panduan Manual di Bawah' : 'See Instructions Below'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Platform Tab Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">
                {isId ? 'Petunjuk Pemasangan Sesuai Perangkat Anda:' : 'Installation Guide for Your Device:'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPlatform('android')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  platform === 'android'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-semibold shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-xs">Android</span>
              </button>
              <button
                onClick={() => setPlatform('ios')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  platform === 'ios'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-semibold shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Apple className="w-4 h-4" />
                <span className="text-xs">iPhone / iPad</span>
              </button>
              <button
                onClick={() => setPlatform('desktop')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  platform === 'desktop'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-semibold shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span className="text-xs">Laptop / PC</span>
              </button>
            </div>
          </div>

          {/* Platform Instructions Details */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            {platform === 'android' && (
              <>
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wide">
                  <Smartphone className="w-4 h-4" />
                  <span>{isId ? 'Cara Pasang di Handphone Android (Google Chrome / Edge):' : 'How to Install on Android:'}</span>
                </div>
                <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                  <li>
                    <strong className="text-white">{isId ? 'Langkah 1:' : 'Step 1:'}</strong> {isId ? 'Buka website ini di Google Chrome / Edge di HP Anda.' : 'Open this site in Chrome/Edge on your mobile device.'}
                  </li>
                  <li>
                    <strong className="text-white">{isId ? 'Langkah 2:' : 'Step 2:'}</strong> {isId ? 'Tekan ikon titik tiga (⋮) di pojok kanan atas browser.' : 'Tap the three-dots menu icon (⋮) in the top-right corner.'}
                  </li>
                  <li>
                    <strong className="text-white">{isId ? 'Langkah 3:' : 'Step 3:'}</strong> {isId ? 'Pilih menu "Tambahkan ke Layar Utama" (Add to Home screen) atau "Instal Aplikasi".' : 'Select "Add to Home screen" or "Install App".'}
                  </li>
                  <li>
                    <strong className="text-white">{isId ? 'Selesai:' : 'Finished:'}</strong> {isId ? 'Ikon VEXION AI otomatis muncul di layar utama HP Anda dan dapat dibuka tanpa browser URL bar!' : 'The VEXION AI icon appears on your home screen and launches without browser address bar!'}
                  </li>
                </ol>
              </>
            )}

            {platform === 'ios' && (
              <>
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wide">
                  <Apple className="w-4 h-4" />
                  <span>{isId ? 'Cara Pasang di iPhone & iPad (Safari Browser):' : 'How to Install on iOS Safari:'}</span>
                </div>
                <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                  <li>
                    <strong className="text-white">{isId ? 'Langkah 1:' : 'Step 1:'}</strong> {isId ? 'Buka website ini menggunakan browser Safari di iPhone/iPad.' : 'Open this site using Safari browser on your iOS device.'}
                  </li>
                  <li>
                    <strong className="text-white">{isId ? 'Langkah 2:' : 'Step 2:'}</strong> {isId ? 'Tekan tombol "Bagikan" (Ikon kotak dengan panah ke atas di bilah bawah Safari).' : 'Tap the "Share" button (box with upward arrow icon at the bottom of Safari).'}
                  </li>
                  <li>
                    <strong className="text-white">{isId ? 'Langkah 3:' : 'Step 3:'}</strong> {isId ? 'Gulir ke bawah pada menu bagikan, lalu pilih "Tambah ke Layar Utama" (Add to Home Screen).' : 'Scroll down and tap "Add to Home Screen".'}
                  </li>
                  <li>
                    <strong className="text-white">{isId ? 'Langkah 4:' : 'Step 4:'}</strong> {isId ? 'Tekan "Tambah" di pojok kanan atas layar.' : 'Tap "Add" in the top-right corner.'}
                  </li>
                </ol>
              </>
            )}

            {platform === 'desktop' && (
              <>
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wide">
                  <Monitor className="w-4 h-4" />
                  <span>{isId ? 'Cara Pasang di Komputer / Laptop (Windows, Mac, Linux):' : 'How to Install on Desktop (Chrome/Edge):'}</span>
                </div>
                <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                  <li>
                    <strong className="text-white">{isId ? 'Langkah 1:' : 'Step 1:'}</strong> {isId ? 'Buka situs di Google Chrome atau Microsoft Edge.' : 'Open in Google Chrome or Microsoft Edge.'}
                  </li>
                  <li>
                    <strong className="text-white">{isId ? 'Langkah 2:' : 'Step 2:'}</strong> {isId ? 'Lihat ke bilah alamat (URL bar) di bagian atas kanan. Cari ikon monitor kecil atau panah ke bawah (Instal).' : 'Look at the top URL bar for the install computer/download icon.'}
                  </li>
                  <li>
                    <strong className="text-white">{isId ? 'Langkah 3:' : 'Step 3:'}</strong> {isId ? 'Klik "Instal" untuk membuat jendela aplikasi mandiri di Taskbar/Desktop Anda.' : 'Click "Install" to create a standalone desktop app window.'}
                  </li>
                </ol>
              </>
            )}
          </div>

          {/* Keunggulan Menjadikan Aplikasi */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              {isId ? 'Keunggulan Aplikasi Terpasang:' : 'Benefits of Installed App:'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white text-xs">
                    {isId ? 'Akses Seketika (Standalone)' : 'Instant Standalone'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isId ? 'Buka langsung dari layar utama tanpa ketik alamat web dan tanpa address bar.' : 'Launch immediately from your home screen without typing URLs.'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white text-xs">
                    {isId ? 'Notifikasi Handphone' : 'Mobile Push Alerts'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isId ? 'AI dapat mengirim getaran & bunyi notifikasi saat generasi kode selesai.' : 'Receive phone vibration and sound when AI tasks complete.'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white text-xs">
                    {isId ? 'Kecerdasan GPT Astra Core' : 'GPT Astra Core AI'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isId ? 'Kecerdasan tingkat tinggi untuk coding, desain, dan pembuatan app interaktif.' : 'High-level AI for coding, design, and live sandbox app creation.'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white text-xs">
                    {isId ? 'Aman, Resmi & Ringan' : 'Secure & Lightweight'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isId ? 'Hemat baterai dan memori HP, tanpa perlu file APK luar yang berbahaya.' : 'No untrusted APK files needed, battery and storage efficient.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400 text-center sm:text-left">
            {isId 
              ? 'Dikembangkan secara eksklusif oleh Ayyub Kenda Pratama.' 
              : 'Engineered exclusively by Ayyub Kenda Pratama.'}
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              {isId ? 'Tutup' : 'Close'}
            </button>
            {deferredPrompt && !isStandalone && (
              <button
                onClick={handleInstallClick}
                disabled={installing}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isId ? 'Pasang App Sekarang' : 'Install App Now'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
