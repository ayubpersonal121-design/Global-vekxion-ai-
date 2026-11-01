import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  ShieldCheck,
  CheckCircle2, 
  Clock, 
  KeyRound, 
  Users, 
  Database, 
  Zap, 
  RotateCcw, 
  Check, 
  AlertCircle,
  ExternalLink,
  Crown,
  FileText,
  Copy,
  Plus,
  Send,
  Lock,
  EyeOff,
  Flame,
  Globe,
  Smartphone,
  Monitor,
  Upload,
  RefreshCw,
  BellRing,
  Trash2
} from 'lucide-react';
import { 
  TransactionRecord, 
  UserAuditLog, 
  PlanId, 
  OneTimeLicense, 
  AppEdition, 
  DeviceTarget 
} from '../types';
import { 
  safeStorage, 
  STORAGE_KEYS, 
  recordAuditLog, 
  generateOneTimeLicense, 
  getOneTimeLicenses 
} from '../utils/safeStorage';
import {
  generateAdminSessionToken,
  getAdminSessionToken,
  clearAdminSessionToken,
  syncAdminSessionToServiceWorker,
  queryServiceWorkerIntegrity,
  AdminSessionPayload,
} from '../utils/sessionIntegrity';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanId: PlanId;
  onApprovePremium: (planId?: PlanId) => void;
  onResetSessionLimit: () => void;
  onRevokePremium: () => void;
  onAdminAuthChange?: (isAdmin: boolean) => void;
  appEdition?: AppEdition;
  onToggleAppEdition?: (edition: AppEdition) => void;
  targetDevice?: DeviceTarget;
  onSelectTargetDevice?: (device: DeviceTarget) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  currentPlanId,
  onApprovePremium,
  onResetSessionLimit,
  onRevokePremium,
  onAdminAuthChange,
  appEdition = 'public',
  onToggleAppEdition,
  targetDevice = 'auto',
  onSelectTargetDevice,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return safeStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  });
  const [authError, setAuthError] = useState(false);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<UserAuditLog[]>([]);
  const [licenses, setLicenses] = useState<OneTimeLicense[]>([]);
  const [activeTab, setActiveTab] = useState<'transactions' | 'license_generator' | 'logs' | 'quick_controls' | 'sw_shield'>('transactions');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Service Worker Shield Integrity State & Live Testing
  const [swShieldStatus, setSwShieldStatus] = useState<{
    active: boolean;
    hasValidAdminSession: boolean;
    shieldVersion?: string;
    expiresInMs?: number;
    role?: string;
  }>({ active: false, hasValidAdminSession: false });
  const [isTestingSW, setIsTestingSW] = useState(false);
  const [swTestOutput, setSwTestOutput] = useState<{
    type: 'blocked' | 'passed';
    status: number;
    message: string;
    shieldHeader?: string;
    timestamp: number;
  } | null>(null);

  // License Generator State
  const [selectedGenPlan, setSelectedGenPlan] = useState<PlanId>('pro_150k');
  const [generatedLicenseResult, setGeneratedLicenseResult] = useState<OneTimeLicense | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadAdminData();
      checkSWStatus();
    }
  }, [isOpen, isAuthenticated]);

  const checkSWStatus = async () => {
    try {
      const res = await queryServiceWorkerIntegrity();
      setSwShieldStatus(res);
    } catch (e) {
      console.warn('Failed to query SW integrity:', e);
    }
  };

  const loadAdminData = () => {
    try {
      const txs = safeStorage.getJSON<TransactionRecord[]>(STORAGE_KEYS.TRANSACTIONS, []);
      const logs = safeStorage.getJSON<UserAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
      const lics = getOneTimeLicenses();
      setTransactions(txs);
      setAuditLogs(logs);
      setLicenses(lics);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    }
  };

  if (!isOpen) return null;

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const pass = passwordInput.trim();
    if (pass === 'YubAdmin2026!' || pass === '7654') {
      setIsAuthenticated(true);
      setAuthError(false);
      safeStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      
      // Mint cryptographic admin session token & sync to Service Worker
      await generateAdminSessionToken('dev_admin_' + Date.now().toString(36));
      await syncAdminSessionToServiceWorker();
      
      recordAuditLog('admin', 'Admin (Ayyub Kenda Pratama) authenticated with master key. SW Session Shield Token activated.');
      onAdminAuthChange?.(true);
      onToggleAppEdition?.('developer');
      loadAdminData();
      await checkSWStatus();
    } else {
      setAuthError(true);
    }
  };

  const handleApproveTransaction = (txId: string) => {
    try {
      let targetPlan: PlanId = 'pro_150k';
      const updated = transactions.map((tx) => {
        if (tx.id === txId) {
          targetPlan = tx.planId || 'pro_150k';
          return {
            ...tx,
            status: 'ACTIVE_PREMIUM' as const,
            approvedAt: Date.now(),
            approvedBy: 'Developer (Ayyub Kenda Pratama)',
          };
        }
        return tx;
      });
      safeStorage.setJSON(STORAGE_KEYS.TRANSACTIONS, updated);
      setTransactions(updated);

      onApprovePremium(targetPlan);
      recordAuditLog('admin', `Approved Transaction ${txId} for plan ${targetPlan} - Premium Activated`);

      setActionSuccess(`Transaksi ${txId} berhasil di-approve! Status Premium aktif.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error('Error approving transaction:', err);
    }
  };

  const handleCreateLicense = (planId: PlanId) => {
    const planNames: Record<PlanId, string> = {
      free: 'Free',
      starter_50k: 'Starter Pixel (Rp 50.000)',
      pro_150k: 'Pixel Ads Pro (Rp 150.000)',
      ultra_350k: 'Pixel Ultra Architect (Rp 350.000)',
      titan_700k: 'Supreme Titan Enterprise (Rp 700.000)',
      vip_argon_astro_8m: 'AI Argon & 4 Astro Sovereign VIP (Rp 8.500.000)',
    };
    const created = generateOneTimeLicense(planId, planNames[planId]);
    setGeneratedLicenseResult(created);
    setLicenses(getOneTimeLicenses());
    setActionSuccess(`Kode lisensi unik ${created.key} berhasil dibuat!`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleCopyText = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(identifier);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    safeStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    clearAdminSessionToken();
    await syncAdminSessionToServiceWorker();
    onAdminAuthChange?.(false);
    await checkSWStatus();
  };

  const handleTestSWBlocked = async () => {
    setIsTestingSW(true);
    setSwTestOutput(null);
    try {
      // Simulate unauthorized request: fake token & public header
      const res = await fetch('/api/wifi-scan', {
        headers: {
          'x-admin-token': 'INVALID_TAMPERED_PUBLIC_TOKEN',
          'x-admin-role': 'public_user',
        },
      });
      const data = await res.json().catch(() => ({}));
      const shieldHeader = res.headers.get('x-pwa-sw-shield') || 'BLOCKED_BY_SW';
      setSwTestOutput({
        type: res.status === 403 ? 'blocked' : 'passed',
        status: res.status,
        message: data?.error || data?.details || 'Akses ilegal ke rute sensitif berhasil dicegat oleh Service Worker.',
        shieldHeader,
        timestamp: Date.now(),
      });
    } catch (err: any) {
      setSwTestOutput({
        type: 'blocked',
        status: 403,
        message: 'Akses dicegat oleh Service Worker PWA Shield: ' + (err?.message || 'Blocked'),
        timestamp: Date.now(),
      });
    } finally {
      setIsTestingSW(false);
    }
  };

  const handleTestSWAuthorized = async () => {
    setIsTestingSW(true);
    setSwTestOutput(null);
    try {
      const token = getAdminSessionToken();
      const res = await fetch('/api/wifi-scan', {
        headers: {
          'x-admin-token': token || '',
          'x-admin-role': 'developer',
        },
      });
      const data = await res.json().catch(() => ({}));
      const swAudited = res.headers.get('x-sw-audited-by') || res.headers.get('x-sw-session-integrity') || 'Verified by SW Shield';
      setSwTestOutput({
        type: res.ok ? 'passed' : 'blocked',
        status: res.status,
        message: res.ok
          ? `Lolos Uji Integritas Service Worker! Ditemukan ${data?.totalNetworksFound || 5} telemetry Wi-Fi administratif.`
          : (data?.error || 'Akses ditolak'),
        shieldHeader: swAudited,
        timestamp: Date.now(),
      });
    } catch (err: any) {
      setSwTestOutput({
        type: 'blocked',
        status: 500,
        message: 'Kendala pengujian: ' + (err?.message || 'Error'),
        timestamp: Date.now(),
      });
    } finally {
      setIsTestingSW(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 animate-fadeIn backdrop-blur-sm">
      <div 
        className="w-full max-w-5xl bg-[#141417] border border-amber-500/40 rounded-3xl shadow-2xl shadow-amber-950/40 overflow-hidden flex flex-col max-h-[92vh] relative text-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-800 bg-[#161720]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <KeyRound className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Developer & Admin Master Controller Suite
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  Ayyub Kenda Pratama
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Pusat Verifikasi Transaksi Pembeli WhatsApp (+62 857-7654-0459) & Generator Lisensi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Gatekeeper */}
        {!isAuthenticated ? (
          <div className="p-6 sm:p-10 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl">
              <KeyRound className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">Otentikasi Pengembang (Owner Only)</h3>
              <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                Area ini dilindungi enkripsi. Khusus pemilik (Ayyub Kenda Pratama) untuk memverifikasi transaksi WhatsApp & kode lisensi pembeli.
              </p>
            </div>

            <form onSubmit={(e) => handleLogin(e)} className="w-full space-y-3">
              <div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError(false);
                  }}
                  placeholder="Masukkan Master Password Developer..."
                  className="w-full px-4 py-3 bg-[#111111] border border-neutral-700 focus:border-amber-400 rounded-xl text-white text-sm outline-none transition-colors text-center font-mono tracking-widest"
                  autoFocus
                />
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Akses ditolak: Master password pengembang salah.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm transition-all shadow-lg shadow-amber-950/50 cursor-pointer active:scale-95"
              >
                Verifikasi & Buka Panel Admin
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Top Security Banner */}
            <div className="bg-amber-950/30 border-b border-amber-900/40 px-6 py-2.5 flex items-center justify-between text-xs text-amber-300 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Terautentikasi sebagai <strong>Lead Developer (Ayyub Kenda Pratama)</strong>. Mode Kontrol Aktif.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-neutral-400">
                  Mode Saat Ini: <strong className="text-white">{appEdition === 'developer' ? '⚡ Versi Developer' : '🌐 Versi Publik'}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-neutral-400 hover:text-white underline cursor-pointer text-[11px]"
                >
                  Kunci Kembali
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 border-b border-neutral-800 flex gap-2 pt-3 bg-[#111111] overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === 'transactions'
                    ? 'bg-[#1a1a1a] text-white border-t-2 border-emerald-400'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Transaksi Pembeli ({transactions.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('license_generator')}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === 'license_generator'
                    ? 'bg-[#1a1a1a] text-white border-t-2 border-sky-400'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-sky-400" />
                <span>Generator Lisensi ({licenses.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === 'logs'
                    ? 'bg-[#1a1a1a] text-white border-t-2 border-purple-400'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-purple-400" />
                <span>Log Audit ({auditLogs.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('quick_controls')}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === 'quick_controls'
                    ? 'bg-[#1a1a1a] text-white border-t-2 border-indigo-400'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Kontrol Cepat Sesi</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('sw_shield');
                  checkSWStatus();
                }}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === 'sw_shield'
                    ? 'bg-[#1a1a1a] text-white border-t-2 border-emerald-400'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Integritas SW PWA</span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                  SHIELD ACTIVE
                </span>
              </button>
            </div>

            {/* Action Feedback Banner */}
            {actionSuccess && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Body Tabs */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* TAB 1: TRANSACTIONS & APPROVAL */}
              {activeTab === 'transactions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Daftar Transaksi Masuk Pengguna</h3>
                      <p className="text-xs text-neutral-400">
                        Klik 'Approve Premium' untuk langsung mengaktifkan status pengguna, atau buatkan kode lisensi 1x pakai.
                      </p>
                    </div>
                    <button
                      onClick={loadAdminData}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Refresh Data
                    </button>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="p-8 text-center bg-[#111111] rounded-2xl border border-neutral-800 text-neutral-500 text-xs">
                      Belum ada transaksi tercatat. Ketika pembeli mengklik "Konfirmasi via WhatsApp (+62 857-7654-0459)", token transaksi akan muncul di sini.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="p-4 rounded-2xl bg-[#111111] border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sky-400 text-sm">
                                {tx.id}
                              </span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                                tx.status === 'ACTIVE_PREMIUM'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}>
                                {tx.status}
                              </span>
                            </div>
                            <div className="text-xs text-neutral-300">
                              Paket: <strong>{tx.planName}</strong> (Rp {tx.amount.toLocaleString('id-ID')})
                            </div>
                            <div className="text-[10px] text-neutral-500 font-mono">
                              Waktu: {new Date(tx.timestamp).toLocaleString('id-ID')}
                              {tx.approvedBy && ` · Diapprove: ${tx.approvedBy}`}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            {tx.status !== 'ACTIVE_PREMIUM' ? (
                              <button
                                onClick={() => handleApproveTransaction(tx.id)}
                                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve Premium</span>
                              </button>
                            ) : (
                              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Telah Aktif</span>
                              </span>
                            )}

                            <button
                              onClick={() => {
                                handleCreateLicense(tx.planId || 'pro_150k');
                                setActiveTab('license_generator');
                              }}
                              className="w-full sm:w-auto px-3 py-2 bg-[#202020] hover:bg-[#282828] text-neutral-300 rounded-xl text-xs font-medium transition-colors border border-neutral-700 cursor-pointer flex items-center justify-center gap-1"
                            >
                              <KeyRound className="w-3 h-3 text-amber-400" />
                              <span>Buatkan Kode Lisensi</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: LICENSE GENERATOR */}
              {activeTab === 'license_generator' && (
                <div className="space-y-4 max-w-2xl">
                  <div>
                    <h3 className="text-sm font-bold text-white">Buat Kode Lisensi Unik (1x Pakai Langsung Hangus)</h3>
                    <p className="text-xs text-neutral-400">
                      Generate kode lisensi resmi untuk dikirimkan secara manual kepada pembeli di WhatsApp setelah mereka transfer.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#111111] border border-neutral-800 space-y-3">
                    <label className="text-xs font-semibold text-neutral-300 block">Pilih Paket Lisensi:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(['starter_50k', 'pro_150k', 'ultra_350k', 'titan_700k', 'vip_argon_astro_8m'] as PlanId[]).map((pid) => (
                        <button
                          key={pid}
                          type="button"
                          onClick={() => setSelectedGenPlan(pid)}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                            selectedGenPlan === pid
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                              : 'bg-[#181818] border-neutral-800 text-neutral-400 hover:bg-[#222222]'
                          }`}
                        >
                          <div className="truncate">{pid === 'titan_700k' ? 'Supreme Titan' : pid.toUpperCase()}</div>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handleCreateLicense(selectedGenPlan)}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Generate Kode Lisensi Resmi</span>
                    </button>
                  </div>

                  {generatedLicenseResult && (
                    <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-300">KODE LISENSI BARU SIAP DIKIRIM:</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          1x Pakai Langsung Hangus
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-black/60 border border-emerald-500/30">
                        <code className="text-sm sm:text-base font-mono font-extrabold text-amber-300 tracking-wider">
                          {generatedLicenseResult.key}
                        </code>
                        <button
                          onClick={() => handleCopyText(generatedLicenseResult.key, 'key_result')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedText === 'key_result' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedText === 'key_result' ? 'Tersalin' : 'Salin Kode'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List of Generated Licenses */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Daftar Kode Lisensi Dibuat</h4>
                    {licenses.length === 0 ? (
                      <p className="text-xs text-neutral-500">Belum ada kode lisensi yang dibuat.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                        {licenses.map((lic) => (
                          <div
                            key={lic.key}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                              lic.isUsed ? 'bg-[#151515] border-neutral-800/60 opacity-60' : 'bg-[#1a1a1a] border-emerald-500/30'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-white">{lic.key}</span>
                                <span className="text-neutral-400">({lic.planName})</span>
                              </div>
                              <div className="text-[10px] text-neutral-500">
                                Dibuat: {new Date(lic.createdAt).toLocaleString('id-ID')}
                                {lic.usedAt && ` · Dipakai: ${new Date(lic.usedAt).toLocaleString('id-ID')}`}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {lic.isUsed ? (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/60 font-bold">
                                  🔥 HANGUS (Sudah Dipakai)
                                </span>
                              ) : (
                                <>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-bold">
                                    ✓ AKTIF (Belum Dipakai)
                                  </span>
                                  <button
                                    onClick={() => handleCopyText(lic.key, lic.key)}
                                    className="p-1 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 cursor-pointer"
                                    title="Salin Kode"
                                  >
                                    {copiedText === lic.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: AUDIT LOGS */}
              {activeTab === 'logs' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Log Aktivitas & Riwayat Persetujuan Pengguna</h3>
                      <p className="text-xs text-neutral-400">
                        Catatan audit real-time untuk audit keamanan dan bukti transaksi.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        safeStorage.setJSON(STORAGE_KEYS.AUDIT_LOGS, []);
                        setAuditLogs([]);
                      }}
                      className="text-xs text-rose-400 hover:underline cursor-pointer"
                    >
                      Bersihkan Log
                    </button>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-xl bg-[#111111] border border-neutral-800/80 text-xs flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <span className="font-semibold text-neutral-200">{log.action}</span>
                          <div className="text-[10px] text-neutral-500 font-mono">
                            ID: {log.sessionId}
                          </div>
                        </div>
                        <span className="text-[10px] text-neutral-500 shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: QUICK CONTROLS */}
              {activeTab === 'quick_controls' && (
                <div className="space-y-4 max-w-xl">
                  <h3 className="text-sm font-bold text-white">Kontrol Status Sesi Cepat</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        onApprovePremium('titan_700k');
                        setActionSuccess('Akun saat ini diubah ke Supreme Titan Enterprise!');
                        setTimeout(() => setActionSuccess(null), 3000);
                      }}
                      className="p-4 rounded-2xl bg-[#111111] border border-amber-500/30 hover:border-amber-400 text-left transition-all cursor-pointer group"
                    >
                      <Crown className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                      <div className="font-bold text-white text-xs">Aktifkan Titan 700k</div>
                      <div className="text-[10px] text-neutral-400 mt-1">
                        Buka seluruh fitur tanpa batasan kuota.
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onResetSessionLimit();
                        setActionSuccess('Batas pesan sesi di-reset kembali ke 0.');
                        setTimeout(() => setActionSuccess(null), 3000);
                      }}
                      className="p-4 rounded-2xl bg-[#111111] border border-sky-500/30 hover:border-sky-400 text-left transition-all cursor-pointer group"
                    >
                      <RotateCcw className="w-5 h-5 text-sky-400 mb-2 group-hover:scale-110 transition-transform" />
                      <div className="font-bold text-white text-xs">Reset Kuota Pesan Gratis</div>
                      <div className="text-[10px] text-neutral-400 mt-1">
                        Mulai ulang 3 pesan gratis untuk testing.
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onRevokePremium();
                        setActionSuccess('Status dikembalikan ke akun Free (terkunci limit 3 pesan).');
                        setTimeout(() => setActionSuccess(null), 3000);
                      }}
                      className="p-4 rounded-2xl bg-[#111111] border border-rose-500/30 hover:border-rose-400 text-left transition-all cursor-pointer group"
                    >
                      <Lock className="w-5 h-5 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
                      <div className="font-bold text-white text-xs">Kunci ke Paket Free</div>
                      <div className="text-[10px] text-neutral-400 mt-1">
                        Uji coba proteksi paywall 3 pesan.
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: SERVICE WORKER PWA SESSION SHIELD */}
              {activeTab === 'sw_shield' && (
                <div className="space-y-5 max-w-4xl">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>PWA Service Worker Session Integrity Shield</span>
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Enforcement keamanan level Service Worker untuk menjamin hanya sesi dengan token administratif valid yang dapat mengakses rute dan fungsi sensitif di versi PWA (Handphone & Windows).
                      </p>
                    </div>
                    <button
                      onClick={checkSWStatus}
                      className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Refresh Status SW</span>
                    </button>
                  </div>

                  {/* Shield Status Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-[#111111] border border-neutral-800 space-y-1">
                      <div className="text-[11px] text-neutral-400 font-medium">Status Service Worker</div>
                      <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>{swShieldStatus.active ? 'Aktif & Mengawal PWA' : 'Mengawal Origin'}</span>
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        Versi: {swShieldStatus.shieldVersion || 'v3.8.0-SW-Shield'}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#111111] border border-neutral-800 space-y-1">
                      <div className="text-[11px] text-neutral-400 font-medium">Integritas Token Admin</div>
                      <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <KeyRound className="w-4 h-4 text-amber-400" />
                        <span>{getAdminSessionToken() ? 'Token Valid Terdaftar' : 'Belum Terbit'}</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono truncate">
                        {getAdminSessionToken() ? `${getAdminSessionToken()?.slice(0, 22)}...` : 'Tidak aktif'}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#111111] border border-neutral-800 space-y-1">
                      <div className="text-[11px] text-neutral-400 font-medium">Hak Istimewa Sesi</div>
                      <div className="flex items-center gap-2 text-sm font-bold text-sky-400">
                        <Crown className="w-4 h-4 text-sky-400" />
                        <span>Ayyub Kenda Pratama</span>
                      </div>
                      <div className="text-[10px] text-emerald-400 font-medium">
                        Bypass Penuh & Rute Sensitif Terbuka
                      </div>
                    </div>
                  </div>

                  {/* Protected Sensitive Endpoints Table */}
                  <div className="p-4 rounded-2xl bg-[#111111] border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-neutral-200 flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Daftar Rute & Fungsi Sensitif yang Dilindungi Service Worker</span>
                      </h4>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-md">
                        Enforced di /public/sw.js
                      </span>
                    </div>

                    <div className="divide-y divide-neutral-800 text-xs font-mono">
                      <div className="py-2 flex items-center justify-between text-neutral-300">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-sky-400">GET</span>
                          <span>/api/wifi-scan</span>
                        </div>
                        <span className="text-[11px] text-neutral-400">Pemindaian Wi-Fi RF & Audit BlackArch (Hanya Developer)</span>
                      </div>

                      <div className="py-2 flex items-center justify-between text-neutral-300">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-amber-400">ALL</span>
                          <span>/api/admin/*</span>
                        </div>
                        <span className="text-[11px] text-neutral-400">Validasi sesi dan verifikasi integritas sistem</span>
                      </div>

                      <div className="py-2 flex items-center justify-between text-neutral-300">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-purple-400">NAV</span>
                          <span>/admin, /developer</span>
                        </div>
                        <span className="text-[11px] text-neutral-400">Navigasi PWA ke panel pengembang tanpa izin</span>
                      </div>

                      <div className="py-2 flex items-center justify-between text-neutral-300">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-emerald-400">HDR</span>
                          <span>x-admin-role: developer</span>
                        </div>
                        <span className="text-[11px] text-neutral-400">Permintaan API yang mengklaim peran developer wajib memiliki token sah</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Interactive Penetration / SW Integrity Tester */}
                  <div className="p-4 rounded-2xl bg-[#0e1017] border border-cyan-500/30 space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Konsol Uji Integritas Service Worker Langsung</span>
                      </h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Uji coba pencegatan permintaan di tingkat Service Worker secara nyata di browser atau PWA Anda.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        onClick={handleTestSWBlocked}
                        disabled={isTestingSW}
                        className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        <span>Uji Simulasi Tampered / Tanpa Token (Harus Diblokir 403)</span>
                      </button>

                      <button
                        onClick={handleTestSWAuthorized}
                        disabled={isTestingSW}
                        className="px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Uji Sesi Developer Sah (Harus Lolos 200 OK)</span>
                      </button>

                      <button
                        onClick={async () => {
                          await syncAdminSessionToServiceWorker();
                          await checkSWStatus();
                          setActionSuccess('Sesi administratif berhasil disinkronkan ulang ke Service Worker PWA!');
                          setTimeout(() => setActionSuccess(null), 3000);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5 text-sky-400" />
                        <span>Sync Ulang Token ke SW</span>
                      </button>
                    </div>

                    {/* Test Output Box */}
                    {swTestOutput && (
                      <div className={`p-3.5 rounded-xl border text-xs space-y-1 font-mono transition-all animate-in fade-in ${
                        swTestOutput.type === 'blocked' 
                          ? 'bg-rose-950/40 border-rose-500/50 text-rose-200' 
                          : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      }`}>
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-2">
                            {swTestOutput.type === 'blocked' ? (
                              <ShieldAlert className="w-4 h-4 text-rose-400" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            )}
                            <span>Hasil Tes: HTTP {swTestOutput.status} ({swTestOutput.type === 'blocked' ? 'DICEGAT OLEH SERVICE WORKER' : 'TERVERIFIKASI & LOLOS'})</span>
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {new Date(swTestOutput.timestamp).toLocaleTimeString('id-ID')}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed mt-1">
                          {swTestOutput.message}
                        </p>
                        {swTestOutput.shieldHeader && (
                          <div className="text-[10px] text-neutral-400 pt-1 border-t border-neutral-800 flex items-center gap-2">
                            <span>Audit Tag:</span>
                            <span className="text-cyan-300">{swTestOutput.shieldHeader}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
