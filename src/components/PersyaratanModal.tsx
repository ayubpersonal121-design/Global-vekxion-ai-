import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  MessageCircle, 
  Copy, 
  QrCode, 
  Clock, 
  Lock, 
  Crown, 
  CheckCircle2, 
  KeyRound, 
  ExternalLink,
  CheckCheck,
  EyeOff,
  Bell
} from 'lucide-react';
import { PlanId } from '../types';
import { 
  logTransaction, 
  getOrCreateSessionId, 
  redeemLicense,
  setAcceptedLegalTerms
} from '../utils/safeStorage';

interface PersyaratanModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'id' | 'en';
  triggerReason?: 'download' | 'login' | 'manual';
  onOpenPricing?: () => void;
  onSelectPlan?: (planId: PlanId) => void;
}

export const PersyaratanModal: React.FC<PersyaratanModalProps> = ({
  isOpen,
  onClose,
  language,
  triggerReason = 'download',
  onOpenPricing,
  onSelectPlan,
}) => {
  if (!isOpen) return null;
  const isId = language !== 'en';

  const [copiedGopay, setCopiedGopay] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [licenseInput, setLicenseInput] = useState('');
  const [licenseStatus, setLicenseStatus] = useState<{ text: string; isError: boolean } | null>(null);

  const gopayNumber = "089654886223";
  const whatsappTargetNumber = "6285776540459";
  const whatsappDisplayNumber = "+62 857-7654-0459";

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
      const newTx = logTransaction('pro_150k', 'Pixel Ads Pro', 150000, sessionId);
      const dateStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
      const message = `Halo Admin VEXION AI, saya sudah membaca dan menyetujui seluruh persyaratan & privasi, serta telah melakukan transfer untuk aktivasi Fitur Premium.\n\nDetail Transaksi:\n- ID Transaksi: ${newTx.id}\n- ID Perangkat: ${sessionId.slice(0, 16)}\n- Nomor Tujuan GoPay: ${gopayNumber}\n- Nomor WhatsApp Konfirmasi: ${whatsappDisplayNumber}\n- Status: Persetujuan Persyaratan Selesai (PENDING_VERIFICATION)\n- Waktu: ${dateStr}\n\nSaya melampirkan bukti transfer di pesan ini. Mohon verifikasi & kirimkan Kode Lisensi Sekali Pakai saya atau langsung approve transaksi saya di admin controller. Terima kasih!`;

      const waUrl = `https://wa.me/${whatsappTargetNumber}?text=${encodeURIComponent(message)}`;
      try {
        window.open(waUrl, '_blank');
      } catch (e) {
        window.location.href = waUrl;
      }
    } catch (e) {
      console.error('Failed to open WhatsApp:', e);
    }
  };

  const handleRedeemLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseInput.trim()) return;

    const sessionId = getOrCreateSessionId();
    const result = redeemLicense(licenseInput, sessionId);

    if (result.success && result.planId) {
      if (onSelectPlan) {
        onSelectPlan(result.planId);
      }
      setLicenseStatus({ text: result.message, isError: false });
      setLicenseInput('');
      setTimeout(() => {
        onClose();
      }, 2500);
    } else {
      setLicenseStatus({ text: result.message, isError: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#141414] border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative my-auto animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto text-neutral-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Reason Banner */}
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/70 border border-sky-500/40 text-sky-300 text-xs font-semibold">
          <FileText className="w-3.5 h-3.5 text-sky-400" />
          <span>
            {triggerReason === 'download'
              ? (isId ? '✓ Berkas / Aplikasi Selesai Didownload · Persyaratan Penggunaan' : '✓ Download Complete · Terms & Requirements')
              : triggerReason === 'login'
              ? (isId ? '✓ Berhasil Login · Persyaratan & Ketentuan Layanan' : '✓ Login Successful · Terms & Requirements')
              : (isId ? 'Persyaratan, Privasi & Keamanan Pengembang' : 'Terms, Privacy & Developer Security')}
          </span>
        </div>

        {/* Header */}
        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Persyaratan Penggunaan &amp; Privasi Resmi</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
            Sistem <strong className="text-white">VEXION AI</strong> karya <strong className="text-sky-400">Ayyub Kenda Pratama</strong>. Harap baca dan pahami prinsip perlindungan privasi, ketentuan notifikasi, dan keamanan pembuat di bawah ini.
          </p>
        </div>

        {/* Section 1: Ringkasan 4 Pilar Persyaratan */}
        <div className="p-4 rounded-2xl bg-[#1a1a1a] border border-neutral-800 space-y-3 mb-5 text-xs text-neutral-300 leading-relaxed">
          <h3 className="font-bold text-white flex items-center gap-1.5 text-sm">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>1. Kebijakan & Privasi Pengguna Maupun Pembuat</span>
          </h3>
          <ul className="space-y-2 text-neutral-300 list-disc list-inside">
            <li>
              <strong className="text-sky-300">Izin Notifikasi & Login:</strong> Diperlukan untuk status pesanan, kuota percakapan, dan verifikasi sesi aman tanpa mengumpulkan data pribadi di luar kebutuhan aplikasi.
            </li>
            <li>
              <strong className="text-rose-300">Keamanan Mutlak Pembuat (Kerahasiaan Kode Admin):</strong> Tidak ada siapapun yang dapat mengetahui atau meminta kode khusus developer atau password admin. Seluruh kunci pengembang adalah rahasia mutlak pemilik.
            </li>
            <li>
              <strong className="text-emerald-300">Privasi Mutlak Pembuat:</strong> Orang lain dilarang keras mencari tahu atau membocorkan privasi apapun dari pembuat aplikasi. Percakapan pengguna juga dienkripsi dan terlindungi.
            </li>
            <li>
              <strong className="text-amber-300">Aktivasi Lisensi Resmi (Bukan Kode Admin):</strong> Pembeli menerima aktivasi via verifikasi ID Transaksi atau Kode Lisensi Sekali Pakai yang langsung hangus setelah dipakai. Kode admin TIDAK PERNAH dikirimkan kepada pembeli.
            </li>
          </ul>
        </div>

        {/* Section 2: Persyaratan Pembayaran Manual & Aktivasi Premium */}
        <div className="rounded-2xl bg-[#1a1a1a] p-5 border border-neutral-800 shadow-xl mb-5 space-y-4">
          <h3 className="font-bold text-white flex items-center gap-1.5 text-sm">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>2. Persyaratan & Tata Cara Pembayaran Aktivasi Premium</span>
          </h3>

          {/* Prominent Payment Instruction Text (Exact Requirement) */}
          <div className="p-3.5 rounded-xl bg-[#222222] border border-sky-500/30 text-center sm:text-left">
            <p className="text-sm font-extrabold text-white leading-relaxed">
              Metode Pembayaran: Transfer ke GoPay (089654886223) atau Scan Barcode DANA di bawah ini.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* GoPay Box */}
            <div className="p-4 rounded-xl bg-[#111111] border border-neutral-800 flex flex-col justify-between space-y-3">
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

              <div className="bg-[#181818] p-3 rounded-lg border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 block">Nomor GoPay:</span>
                  <span className="text-lg font-mono font-extrabold text-sky-300 tracking-wider">
                    {gopayNumber}
                  </span>
                </div>
                <button
                  onClick={handleCopyGopay}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg flex items-center gap-1.5 transition-colors border border-neutral-700 cursor-pointer"
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
            </div>

            {/* DANA QR Barcode Section (Exact URL: https://co.com) */}
            <div className="p-4 rounded-xl bg-[#111111] border border-neutral-800 flex flex-col items-center text-center justify-between space-y-2">
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

              <div className="w-32 h-32 bg-white p-2 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden my-1">
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
                    <QrCode className="w-14 h-14 text-blue-600 mb-1" />
                    <span className="text-[9px] font-bold tracking-tight text-blue-700 uppercase">DANA QRIS</span>
                    <span className="text-[8px] text-neutral-600 font-mono">https://co.com</span>
                  </div>
                )}
              </div>

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

          {/* Processing Timeline Notice */}
          <div className="flex items-center gap-2 text-xs text-neutral-300 bg-[#111111] p-3 rounded-xl border border-neutral-800">
            <Clock className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Pemesanan akan diproses beberapa hari</span>
          </div>

          {/* Bold Warning Text */}
          <div className="text-center pt-1">
            <p className="text-sm font-extrabold text-amber-400 flex items-center justify-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Harap lapor melalui via WhatsApp (+62 857-7654-0459) y!</span>
            </p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleWhatsAppConfirmation}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:via-teal-500 hover:to-sky-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-950/60 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            title="Konfirmasi via WhatsApp ke +62 857-7654-0459"
          >
            <MessageCircle className="w-5 h-5 text-white fill-white" />
            <span>Konfirmasi via WhatsApp (+62 857-7654-0459)</span>
          </button>
        </div>

        {/* Section 3: Aktivasi Kode Lisensi Sekali Pakai (TIDAK MEMBAGIKAN KODE ADMIN) */}
        <div className="p-4 rounded-2xl bg-[#111111] border border-neutral-800 space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Aktivasi Kode Lisensi Sekali Pakai (Single-Use Token)
              </h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              1x Pakai Langsung Hangus
            </span>
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Jika Anda telah membeli paket dan menerima <strong>Kode Lisensi Resmi</strong> dari Pembuat di WhatsApp (contoh: <code className="text-sky-300 font-mono">GP-TITAN-XXXX-XXXX</code>), masukkan kode tersebut di bawah. Kode ini langsung hangus setelah dipakai di perangkat ini demi mencegah pembajakan.
          </p>

          <form onSubmit={handleRedeemLicense} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={licenseInput}
              onChange={(e) => {
                setLicenseInput(e.target.value.toUpperCase());
                setLicenseStatus(null);
              }}
              placeholder="Masukkan kode lisensi resmi (contoh: GP-TITAN-8192-3741)..."
              className="flex-1 bg-[#1a1a1a] border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 font-mono"
            />
            <button
              type="submit"
              disabled={!licenseInput.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Aktivasi Lisensi</span>
            </button>
          </form>

          {licenseStatus && (
            <div className={`p-3 rounded-xl border text-xs leading-relaxed animate-in fade-in flex items-start gap-2 ${
              licenseStatus.isError
                ? 'bg-rose-950/80 border-rose-500/60 text-rose-200'
                : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
            }`}>
              {licenseStatus.isError ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <span>{licenseStatus.text}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-800">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>VEXION AI · Pengembang: Ayyub Kenda Pratama</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
