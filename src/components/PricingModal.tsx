import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Crown, 
  Copy, 
  QrCode, 
  Clock, 
  AlertTriangle, 
  MessageCircle, 
  CheckCircle2, 
  Lock, 
  KeyRound, 
  ExternalLink,
  ShieldCheck,
  CheckCheck,
  Zap,
  ArrowRight,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { PlanId, PricingPlan, TransactionRecord } from '../types';
import { 
  logTransaction, 
  getOrCreateSessionId, 
  redeemLicense,
  safeStorage, 
  STORAGE_KEYS 
} from '../utils/safeStorage';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanId: PlanId;
  onSelectPlan: (planId: PlanId) => void;
  language: 'id' | 'en';
  featureLockedMessage?: string;
  onOpenAdminController?: () => void;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter_50k',
    name: 'Starter Pixel',
    price: 50000,
    period: '/bulan',
    badge: 'Pemula',
    description: 'Akses cepat untuk kebutuhan iklan harian, copywriting, dan percakapan cerdas tanpa batas kuota.',
    maxDailyCreations: 100,
    unlockedTiers: ['flash'],
    features: [
      'Akses Tanpa Batas ke VEXION AI',
      'Generator Copy Iklan Meta, Google & TikTok',
      'Mode Dialog Cerdas Respons Kilat',
      'Ekspor berkas kode dan strategi (.html, .md)',
      'Dukungan penuh Bahasa Indonesia & Inggris'
    ]
  },
  {
    id: 'pro_150k',
    name: 'Pixel Ads Pro',
    price: 150000,
    period: '/bulan',
    badge: 'Paling Populer',
    popular: true,
    description: 'Kekuatan penuh penalaran kognitif, live sandbox widget iklan, dan multimodal.',
    maxDailyCreations: 500,
    unlockedTiers: ['flash', 'reasoning_high'],
    features: [
      'Semua fitur Starter Pixel',
      'Mode Rantai Penalaran Kognitif (Thinking Protocol)',
      'Live Sandbox & Full-Stack Interactive Banner Generator',
      'Input Suara Dikte (Microphone) & Audio Reader (TTS)',
      'Prompt Supercharger khusus Advertising ROI',
      'Analisis Multimodal Gambar Iklan Produk',
      'Prioritas pemrosesan server kecepatan tinggi'
    ]
  },
  {
    id: 'ultra_350k',
    name: 'Pixel Ultra Architect',
    price: 350000,
    period: '/bulan',
    badge: 'Agensi & Bisnis',
    description: 'Untuk agensi digital marketing, full-stack engineer, dan enterprise media buyer.',
    maxDailyCreations: 2000,
    unlockedTiers: ['flash', 'reasoning_high', 'astro_supreme'],
    features: [
      'Semua fitur Pixel Ads Pro',
      'Astro Supreme Flagship Model Engine',
      'Arsitektur Landing Page Skala Besar & Tracking Script',
      'Analisis Data Audiens & Prediksi Konversi ROI',
      'Semua Persona Spesialis (Full-Stack, Copywriter, Growth)',
      'Riwayat Percakapan Vault Tak Terbatas',
      'Dukungan dedicated multi-session workspace'
    ]
  },
  {
    id: 'titan_700k',
    name: 'Supreme Titan Enterprise',
    price: 700000,
    period: '/bulan',
    badge: 'Tingkat Tertinggi',
    description: 'Full conversational Application, Game, and Website generation sandbox, Full access to Language-Driven BlackArch Cyber Suite (Aircrack-ng, Hydra, Sherlock, Network Scanner), Unlimited long video generation up to 1 Hour, Ultra 4K @60fps, and Priority VIP Server.',
    maxDailyCreations: 99999,
    unlockedTiers: ['flash', 'reasoning_high', 'astro_supreme'],
    features: [
      'Full conversational Application, Game, and Website sandbox',
      'Full access to Language-Driven BlackArch Cyber Suite (Aircrack-ng, Hydra, Sherlock, Network Scanner)',
      'Unlimited long video generation up to 1 Hour',
      'Ultra 4K @60fps & Priority VIP Server',
      'Dedicated Node Server (Zero Latency & No Rate-Limits)',
      'Hak Komersial 100% atas semua materi iklan ciptaan',
      'Dukungan Teknis Prioritas Langsung Developer'
    ]
  },
  {
    id: 'vip_argon_astro_8m',
    name: 'AI Argon & 4 Astro Sovereign VIP',
    price: 8500000,
    period: '/lisensi',
    badge: 'Eksklusif VIP > Rp 8 Juta',
    description: 'Tingkat kedaulatan tertinggi: Mengaktifkan model AI Argon & 4 Astro, Engine Pembuat Gambar Ultra-HD, serta No-Code Business App Builder.',
    maxDailyCreations: 999999,
    unlockedTiers: ['flash', 'reasoning_high', 'astro_supreme', 'argon_ultra', 'astro_4'],
    features: [
      'Aktivasi Eksklusif Model AI Argon (Gemini 4 Argon Engine)',
      'Aktivasi Eksklusif Model 4 Astro Supreme Reasoning',
      'Engine Pembuat Gambar Ultra-HD Sinematik Langsung dari Chat',
      'Engine Pembuat Aplikasi Bisnis (No-Code Builder Kasir, CRM, Inventaris)',
      'Otomatisasi Latar Belakang AI Tanpa Perlu Pindah Menu',
      'Pratinjau Interaktif Aplikasi Bisnis di Sisi Chat & Ekspor Kode HTML',
      'Prioritas VIP Node Mutlak & Lisensi Komersial Penuh'
    ]
  }
];

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  currentPlanId,
  onSelectPlan,
  language,
  featureLockedMessage,
  onOpenAdminController,
}) => {
  if (!isOpen) return null;
  const isId = language !== 'en';

  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(
    PRICING_PLANS.find(p => p.id === currentPlanId && p.id !== 'free') || PRICING_PLANS[1]
  );
  const [copiedGopay, setCopiedGopay] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [lastGeneratedTx, setLastGeneratedTx] = useState<TransactionRecord | null>(null);

  // One-time license key redemption states (Single-use token)
  const [licenseInput, setLicenseInput] = useState('');
  const [licenseRedeemMsg, setLicenseRedeemMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const gopayNumber = "089654886223";
  const whatsappTargetNumber = "6285776540459";
  const whatsappDisplayNumber = "+62 857-7654-0459";

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const handleCopyGopay = () => {
    try {
      navigator.clipboard.writeText(gopayNumber);
      setCopiedGopay(true);
      setTimeout(() => setCopiedGopay(false), 2000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const handleWhatsAppConfirmation = () => {
    try {
      const sessionId = getOrCreateSessionId();
      // Generate secure 6-digit transaction string (e.g. #AI-PRO-87361) and log as PENDING_VERIFICATION
      const newTx = logTransaction(selectedPlan.id, selectedPlan.name, selectedPlan.price, sessionId);
      setLastGeneratedTx(newTx);

      const formattedPrice = formatRupiah(selectedPlan.price);
      const dateStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

      // Dynamic pre-filled text including the Transaction ID
      const message = `Halo Admin VEXION AI, saya mengonfirmasi pemesanan aktivasi Fitur Premium.\n\nDetail Transaksi:\n- ID Transaksi: ${newTx.id}\n- Paket Dipilih: ${selectedPlan.name} (${formattedPrice})\n- Rekening Tujuan GoPay: ${gopayNumber}\n- Nomor WhatsApp Konfirmasi: ${whatsappDisplayNumber}\n- Status Sistem: PENDING_VERIFICATION\n- Waktu: ${dateStr}\n\nSaya akan melampirkan bukti transfer di pesan ini. Mohon verifikasi & kirimkan Kode Lisensi Sekali Pakai saya atau langsung approve transaksi saya di admin controller. Terima kasih!`;

      const waUrl = `https://wa.me/${whatsappTargetNumber}?text=${encodeURIComponent(message)}`;
      
      try {
        window.open(waUrl, '_blank');
      } catch (e) {
        window.location.href = waUrl;
      }
    } catch (err) {
      console.error('Error during WhatsApp confirmation:', err);
    }
  };

  const handleRedeemLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseInput.trim()) return;

    setIsRedeeming(true);
    setLicenseRedeemMsg(null);

    const sessionId = getOrCreateSessionId();
    const result = redeemLicense(licenseInput, sessionId);

    if (result.success && result.planId) {
      onSelectPlan(result.planId);
      setLicenseRedeemMsg({ text: result.message, isError: false });
      setLicenseInput('');
      setTimeout(() => {
        onClose();
      }, 2500);
    } else {
      setLicenseRedeemMsg({ text: result.message, isError: true });
    }
    setIsRedeeming(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#171717] border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto text-neutral-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Feature Lock Notice Banner if triggered via paywall */}
        {featureLockedMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-amber-950/60 border border-amber-600/50 flex items-center gap-3 text-xs text-amber-200 shadow-md">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300">Fitur Premium Terkunci: </span>
              <span>{featureLockedMessage}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#202020] border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Akses Fitur Premium VEXION AI</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Tingkatkan ke Akun Premium
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1.5">
            Buka seluruh kecerdasan buatan tingkat tinggi Gemini & ChatGPT, Live Sandbox Iklan tanpa batas pesan mulai dari <strong className="text-sky-400">Rp 50.000</strong> hingga <strong className="text-sky-400">Rp 700.000</strong>.
          </p>
        </div>

        {/* 1. PRICING PLANS SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {PRICING_PLANS.map((plan) => {
            const isSelected = selectedPlan.id === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`rounded-2xl p-4 flex flex-col justify-between border cursor-pointer transition-all relative ${
                  isSelected
                    ? 'bg-[#1f1f1f] border-sky-400 shadow-xl ring-2 ring-sky-400/40'
                    : 'bg-[#141414] border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {plan.badge && (
                  <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    plan.popular
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-sm'
                      : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-white">{plan.name}</h3>
                    {plan.id === 'titan_700k' && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <div className="my-2 pb-2 border-b border-neutral-800">
                    <span className="text-xl font-extrabold text-white">
                      {formatRupiah(plan.price).replace(',00', '')}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-normal"> {plan.period}</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-neutral-300 mb-3">
                    {plan.features.slice(0, 3).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-tight">
                        <Check className="w-3 h-3 text-sky-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`w-full py-1.5 px-2 rounded-lg text-center text-xs font-semibold transition-all ${
                  isSelected ? 'bg-sky-500 text-black font-bold' : 'bg-neutral-800 text-neutral-300'
                }`}>
                  {isSelected ? '✓ Paket Terpilih' : 'Pilih Paket'}
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. MANUAL PAYMENT DETAILS SECTION (EXACT SPECIFICATIONS) */}
        <div className="rounded-2xl bg-[#141414] p-5 sm:p-6 border border-neutral-800 shadow-xl mb-5 space-y-4">
          {/* Prominent Payment Instruction Text (Exact Requirement) */}
          <div className="p-3.5 rounded-xl bg-[#1f1f1f] border border-sky-500/30 text-center sm:text-left">
            <p className="text-sm font-extrabold text-white leading-relaxed">
              Metode Pembayaran: Transfer ke GoPay (089654886223) or Scan Barcode DANA di bawah ini.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* GoPay Box */}
            <div className="p-4 rounded-xl bg-[#0f0f0f] border border-neutral-800 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-600/20 text-sky-400 flex items-center justify-center font-bold text-xs border border-sky-500/30">
                    GP
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Transfer GoPay</h4>
                    <span className="text-[10px] text-neutral-400">Nomor Akun GoPay Resmi</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  Aktif
                </span>
              </div>

              <div className="bg-[#171717] p-3 rounded-lg border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 block">Nomor GoPay:</span>
                  <span className="text-lg font-mono font-extrabold text-sky-300 tracking-wider">
                    {gopayNumber}
                  </span>
                </div>
                <button
                  onClick={handleCopyGopay}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg flex items-center gap-1.5 transition-colors border border-neutral-700 cursor-pointer"
                  title="Salin Nomor GoPay"
                >
                  {copiedGopay ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-neutral-400 flex justify-between">
                <span>Total Transfer Paket:</span>
                <strong className="text-white font-mono">{formatRupiah(selectedPlan.price)}</strong>
              </div>
            </div>

            {/* DANA QR Barcode Section (Exact URL: https://co.com) */}
            <div className="p-4 rounded-xl bg-[#0f0f0f] border border-neutral-800 flex flex-col items-center text-center justify-between space-y-2">
              <div className="w-full flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30">
                    DANA
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Scan Barcode DANA</h4>
                    <span className="text-[10px] text-neutral-400">Pindai kode QR Barcode</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
                  QR Code
                </span>
              </div>

              {/* QR Image Container embedding direct link https://co.com with resilient high-res QR rendering */}
              <div className="w-36 h-36 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden my-1">
                {!imageError ? (
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=https%3A%2F%2Fco.com&margin=4"
                    alt="Barcode DANA https://co.com"
                    crossOrigin="anonymous"
                    onError={() => setImageError(true)}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-900 p-1 bg-white">
                    <QrCode className="w-16 h-16 text-blue-600 mb-1" />
                    <span className="text-[9px] font-bold tracking-tight text-blue-700 uppercase">DANA QRIS Barcode</span>
                    <span className="text-[8px] text-neutral-600 font-mono">https://co.com</span>
                  </div>
                )}
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] text-neutral-400">
                  Buka aplikasi DANA / e-Wallet & scan kode barcode di atas.
                </p>
                <a 
                  href="https://co.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300 hover:underline transition-colors"
                >
                  <span>Buka Link Barcode (https://co.com)</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Processing Timeline Notice (Exact Requirement) */}
          <div className="flex items-center gap-2 text-xs text-neutral-300 bg-[#0f0f0f] p-3 rounded-xl border border-neutral-800">
            <Clock className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Pemesanan akan diproses beberapa hari</span>
          </div>

          {/* Bold Warning Text (Exact Requirement: Right above the action button) */}
          <div className="pt-2 text-center">
            <p className="text-sm font-extrabold text-amber-400 flex items-center justify-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Harap lapor melalui via WhatsApp (+62 857-7654-0459) y!</span>
            </p>
          </div>

          {/* Primary Action Button: "Konfirmasi via WhatsApp" */}
          <div className="pt-1">
            <button
              onClick={handleWhatsAppConfirmation}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:via-teal-500 hover:to-sky-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-950/60 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer group"
              title="Konfirmasi via WhatsApp ke +62 857-7654-0459"
            >
              <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform text-white fill-white" />
              <span>Konfirmasi via WhatsApp (+62 857-7654-0459)</span>
            </button>
          </div>

          {/* Last Generated Transaction Feedback */}
          {lastGeneratedTx && (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs space-y-1.5 animate-in fade-in">
              <div className="flex items-center justify-between text-amber-300 font-bold">
                <span>Token Transaksi Dibuat: {lastGeneratedTx.id}</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-950 border border-amber-700">
                  {lastGeneratedTx.status}
                </span>
              </div>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Token di atas telah dicatat ke database aplikasi sebagai <strong>PENDING_VERIFICATION</strong>. Fitur akan tetap terkunci sampai diverifikasi oleh Admin. Anda diarahkan ke WhatsApp untuk mengirim bukti transfer.
              </p>
            </div>
          )}

          {/* 3. ONE-TIME LICENSE KEY ACTIVATION FORM (SAFE & PROTECTED - NO ADMIN CODE SHARED) */}
          <div className="pt-4 border-t border-neutral-800">
            <div className="p-4 rounded-2xl bg-[#0f0f0f] border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Punya Kode Lisensi Sekali Pakai?
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold">
                  1x Pakai Langsung Hangus
                </span>
              </div>

              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Jika Anda telah menerima <strong>Kode Lisensi Resmi</strong> dari Developer di WhatsApp (contoh: <code className="text-sky-300 font-mono">GP-TITAN-XXXX-XXXX</code>), masukkan kode di bawah ini untuk aktivasi langsung. Kode ini langsung hangus setelah dipakai di perangkat Anda dan tidak dapat dibagikan kepada orang lain.
              </p>

              <form onSubmit={handleRedeemLicense} className="flex flex-col sm:flex-row gap-2 pt-1">
                <input
                  type="text"
                  value={licenseInput}
                  onChange={(e) => {
                    setLicenseInput(e.target.value.toUpperCase());
                    setLicenseRedeemMsg(null);
                  }}
                  placeholder="Masukkan kode lisensi (contoh: GP-TITAN-8192-3741)..."
                  className="flex-1 bg-[#171717] border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 font-mono tracking-wider"
                />
                <button
                  type="submit"
                  disabled={isRedeeming || !licenseInput.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer shrink-0 shadow-md flex items-center justify-center gap-1.5"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Aktivasi Lisensi</span>
                </button>
              </form>

              {licenseRedeemMsg && (
                <div className={`p-3 rounded-xl border text-xs leading-relaxed animate-in fade-in flex items-start gap-2 ${
                  licenseRedeemMsg.isError
                    ? 'bg-rose-950/80 border-rose-500/60 text-rose-200'
                    : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
                }`}>
                  {licenseRedeemMsg.isError ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <span>{licenseRedeemMsg.text}</span>
                </div>
              )}

              {/* Security Guarantee Notice */}
              <div className="pt-2 flex items-start gap-2 text-[10px] text-neutral-500">
                <ShieldAlert className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Jaminan Keamanan Pemilik:</strong> Developer <strong>tidak pernah membagikan password master admin</strong> kepada siapa pun. Seluruh pembeli mengaktifkan lisensi secara aman melalui token sekali pakai atau verifikasi admin langsung.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex flex-wrap items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-800">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>VEXION AI · Developer: Ayyub Kenda Pratama</span>
          </span>
          <span className="text-[11px] font-mono text-neutral-400">
            WhatsApp Direct: 6289654886223
          </span>
        </div>
      </div>
    </div>
  );
};
