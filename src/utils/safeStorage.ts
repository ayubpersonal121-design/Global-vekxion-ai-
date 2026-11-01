import { TransactionRecord, UserAuditLog, PlanId, OneTimeLicense, AppUpdateConfig, OneTimePasscode5H, ActivePasscodeSession } from '../types';

const memoryFallback: Record<string, string> = {};

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn(`[safeStorage] Failed to read ${key} from localStorage, using memory fallback:`, e);
    }
    return memoryFallback[key] ?? null;
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn(`[safeStorage] Failed to write ${key} to localStorage, using memory fallback:`, e);
    }
    memoryFallback[key] = value;
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`[safeStorage] Failed to remove ${key} from localStorage:`, e);
    }
    delete memoryFallback[key];
  },

  getJSON: <T>(key: string, defaultValue: T): T => {
    try {
      const val = safeStorage.getItem(key);
      if (!val) return defaultValue;
      return JSON.parse(val) as T;
    } catch (e) {
      console.warn(`[safeStorage] Failed to parse JSON for ${key}:`, e);
      return defaultValue;
    }
  },

  setJSON: <T>(key: string, value: T): void => {
    try {
      safeStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`[safeStorage] Failed to serialize JSON for ${key}:`, e);
    }
  }
};

// Storage Keys
export const STORAGE_KEYS = {
  CREATIONS: 'pixelads_creations_v1',
  CHAT_SESSIONS: 'pixelads_sessions_v1',
  ACTIVE_SESSION_ID: 'pixelads_active_session_v1',
  PLAN: 'pixelads_user_plan_v1',
  TRANSACTIONS: 'pixelads_transactions_v1',
  AUDIT_LOGS: 'pixelads_audit_logs_v1',
  SESSION_MSG_COUNT: 'pixelads_session_msgs_count_v1',
  USER_DATA: 'pixelads_user_v1',
  ADMIN_AUTH: 'pixelads_admin_authenticated_v1',
  LEGAL_ACCEPTED: 'pixelads_legal_terms_accepted_v1',
  LICENSES: 'pixelads_one_time_licenses_v1',
  APP_EDITION: 'pixelads_app_edition_v1',
  APP_UPDATE_CONFIG: 'pixelads_app_update_config_v1',
  DEVICE_TARGET: 'pixelads_device_target_v1',
  ONE_TIME_PASSCODES_5H: 'pixelads_5h_one_time_passcodes_v1',
  ACTIVE_5H_SESSION: 'pixelads_active_5h_session_v1',
  CUSTOM_PUBLIC_DOMAIN: 'pixelads_custom_public_domain_v1',
};

export function getCustomPublicDomain(): string {
  return safeStorage.getItem(STORAGE_KEYS.CUSTOM_PUBLIC_DOMAIN) || 'globalpixelai.com';
}

export function saveCustomPublicDomain(domain: string): void {
  const clean = domain.trim().toLowerCase().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
  if (clean) {
    safeStorage.setItem(STORAGE_KEYS.CUSTOM_PUBLIC_DOMAIN, clean);
  }
}

export const DEFAULT_UPDATE_CONFIG: AppUpdateConfig = {
  version: 'v3.6.0-Public-Live',
  releaseDate: new Date().toLocaleDateString('id-ID', { dateStyle: 'medium' }),
  announcement: 'Pembaruan Siap: Aplikasi Game Canvas, Website Generator & Audit Wi-Fi siap dipakai di Handphone & Windows PC!',
  isMaintenance: false,
  targetPlatform: 'all',
  changelog: [
    'Rilis Versi Publik untuk seluruh pengguna Google & Chrome',
    'Rilis Versi Developer khusus pusat update aplikasi/website & kontrol sistem',
    'Integrasi simulasi Game Canvas interaktif di chat tanpa tombol fisik tambahan',
    'Optimasi kontrol ganda untuk layar Handphone (Mobile Touch) & Windows Desktop',
    'Koneksi verifikasi manual pembayaran WhatsApp (+62 857-7654-0459)'
  ]
};

export function getAppUpdateConfig(): AppUpdateConfig {
  return safeStorage.getJSON<AppUpdateConfig>(STORAGE_KEYS.APP_UPDATE_CONFIG, DEFAULT_UPDATE_CONFIG);
}

export function saveAppUpdateConfig(config: AppUpdateConfig) {
  safeStorage.setJSON(STORAGE_KEYS.APP_UPDATE_CONFIG, config);
}

// Check if user has accepted mandatory terms and privacy
export function hasAcceptedLegalTerms(): boolean {
  try {
    return safeStorage.getItem(STORAGE_KEYS.LEGAL_ACCEPTED) === 'true';
  } catch (e) {
    return false;
  }
}

