import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Bell, 
  EyeOff, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle,
  KeyRound,
  FileText
} from 'lucide-react';

interface MandatoryTermsModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export const MandatoryTermsModal: React.FC<MandatoryTermsModalProps> = ({
  isOpen,
  onAccept,
}) => {
  const [agreedNotification, setAgreedNotification] = useState(false);
  const [agreedDeveloperSecurity, setAgreedDeveloperSecurity] = useState(false);
  const [agreedPrivacyProtection, setAgreedPrivacyProtection] = useState(false);
  const [agreedNoAdminCodePolicy, setAgreedNoAdminCodePolicy] = useState(false);

  if (!isOpen) return null;

  const isAllAgreed = 
    agreedNotification && 
    agreedDeveloperSecurity && 
    agreedPrivacyProtection && 
    agreedNoAdminCodePolicy;

  const handleAcceptAll = () => {
    if (isAllAgreed) {
      onAccept();
    }
  };

  const handleCheckAll = (checked: boolean) => {
    setAgreedNotification(checked);
    setAgreedDeveloperSecurity(checked);
    setAgreedPrivacyProtection(checked);
    setAgreedNoAdminCodePolicy(checked);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/95 backdrop-blur-2xl animate-in fade-in select-none">
      <div className="w-full max-w-3xl bg-[#171717] border border-neutral-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl relative my-auto max-h-[94vh] flex flex-col overflow-hidden text-neutral-200 ring-1 ring-sky-500/20">
        {/* Header Bar */}
        <div className="pb-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500/20 via-indigo-500/20 to-pink-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0 shadow-lg">
              <ShieldCheck className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  Persetujuan Persyaratan, Privasi & Keamanan Mutlak
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/80 font-bold uppercase">
                  Wajib Disetujui
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                VEXION AI · Karya &amp; Hak Cipta: <strong className="text-white">Ayyub Kenda Pratama</strong>
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-mono text-neutral-500">Protokol Keamanan v3.8</span>
          </div>
        </div>

        {/* Notice Banner */}
        <div className="my-3.5 p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Pemberitahuan Wajib:</strong> Anda <strong>tidak dapat memakai atau mengakses</strong> aplikasi AI ini sebelum membaca dan menyetujui seluruh ketentuan privasi pengguna, izin notifikasi, serta perlindungan keamanan mutlak bagi Pembuat di bawah ini.
          </p>
        </div>

        {/* Scrollable Terms Content */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 text-xs text-neutral-300 leading-relaxed">
          {/* Section 1: Syarat Izin Notifikasi Handphone & Browser */}
          <div className="p-4 rounded-2xl bg-[#131313] border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                <Bell className="w-4 h-4 text-sky-400" />
                <span>1. Persyaratan Izin Notifikasi Sistem & PWA</span>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={agreedNotification}
                  onChange={(e) => setAgreedNotification(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-sky-500 focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] font-semibold text-sky-400">Setuju Poin 1</span>
              </label>
            </div>
            <p className="text-neutral-400 text-[11px]">
              Aplikasi ini membutuhkan izin notifikasi pada perangkat handphone atau browser Anda untuk menyampaikan status tugas AI yang selesai, pembaruan materi iklan, status transaksi lisensi, dan notifikasi keamanan akun secara seketika (*real-time*). Anda menyetujui penerimaan notifikasi operasional ini.
            </p>
          </div>

          {/* Section 2: Keamanan Login & Perlindungan Akun */}
          <div className="p-4 rounded-2xl bg-[#131313] border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                <span>2. Keamanan Login & Kriptografi Data</span>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={agreedDeveloperSecurity}
                  onChange={(e) => setAgreedDeveloperSecurity(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-sky-500 focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] font-semibold text-sky-400">Setuju Poin 2</span>
              </label>
            </div>
            <p className="text-neutral-400 text-[11px]">
              Sesi dan data Anda dilindungi dengan enkripsi end-to-end (AES-256 & TLS 1.3). Pengguna dilarang menyalahgunakan sistem ini untuk penipuan, injeksi kode berbahaya (*malware*), atau pencurian data. Akun yang terindikasi melanggar akan langsung diblokir permanen oleh sistem keamanan.
            </p>
          </div>

          {/* Section 3: Keamanan Khusus Pembuat & Perlindungan Kode Khusus */}
          <div className="p-4 rounded-2xl bg-[#131313] border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                <Lock className="w-4 h-4 text-rose-400" />
                <span>3. Keamanan Mutlak Pembuat: Larangan Mengintip Kode Khusus Developer</span>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={agreedPrivacyProtection}
                  onChange={(e) => setAgreedPrivacyProtection(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-sky-500 focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] font-semibold text-sky-400">Setuju Poin 3</span>
              </label>
            </div>
            <p className="text-neutral-400 text-[11px]">
              Dilarang keras bagi siapa pun untuk mencoba <strong>mencari tahu, mengintip, membongkar, membocorkan, merekayasa balik (*reverse-engineer*), atau meretas kode khusus developer/admin</strong>. Hak akses master controller, konfigurasi server, dan sistem verifikasi lisensi adalah hak cipta serta rahasia mutlak pemilik (Ayyub Kenda Pratama). Pelanggaran terhadap poin ini akan ditindak tegas secara hukum dan pemutusan akses perangkat permanen.
            </p>
          </div>

          {/* Section 4: Larangan Mengetahui Hal Privasi Apapun Dari Pembuat */}
          <div className="p-4 rounded-2xl bg-[#131313] border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                <EyeOff className="w-4 h-4 text-amber-400" />
                <span>4. Perlindungan Privasi Tertinggi: Privasi Pembuat & Pengguna</span>
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={agreedNoAdminCodePolicy}
                  onChange={(e) => setAgreedNoAdminCodePolicy(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-sky-500 focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] font-semibold text-sky-400">Setuju Poin 4</span>
              </label>
            </div>
            <p className="text-neutral-400 text-[11px]">
              <strong>Orang lain atau pengguna mana pun TIDAK BOLEH mengetahui, mengorek, menyebarluaskan, atau melanggar hal privasi apa pun dari Pembuat/Developer (Ayyub Kenda Pratama)</strong>. Demikian pula sebaliknya, kerahasiaan percakapan, ide bisnis, dan materi iklan pengguna dijamin aman secara privat serta tidak akan pernah dibocorkan atau dijual ke pihak ketiga.
            </p>
          </div>

          {/* Section 5: Kebijakan Keamanan Lisensi Premium (Bukan Berbagi Kode Admin) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-[#131313] to-sky-950/40 border border-sky-500/30 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>5. Akses Lisensi Premium: Verifikasi Resmi & Kode Sekali Pakai (Tanpa Kode Admin)</span>
            </div>
            <p className="text-neutral-300 text-[11px]">
              Demi mencegah penyalahgunaan dan pembajakan (seperti pembeli yang membagikan kode ke orang lain tanpa membayar), <strong>Developer TIDAK PERNAH mengirimkan kode/password admin kepada pembeli manapun</strong>. Sebagai gantinya, aktivasi Premium dilakukan secara aman melalui:
            </p>
            <ul className="list-disc list-inside space-y-1 text-neutral-400 text-[11px] pl-1">
              <li><strong>Persetujuan Langsung (*Remote Instant Approval*):</strong> Admin menyetujui ID Transaksi perangkat Anda dari Controller pribadinya setelah konfirmasi WhatsApp.</li>
              <li><strong>Kode Lisensi Sekali Pakai (*Single-Use License Key*):</strong> Admin memberikan kode lisensi unik khusus (misal: <code className="text-sky-300 font-mono">GP-TITAN-XXXX-XXXX</code>) yang <strong>hanya berlaku 1x pakai di perangkat Anda dan langsung HANGUS</strong> sehingga tidak bisa dipakai orang lain.</li>
            </ul>
          </div>
        </div>

        {/* Bottom Actions & Check All */}
        <div className="pt-4 mt-3 border-t border-neutral-800 bg-[#171717] flex flex-col sm:flex-row items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300 hover:text-white">
            <input
              type="checkbox"
              checked={isAllAgreed}
              onChange={(e) => handleCheckAll(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-sky-500 focus:ring-0 cursor-pointer"
            />
            <span className="font-semibold text-white">
              Centang Semua: Saya Setuju & Tunduk pada Seluruh Persyaratan di Atas
            </span>
          </label>

          <button
            onClick={handleAcceptAll}
            disabled={!isAllAgreed}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-lg flex items-center justify-center gap-2 ${
              isAllAgreed
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-sky-500/20 active:scale-95 cursor-pointer'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Setujui &amp; Masuk ke Aplikasi VEXION AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
