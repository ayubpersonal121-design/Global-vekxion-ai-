import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Bell, 
  UserCheck, 
  KeyRound, 
  AlertTriangle, 
  CheckCircle2, 
  EyeOff, 
  Database, 
  ArrowRight,
  FileText,
  Sparkles
} from 'lucide-react';
import { setAcceptedLegalTerms, recordAuditLog, getOrCreateSessionId } from '../utils/safeStorage';

interface MandatoryConsentGateProps {
  isOpen: boolean;
  onAccept: () => void;
  onOpenDetailedLegal?: (tab: 'privacy' | 'terms') => void;
}

export const MandatoryConsentGate: React.FC<MandatoryConsentGateProps> = ({
  isOpen,
  onAccept,
  onOpenDetailedLegal,
}) => {
  if (!isOpen) return null;

  // 4 mandatory consent checkboxes
  const [agreeNotification, setAgreeNotification] = useState(false);
  const [agreeDeveloperSecurity, setAgreeDeveloperSecurity] = useState(false);
  const [agreePrivacyPolicy, setAgreePrivacyPolicy] = useState(false);
  const [agreeLicensePolicy, setAgreeLicensePolicy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allAgreed = agreeNotification && agreeDeveloperSecurity && agreePrivacyPolicy && agreeLicensePolicy;

  const handleAcceptAll = async () => {
    if (!allAgreed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 1. Request notification permission if supported by the browser
      if (typeof window !== 'undefined' && 'Notification' in window) {
        try {
          if (Notification.permission === 'default') {
            await Notification.requestPermission();
          }
        } catch (notifErr) {
          console.warn('Notification permission request skipped:', notifErr);
        }
      }

      // 2. Persist legal consent in storage
      setAcceptedLegalTerms(true);

      // 3. Record audit log for compliance
      const sessionId = getOrCreateSessionId();
      recordAuditLog(
        sessionId, 
        'User explicitly consented to Mandatory Terms, Privacy & Developer Security Guarantees'
      );

      // 4. Unlock UI
      setTimeout(() => {
        onAccept();
        setIsSubmitting(false);
      }, 400);
    } catch (err) {
      console.error('Error accepting terms:', err);
      setAcceptedLegalTerms(true);
      onAccept();
      setIsSubmitting(false);
    }
  };

  const handleSelectAll = () => {
    const nextState = !allAgreed;
    setAgreeNotification(nextState);
    setAgreeDeveloperSecurity(nextState);
    setAgreePrivacyPolicy(nextState);
    setAgreeLicensePolicy(nextState);
  };

  const handleOneClickAccept = async () => {
    setAgreeNotification(true);
    setAgreeDeveloperSecurity(true);
    setAgreePrivacyPolicy(true);
    setAgreeLicensePolicy(true);
    setIsSubmitting(true);
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        try {
          if (Notification.permission === 'default') {
            await Notification.requestPermission();
          }
        } catch {}
      }
      setAcceptedLegalTerms(true);
      const sessionId = getOrCreateSessionId();
      recordAuditLog(sessionId, 'User consented to Mandatory Terms via 1-click approval');
      setTimeout(() => {
        onAccept();
        setIsSubmitting(false);
      }, 200);
    } catch {
      setAcceptedLegalTerms(true);
      onAccept();
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/95 animate-in fade-in pointer-events-auto">
      <div className="w-full max-w-2xl bg-[#141414] border border-neutral-800 rounded-3xl p-5 sm:p-8 shadow-2xl relative my-auto max-h-[95vh] flex flex-col overflow-hidden text-neutral-200 ring-1 ring-sky-500/20 pointer-events-auto">
        
        {/* Glow Accent Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600/20 to-indigo-600/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0 shadow-lg shadow-sky-950/40">
            <ShieldCheck className="w-6 h-6 text-sky-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Persetujuan Persyaratan, Privasi & Keamanan Pengembang
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              VEXION AI · Kebijakan Wajib Sebelum Menggunakan Aplikasi
            </p>
          </div>
        </div>

        {/* Scrollable Notice Clauses */}
        <div className="overflow-y-auto py-4 space-y-4 pr-1 text-xs text-neutral-300">
          
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-600/40 text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="text-amber-300 font-bold block mb-0.5">Pemberitahuan Wajib Akses:</strong>
              Anda tidak dapat memakai atau masuk ke aplikasi AI ini sebelum menyetujui seluruh persyaratan, privasi pengguna, dan jaminan keamanan untuk pembuat di bawah ini.
            </div>
          </div>

          {/* Clause 1: Notifikasi & Login */}
          <div className="p-4 rounded-2xl bg-[#1a1a1a] border border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Bell className="w-4 h-4 text-sky-400" />
              <span>1. Syarat Izin Notifikasi & Ketentuan Login Sesi</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Aplikasi ini memerlukan izin notifikasi untuk menyampaikan status pemrosesan AI, pengingat kuota harian, konfirmasi pemesanan, dan pembaruan sistem. Identitas sesi dan perangkat Anda dicatat secara anonim demi keamanan dan keandalan sistem.
            </p>
          </div>

          {/* Clause 2: Keamanan Mutlak Pembuat (Developer Security Guarantee) */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
              <KeyRound className="w-4 h-4 text-rose-400" />
              <span>2. Keamanan Mutlak untuk Pembuat (Kerahasiaan Kode Developer & Admin)</span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              <strong className="text-white">Tidak ada seorang pun yang dapat mengetahui atau meminta kode khusus developer, password master admin, atau backdoor sistem.</strong> Seluruh kredensial administratif adalah rahasia mutlak pemilik (Ayyub Kenda Pratama) dan dilindungi oleh enkripsi kuat. Dilarang keras mencoba mencari, membobol, merekayasa balik (reverse-engineer), atau menyebarluaskan celah keamanan sistem.
            </p>
          </div>

          {/* Clause 3: Privasi Mutlak Pembuat & Pengguna */}
          <div className="p-4 rounded-2xl bg-[#1a1a1a] border border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <EyeOff className="w-4 h-4 text-emerald-400" />
              <span>3. Perlindungan Privasi Mutlak Pembuat & Privasi Pengguna</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              <strong className="text-neutral-200">Orang lain tidak boleh mengetahui hal privasi apapun dari pembuat aplikasi</strong>, termasuk data finansial privat, informasi identitas pribadi di luar kanal bisnis resmi, dan konfigurasi server. Sebaliknya, privasi obrolan dan data pengguna dienkripsi secara lokal dan tidak pernah dijual atau disebarkan ke pihak ketiga tanpa izin.
            </p>
          </div>

          {/* Clause 4: Sistem Lisensi Premium Aman (Tanpa Kode Admin) */}
          <div className="p-4 rounded-2xl bg-[#1a1a1a] border border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>4. Sistem Lisensi Premium Resmi (Akses Mandiri & Anti-Pembajakan)</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Untuk mengaktifkan fitur Premium, <strong className="text-neutral-200">Pembuat TIDAK AKAN PERNAH mengirimkan kode admin kepada siapapun</strong>. Verifikasi dilakukan secara aman melalui validasi ID Transaksi langsung di sistem atau melalui <strong className="text-emerald-400">Kode Lisensi Unik Sekali Pakai</strong> yang langsung hangus setelah dipakai di perangkat Anda. Kode lisensi ini tidak dapat dibagikan atau disalahgunakan oleh pihak lain.
            </p>
          </div>

          {/* Detailed Legal Links */}
          {onOpenDetailedLegal && (
            <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
              <span>Ingin membaca dokumen legal formal lengkap?</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onOpenDetailedLegal('privacy')}
                  className="text-sky-400 hover:text-sky-300 underline cursor-pointer"
                >
                  Kebijakan Privasi
                </button>
                <button
                  type="button"
                  onClick={() => onOpenDetailedLegal('terms')}
                  className="text-sky-400 hover:text-sky-300 underline cursor-pointer"
                >
                  Syarat & Ketentuan
                </button>
              </div>
            </div>
          )}

          {/* Checkboxes Section */}
          <div className="p-4 rounded-2xl bg-[#0f0f0f] border border-neutral-800 space-y-3 mt-2">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Konfirmasi Persetujuan Anda (Wajib Centang Semua):
              </span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[10px] text-sky-400 hover:text-sky-300 underline cursor-pointer font-medium"
              >
                {allAgreed ? 'Hapus Semua' : 'Centang Semua'}
              </button>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreeNotification}
                onChange={(e) => setAgreeNotification(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-sky-500 focus:ring-sky-500/40 cursor-pointer accent-sky-500"
              />
              <span className="text-[11px] text-neutral-300 group-hover:text-white transition-colors leading-tight">
                Saya menyetujui izin notifikasi sistem, pengelolaan sesi login aman, dan pembaruan berkas aplikasi.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreeDeveloperSecurity}
                onChange={(e) => setAgreeDeveloperSecurity(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-sky-500 focus:ring-sky-500/40 cursor-pointer accent-sky-500"
              />
              <span className="text-[11px] text-neutral-300 group-hover:text-white transition-colors leading-tight">
                <strong className="text-white">Keamanan Pembuat:</strong> Saya berjanji tidak akan mencari, meminta, menyusup, atau menyebarkan kode khusus developer / password admin.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreePrivacyPolicy}
                onChange={(e) => setAgreePrivacyPolicy(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-sky-500 focus:ring-sky-500/40 cursor-pointer accent-sky-500"
              />
              <span className="text-[11px] text-neutral-300 group-hover:text-white transition-colors leading-tight">
                <strong className="text-white">Privasi Pembuat & Pengguna:</strong> Saya menjaga privasi mutlak pembuat dan menyetujui kebijakan privasi enkripsi data pengguna.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreeLicensePolicy}
                onChange={(e) => setAgreeLicensePolicy(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-sky-500 focus:ring-sky-500/40 cursor-pointer accent-sky-500"
              />
              <span className="text-[11px] text-neutral-300 group-hover:text-white transition-colors leading-tight">
                <strong className="text-white">Sistem Lisensi Aman:</strong> Saya memahami bahwa aktivasi premium menggunakan Lisensi Resmi Sekali Pakai dan pemilik TIDAK memberikan kode admin kepada pembeli.
              </span>
            </label>
          </div>

        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#141414]">
          <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Klik tombol di sebelah kanan untuk menyetujui seluruh persyaratan dan mulai memakai AI.</span>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleOneClickAccept}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-sky-950/50 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 text-sky-200" />
            <span>Setujui Semua Ketentuan & Mulai Gunakan AI</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