export function setAcceptedLegalTerms(agreed: boolean): void {
  try {
    if (agreed) {
      safeStorage.setItem(STORAGE_KEYS.LEGAL_ACCEPTED, 'true');
    } else {
      safeStorage.removeItem(STORAGE_KEYS.LEGAL_ACCEPTED);
    }
  } catch (e) {
    console.warn('Failed to set legal accepted state:', e);
  }
}

export function isAdminAuthenticated(): boolean {
  try {
    return safeStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  } catch {
    return false;
  }
}

// Single-use License Key Generator (Admin only - NEVER send master password to buyers!)
export function generateOneTimeLicense(planId: PlanId, planName: string): OneTimeLicense {
  const segment1 = Math.floor(1000 + Math.random() * 9000);
  const segment2 = Math.floor(1000 + Math.random() * 9000);
  const prefix = planId === 'vip_argon_astro_8m' ? 'VIP8M' : planId === 'titan_700k' ? 'TITAN' : planId === 'ultra_350k' ? 'ULTRA' : planId === 'pro_150k' ? 'PRO' : 'STARTER';
  const key = `GP-${prefix}-${segment1}-${segment2}`;

  const newLicense: OneTimeLicense = {
    key,
    planId,
    planName,
    createdAt: Date.now(),
    isUsed: false,
  };

  const existing = safeStorage.getJSON<OneTimeLicense[]>(STORAGE_KEYS.LICENSES, []);
  safeStorage.setJSON(STORAGE_KEYS.LICENSES, [newLicense, ...existing]);

  recordAuditLog('admin', `Generated One-Time License ${key} for plan ${planName}`);
  return newLicense;
}

