// Session Integrity & Cryptographic Token Utility for Service Worker PWA Shield
// Engineered for VEXION AI (Ayyub Kenda Pratama)

import { safeStorage, STORAGE_KEYS } from './safeStorage';

const SW_ADMIN_TOKEN_KEY = 'pixelads_admin_session_token_v1';
const SECRET_SALT = 'AKP_GLOBAL_PIXEL_SECURE_SW_SALT_2026_YUB';

// Simple SHA-256 hash using Web Crypto API
async function sha256(message: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback below
    }
  }

  // Pure JS fallback DJB2/FNV hash
  let hash = 5381;
  for (let i = 0; i < message.length; i++) {
    hash = ((hash << 5) + hash) + message.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

export interface AdminSessionPayload {
  token: string;
  sessionId: string;
  issuedAt: number;
  expiresAt: number;
  role: 'developer';
  signature: string;
}

/**
 * Mint a cryptographic administrative session token tied to the client session ID.
 */
export async function generateAdminSessionToken(sessionId: string): Promise<AdminSessionPayload> {
  const now = Date.now();
  const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours validity
  const payloadString = `${sessionId}:${now}:${expiresAt}:${SECRET_SALT}`;
  const signature = (await sha256(payloadString)).slice(0, 32);
  const token = `GP-ADMIN-${now.toString(36)}-${signature}`;

  const payload: AdminSessionPayload = {
    token,
    sessionId,
    issuedAt: now,
    expiresAt,
    role: 'developer',
    signature,
  };

  saveAdminSessionToken(token);
  safeStorage.setJSON('pixelads_admin_session_payload_v1', payload);

  return payload;
}

export function getAdminSessionToken(): string | null {
  return safeStorage.getItem(SW_ADMIN_TOKEN_KEY);
}

export function getAdminSessionPayload(): AdminSessionPayload | null {
  return safeStorage.getJSON<AdminSessionPayload | null>('pixelads_admin_session_payload_v1', null);
}

export function saveAdminSessionToken(token: string): void {
  safeStorage.setItem(SW_ADMIN_TOKEN_KEY, token);
}

export function clearAdminSessionToken(): void {
  safeStorage.removeItem(SW_ADMIN_TOKEN_KEY);
  safeStorage.removeItem('pixelads_admin_session_payload_v1');
}

/**
 * Sync the admin session to the active Service Worker via postMessage.
 */
export async function syncAdminSessionToServiceWorker(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const controller = navigator.serviceWorker.controller || registration.active;

    if (!controller) {
      console.warn('[PWA SW-Shield] No active service worker controller to sync session with.');
      return false;
    }

    const payload = getAdminSessionPayload();
    const token = getAdminSessionToken();

    if (token && payload && payload.expiresAt > Date.now()) {
      controller.postMessage({
        type: 'SET_ADMIN_SESSION',
        payload: {
          token,
          sessionId: payload.sessionId,
          issuedAt: payload.issuedAt,
          expiresAt: payload.expiresAt,
          signature: payload.signature,
          role: 'developer',
        },
      });
      return true;
    } else {
      controller.postMessage({
        type: 'CLEAR_ADMIN_SESSION',
      });
      return false;
    }
  } catch (err) {
    console.warn('[PWA SW-Shield] Failed to sync session to Service Worker:', err);
    return false;
  }
}

/**
 * Request real-time integrity status confirmation from the Service Worker.
 */
export function queryServiceWorkerIntegrity(): Promise<{
  active: boolean;
  hasValidAdminSession: boolean;
  sessionId?: string;
  expiresInMs?: number;
  shieldVersion?: string;
}> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      resolve({ active: false, hasValidAdminSession: false });
      return;
    }

    const timeout = setTimeout(() => {
      resolve({ active: false, hasValidAdminSession: false });
    }, 1500);

    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (event) => {
      clearTimeout(timeout);
      resolve({
        active: true,
        hasValidAdminSession: !!event.data?.hasValidAdminSession,
        sessionId: event.data?.sessionId,
        expiresInMs: event.data?.expiresInMs,
        shieldVersion: event.data?.shieldVersion || 'v3.8-SW-Shield',
      });
    };

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(
        { type: 'CHECK_SESSION_INTEGRITY' },
        [messageChannel.port2]
      );
    } else {
      clearTimeout(timeout);
      resolve({ active: false, hasValidAdminSession: false });
    }
  });
}
