import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  Hourglass,
  RefreshCw,
  Zap
} from 'lucide-react';
import { OneTimePasscode5H, ActivePasscodeSession } from '../types';
import { 
  generate5HourPasscode, 
  get5HourPasscodes, 
  redeem5HourPasscode, 
  getActive5HourSession,
  clearActive5HourSession,
  getOrCreateSessionId
} from '../utils/safeStorage';

interface OneTimePasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionActivated?: (session: ActivePasscodeSession) => void;
  clientSessionId?: string;
}

export const OneTimePasscodeModal: React.FC<OneTimePasscodeModalProps> = ({
  isOpen,
  onClose,
  onSessionActivated,
  clientSessionId
}) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'redeem'>('generate');
  const [passcodes, setPasscodes] = useState<OneTimePasscode5H[]>([]);
  const [latestCode, setLatestCode] = useState<OneTimePasscode5H | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [redeemResult, setRedeemResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Active session tracking
  const [activeSession, setActiveSession] = useState<{
    isActive: boolean;
    remainingMs: number;
    session: ActivePasscodeSession | null;
  }>({ isActive: false, remainingMs: 0, session: null });

  // Load passcodes & active session on open
  useEffect(() => {
    if (isOpen) {
      setPasscodes(get5HourPasscodes());
      checkActiveSession();
      setRedeemResult(null);
    }
  }, [isOpen]);

  // Live countdown ticker every 1 second
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      checkActiveSession();
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const checkActiveSession = () => {
    const status = getActive5HourSession();
    setActiveSession(status);
  };

  const handleGenerate = () => {
    const sid = clientSessionId || getOrCreateSessionId();
    const created = generate5HourPasscode(labelInput || undefined, sid);
    setLatestCode(created);
    setPasscodes(get5HourPasscodes());
    setLabelInput('');
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleShareWhatsApp = (code: string) => {
    const text = `Halo! Ini kode akses sekali pakai 5 jam untuk Global Pixel AI:\n\n*${code}*\n\nKode ini berlaku selama 5 jam sejak dibuat. Buka aplikasi di: ${window.location.origin} lalu masukkan kode di menu "Kode 5 Jam" di header.`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleRedeem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputCode.trim()) return;

    const sid = clientSessionId || getOrCreateSessionId();
    const result = redeem5HourPasscode(inputCode, sid);
    setRedeemResult(result);

    if (result.success && result.session) {
      checkActiveSession();
      setPasscodes(get5HourPasscodes());
      if (onSessionActivated) {
        onSessionActivated(result.session);
      }
    }
  };

  const handleRevokeActiveSession = () => {
    clearActive5HourSession();
    checkActiveSession();
  };

  const formatRemainingTime = (ms: number): string => {
    if (ms <= 0) return '00:00:00';
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-xl max-h-[90vh] bg-[#121216] border border-amber-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-gradient-to-r from-amber-950/60 via-[#181924] to-amber-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Kode Akses Sekali Pakai 5 Jam
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold">
                  5-Hour Pass
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Fitur pembuatan dan penukaran voucher akses temporer 5 jam
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

        {/* Active Session Banner (if currently in a 5-hour pass) */}
        {activeSession.isActive && activeSession.session && (
          <div className="bg-emerald-950/70 border-b border-emerald-500/40 px-4 py-3 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-bold text-emerald-300">
                Sesi 5 Jam Sedang Aktif!
              </span>
              <span className="font-mono text-emerald-200 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                ⏳ {formatRemainingTime(activeSession.remainingMs)}
              </span>
            </div>
            <button
              onClick={handleRevokeActiveSession}
              className="text-[11px] text-emerald-400 hover:text-emerald-200 underline cursor-pointer"
            >
              Akhiri Sesi
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 p-1.5 bg-neutral-900/90 border-b border-neutral-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('generate')}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'generate'
                ? 'bg-amber-500 text-black font-extrabold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Buat Kode Baru (5 Jam)</span>
          </button>

          <button
            onClick={() => setActiveTab('redeem')}
            className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'redeem'
                ? 'bg-amber-500 text-black font-extrabold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Tukarkan Kode (Redeem)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[calc(90vh-180px)]">
          {activeTab === 'generate' ? (
            <div className="space-y-4">
              {/* Generator Action Card */}
              <div className="bg-gradient-to-br from-[#181924] to-[#14141d] border border-amber-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Hourglass className="w-4 h-4 text-amber-400" />
                      Generator Kode Sekali Pakai 5 Jam
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Kode yang dihasilkan dapat digunakan oleh siapapun dan aktif tepat selama 5 jam sejak ditukarkan.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-neutral-300 font-medium">
                    Label / Catatan Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    placeholder="Contoh: Tamu Presentasi, Akses Klien, Uji Coba Tim"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-98 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Kode Sekali Pakai (Berlaku 5 Jam)</span>
                </button>
              </div>

              {/* Newly Generated Code Highlight */}
              {latestCode && (
                <div className="bg-amber-950/40 border border-amber-500/50 rounded-xl p-4 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      Kode Berhasil Dibuat! (Masa Berlaku: 5 Jam)
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Expired: {new Date(latestCode.expiresAt).toLocaleTimeString('id-ID')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-[#0d0d12] border border-amber-500/40 rounded-xl p-2.5 sm:p-3">
                    <span className="font-mono text-base sm:text-lg font-black tracking-wider text-amber-300 flex-1 select-all break-all text-center">
                      {latestCode.code}
                    </span>
                    <button
                      onClick={() => handleCopy(latestCode.code)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                      title="Salin Kode"
                    >
                      {copiedCode === latestCode.code ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleShareWhatsApp(latestCode.code)}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Kirim ke WhatsApp</span>
                    </button>
                    <button
                      onClick={() => {
                        setInputCode(latestCode.code);
                        setActiveTab('redeem');
                      }}
                      className="py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Tukarkan Sekarang
                    </button>
                  </div>
                </div>
              )}

              {/* History of Generated Passcodes */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-semibold text-neutral-300">Riwayat Kode 5 Jam ({passcodes.length})</span>
                  <button 
                    onClick={() => setPasscodes(get5HourPasscodes())}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Refresh</span>
                  </button>
                </div>

                {passcodes.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-neutral-800 rounded-xl text-neutral-500 text-xs">
                    Belum ada kode 5 jam yang dibuat. Klik tombol di atas untuk membuat kode baru.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {passcodes.map((item) => {
                      const isExpired = Date.now() > item.expiresAt;
                      return (
                        <div
                          key={item.code}
                          className="p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-amber-300 text-xs sm:text-sm">
                                {item.code}
                              </span>
                              {item.isRedeemed ? (
                                <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded border border-neutral-700">
                                  Telah Dipakai
                                </span>
                              ) : isExpired ? (
                                <span className="text-[10px] bg-red-950/60 text-red-300 px-1.5 py-0.5 rounded border border-red-500/30">
                                  Expired
                                </span>
                              ) : (
                                <span className="text-[10px] bg-emerald-950/60 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 font-bold">
                                  Aktif
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-400 truncate mt-0.5">
                              {item.label} • {new Date(item.createdAt).toLocaleTimeString('id-ID')}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleCopy(item.code)}
                              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                              title="Salin Kode"
                            >
                              {copiedCode === item.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            {!item.isRedeemed && !isExpired && (
                              <button
                                onClick={() => handleShareWhatsApp(item.code)}
                                className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
                                title="Kirim ke WhatsApp"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Tab 2: Redeem Passcode */
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-[#181924] to-[#14141d] border border-amber-500/30 rounded-xl p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    Tukarkan Kode Akses 5 Jam
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Masukkan kode 5 jam yang Anda terima untuk membuka akses tanpa batas kuota selama 5 jam penuh.
                  </p>
                </div>

                <form onSubmit={handleRedeem} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">
                      Kode Akses 5 Jam
                    </label>
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      placeholder="GPAI-5H-XXXX-XXXX"
                      className="w-full px-3 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm font-mono text-amber-300 placeholder-neutral-500 focus:outline-none focus:border-amber-500 uppercase tracking-wider text-center"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-98 cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Aktifkan Akses 5 Jam Sekarang</span>
                  </button>
                </form>

                {/* Redeem Feedback Result */}
                {redeemResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 animate-fadeIn ${
                      redeemResult.success
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                        : 'bg-red-950/60 border-red-500/50 text-red-200'
                    }`}
                  >
                    {redeemResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold">
                        {redeemResult.success ? 'Aktivasi Berhasil!' : 'Gagal Mengaktifkan'}
                      </div>
                      <div className="mt-0.5 leading-relaxed">
                        {redeemResult.message}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Information Notice */}
              <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-400 space-y-2">
                <div className="font-semibold text-neutral-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ketentuan Kode 5 Jam:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed text-neutral-400">
                  <li>Kode hanya bisa ditukarkan 1 kali (Single-use / Sekali Pakai).</li>
                  <li>Setelah ditukarkan, masa aktif tepat 5 jam (18.000 detik) di perangkat browser ini.</li>
                  <li>Membuka semua fitur AI termasuk pembuatan simulasi aplikasi, game canvas, dan strategi iklan.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-neutral-800 bg-[#0d0d12] flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Global Pixel AI Security Pass Engine</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