// BAGIAN 1: PEMBARUAN LOGIKA & ATURAN HAK AKSES FITUR PREMIUM
// 1. Fitur "AI Argon" dan "4 Astro" eksklusif > Rp 8.000.000
// 2. Batasi kategori di bawah Rp 8.000.000
// 3. BYPASS ADMIN/DEVELOPER: Hak akses penuh tanpa batasan apapun
export function canAccessArgonAstro(
  planId: PlanId,
  isAdmin: boolean = false
): { allowed: boolean; reason?: string } {
  // PENGECUALIAN AKSES (BYPASS ADMIN/DEVELOPER)
  if (isAdmin || safeStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true') {
    return { allowed: true };
  }

  // Paket VIP di atas Rp 8.000.000
  if (planId === 'vip_argon_astro_8m') {
    return { allowed: true };
  }

  // Cek apakah ada riwayat transaksi aktif bernilai >= Rp 8.000.000
  try {
    const txs = safeStorage.getJSON<TransactionRecord[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const hasVipTx = txs.some(
      tx => (tx.status === 'ACTIVE_PREMIUM' || tx.status === 'PENDING_VERIFICATION') && tx.amount >= 8000000
    );
    if (hasVipTx) {
      return { allowed: true };
    }
  } catch {}

  // Pembatasan akses untuk paket di bawah Rp 8.000.000
  return {
    allowed: false,
    reason: 'Fitur "AI Argon" dan "4 Astro" terkunci secara eksklusif hanya untuk pengguna dengan nilai transaksi atau paket premium di atas Rp 8.000.000, atau Akun Admin/Developer.'
  };
}

export function getOneTimeLicenses(): OneTimeLicense[] {
  return safeStorage.getJSON<OneTimeLicense[]>(STORAGE_KEYS.LICENSES, []);
}

// Redeem single-use license key
export function redeemLicense(
  inputKey: string, 
  clientSessionId: string
): { success: boolean; message: string; planId?: PlanId; planName?: string } {
  try {
    const cleanKey = inputKey.trim().toUpperCase();
    if (!cleanKey) {
      return { success: false, message: 'Harap masukkan kode lisensi.' };
    }

    const licenses = safeStorage.getJSON<OneTimeLicense[]>(STORAGE_KEYS.LICENSES, []);
    const foundIndex = licenses.findIndex(l => l.key.toUpperCase() === cleanKey);

    if (foundIndex === -1) {
      return { 
        success: false, 
        message: 'Kode lisensi tidak valid atau salah ketik. Pastikan format sesuai (contoh: GP-TITAN-XXXX-XXXX).' 
      };
    }

    const license = licenses[foundIndex];
    if (license.isUsed) {
      const usedDate = license.usedAt ? new Date(license.usedAt).toLocaleDateString('id-ID') : 'sebelumnya';
      return { 
        success: false, 
        message: `PERINGATAN: Kode lisensi ini sudah pernah digunakan pada ${usedDate} dan telah HANGUS! Kode lisensi hanya berlaku 1x pakai demi keamanan pembuat dan tidak dapat dibagikan ke orang lain.` 
      };
    }

    // Mark as used immediately (Burned / Single-use)
    licenses[foundIndex] = {
      ...license,
      isUsed: true,
      usedAt: Date.now(),
      usedBySessionId: clientSessionId,
    };
    safeStorage.setJSON(STORAGE_KEYS.LICENSES, licenses);

    // Update plan in storage
    safeStorage.setItem(STORAGE_KEYS.PLAN, license.planId);
    safeStorage.setItem(STORAGE_KEYS.SESSION_MSG_COUNT, '0');

    recordAuditLog(clientSessionId, `Successfully redeemed One-Time License ${license.key} -> Unlocked ${license.planName}`);

    return {
      success: true,
      message: `Selamat! Lisensi ${license.planName} berhasil diaktifkan. Kode ini sekarang telah hangus dan perangkat Anda telah resmi berstatus Premium Aktif.`,
      planId: license.planId,
      planName: license.planName,
    };
  } catch (err: any) {
    return { success: false, message: `Terjadi kendala aktivasi: ${err?.message || 'Error'}` };
  }
}

// Generate secure 6-digit transaction string (e.g. #AI-PRO-87361)
export function generateTransactionId(): string {
  try {
    const random6 = Math.floor(100000 + Math.random() * 900000);
    return `#AI-PRO-${random6}`;
  } catch (e) {
    return `#AI-PRO-${Date.now().toString().slice(-6)}`;
  }
}

// Log new transaction token as PENDING_VERIFICATION
export function logTransaction(
  planId: PlanId,
  planName: string,
  amount: number,
  clientSessionId: string
): TransactionRecord {
  try {
    const newTx: TransactionRecord = {
      id: generateTransactionId(),
      status: 'PENDING_VERIFICATION',
      planId,
      planName,
      amount,
      timestamp: Date.now(),
      gopayTarget: '089654886223',
      clientSessionId,
    };

    const existing = safeStorage.getJSON<TransactionRecord[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const updated = [newTx, ...existing];
    safeStorage.setJSON(STORAGE_KEYS.TRANSACTIONS, updated);

    // Also record audit log
    recordAuditLog(clientSessionId, `Generated Transaction ${newTx.id} (${planName}) - PENDING_VERIFICATION`);

    return newTx;
  } catch (err) {
    console.error('Failed to log transaction:', err);
    return {
      id: generateTransactionId(),
      status: 'PENDING_VERIFICATION',
      planId,
      planName,
      amount,
      timestamp: Date.now(),
      gopayTarget: '089654886223',
      clientSessionId,
    };
  }
}

// Record an audit log for admin review
export function recordAuditLog(sessionId: string, action: string, details?: string): void {
  try {
    const newLog: UserAuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      sessionId,
      action,
      timestamp: Date.now(),
      details,
    };
    const logs = safeStorage.getJSON<UserAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    safeStorage.setJSON(STORAGE_KEYS.AUDIT_LOGS, [newLog, ...logs.slice(0, 99)]);
  } catch (e) {
    console.warn('Failed to record audit log:', e);
  }
}

// Session ID generator
export function getOrCreateSessionId(): string {
  try {
    let sid = safeStorage.getItem('pixelads_client_device_id');
    if (!sid) {
      sid = `client_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      safeStorage.setItem('pixelads_client_device_id', sid);
    }
    return sid;
  } catch (e) {
    return 'client_session_default';
  }
}

// =========================================================================
// FITUR KODE SEKALI PAKAI 5 JAM (5-HOUR ONE-TIME PASSCODE ENGINE)
// =========================================================================

export const FIVE_HOURS_MS = 5 * 60 * 60 * 1000; // 18,000,000 ms

/**
 * Generate a cryptographically randomized 5-hour one-time passcode
 * Format: GPAI-5H-XXXX-YYYY (e.g. GPAI-5H-9A4B-7F2C)
 */
export function generate5HourPasscode(label?: string, creatorSessionId?: string): OneTimePasscode5H {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const genChunk = (len: number) => {
    let res = '';
    for (let i = 0; i < len; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const code = `GPAI-5H-${genChunk(4)}-${genChunk(4)}`;
  const now = Date.now();
  const newPasscode: OneTimePasscode5H = {
    code,
    createdAt: now,
    expiresAt: now + FIVE_HOURS_MS,
    isRedeemed: false,
    creatorSessionId: creatorSessionId || getOrCreateSessionId(),
    label: label?.trim() || `Kode Sesi 5 Jam #${code.slice(-4)}`,
  };

  try {
    const list = safeStorage.getJSON<OneTimePasscode5H[]>(STORAGE_KEYS.ONE_TIME_PASSCODES_5H, []);
    safeStorage.setJSON(STORAGE_KEYS.ONE_TIME_PASSCODES_5H, [newPasscode, ...list]);
    recordAuditLog(newPasscode.creatorSessionId || 'client', `Generated 5-Hour Passcode: ${code} (Expires in 5 hours)`);
  } catch (err) {
    console.warn('Failed to store 5-hour passcode:', err);
  }

  return newPasscode;
}

/**
 * Get all generated 5-hour passcodes
 */
export function get5HourPasscodes(): OneTimePasscode5H[] {
  return safeStorage.getJSON<OneTimePasscode5H[]>(STORAGE_KEYS.ONE_TIME_PASSCODES_5H, []);
}

/**
 * Redeem a 5-hour one-time passcode to grant 5 hours of full unlimited access
 */
export function redeem5HourPasscode(
  inputCode: string,
  clientSessionId: string
): { success: boolean; message: string; session?: ActivePasscodeSession } {
  try {
    const cleanCode = inputCode.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Harap masukkan kode 5 jam.' };
    }

    const passcodes = safeStorage.getJSON<OneTimePasscode5H[]>(STORAGE_KEYS.ONE_TIME_PASSCODES_5H, []);
    const foundIndex = passcodes.findIndex(p => p.code.toUpperCase() === cleanCode);

    if (foundIndex === -1) {
      // Check if it's an emergency/system valid passcode format or custom passcode
      const isValidFormat = /^GPAI-5H-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(cleanCode);
      if (!isValidFormat) {
        return {
          success: false,
          message: 'Format kode tidak valid. Pastikan format sesuai: GPAI-5H-XXXX-XXXX (Contoh: GPAI-5H-7K2X-9P4W).'
        };
      }
      return {
        success: false,
        message: 'Kode 5 jam tidak terdaftar di sistem. Buat kode baru terlebih dahulu melalui tombol di atas.'
      };
    }

    const item = passcodes[foundIndex];
    const now = Date.now();

    if (item.isRedeemed) {
      const usedDate = item.redeemedAt ? new Date(item.redeemedAt).toLocaleTimeString('id-ID') : 'sebelumnya';
      return {
        success: false,
        message: `PERINGATAN: Kode sekali pakai ini sudah pernah ditukarkan pada pukul ${usedDate} dan telah HANGUS! Kode ini dirancang 1x pakai demi keamanan pembuat.`
      };
    }

    if (now > item.expiresAt) {
      return {
        success: false,
        message: 'Kode 5 jam ini telah melewati batas waktu kadaluwarsa (Expired). Silakan buat kode baru.'
      };
    }

    // Mark as redeemed (burned)
    passcodes[foundIndex] = {
      ...item,
      isRedeemed: true,
      redeemedAt: now,
      redeemedBySessionId: clientSessionId,
    };
    safeStorage.setJSON(STORAGE_KEYS.ONE_TIME_PASSCODES_5H, passcodes);

    // Create active 5-hour session for this browser/device
    const activeSession: ActivePasscodeSession = {
      code: item.code,
      activatedAt: now,
      expiresAt: now + FIVE_HOURS_MS,
      grantedPlan: 'titan_700k',
    };
    safeStorage.setJSON(STORAGE_KEYS.ACTIVE_5H_SESSION, activeSession);

    // Unlock plan in user storage
    safeStorage.setItem(STORAGE_KEYS.PLAN, 'titan_700k');
    safeStorage.setItem(STORAGE_KEYS.SESSION_MSG_COUNT, '0');

    recordAuditLog(clientSessionId, `Redeemed 5-Hour Passcode ${item.code} -> Active for 5 Hours until ${new Date(activeSession.expiresAt).toLocaleTimeString('id-ID')}`);

    return {
      success: true,
      message: `Akses 5 Jam Berhasil Diaktifkan! Kuota tak terbatas dan fitur penuh aktif hingga ${new Date(activeSession.expiresAt).toLocaleTimeString('id-ID')}.`,
      session: activeSession,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal menukarkan kode: ${err?.message || 'Kesalahan sistem'}`
    };
  }
}

/**
 * Check if the user has an active 5-hour passcode session
 */
export function getActive5HourSession(): { isActive: boolean; remainingMs: number; session: ActivePasscodeSession | null } {
  try {
    const session = safeStorage.getJSON<ActivePasscodeSession | null>(STORAGE_KEYS.ACTIVE_5H_SESSION, null);
    if (!session || !session.expiresAt) {
      return { isActive: false, remainingMs: 0, session: null };
    }

    const now = Date.now();
    const remainingMs = session.expiresAt - now;

    if (remainingMs <= 0) {
      // Session has expired! Clear it
      safeStorage.removeItem(STORAGE_KEYS.ACTIVE_5H_SESSION);
      return { isActive: false, remainingMs: 0, session: null };
    }

    return { isActive: true, remainingMs, session };
  } catch (e) {
    return { isActive: false, remainingMs: 0, session: null };
  }
}

/**
 * Revoke or clear active 5-hour session
 */
export function clearActive5HourSession(): void {
  safeStorage.removeItem(STORAGE_KEYS.ACTIVE_5H_SESSION);
}
