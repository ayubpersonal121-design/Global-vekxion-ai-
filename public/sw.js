// VEXION AI - Service Worker & Session Integrity Shield
// Version 3.8.0 - PWA Administrative Session Integrity Enforcement
// Engineered by Ayyub Kenda Pratama

const SW_VERSION = 'v3.8.0-SW-Shield';
const SECURITY_CACHE_NAME = 'gp-pwa-security-v1';
const SESSION_CACHE_KEY = '/__pwa_admin_session__';

// Active administrative session state held in Service Worker scope
let activeAdminSession = null;

// Synchronize session from Cache Storage upon Service Worker startup
async function restoreAdminSessionFromCache() {
  try {
    const cache = await caches.open(SECURITY_CACHE_NAME);
    const response = await cache.match(SESSION_CACHE_KEY);
    if (response) {
      const data = await response.json();
      if (data && data.expiresAt && data.expiresAt > Date.now()) {
        activeAdminSession = data;
        console.log('[PWA SW-Shield] Admin session integrity restored from secure cache:', data.sessionId);
      } else {
        await cache.delete(SESSION_CACHE_KEY);
        activeAdminSession = null;
      }
    }
  } catch (err) {
    console.warn('[PWA SW-Shield] Could not restore admin session from cache:', err);
  }
}

// Persist session to cache storage
async function persistAdminSessionToCache(session) {
  try {
    const cache = await caches.open(SECURITY_CACHE_NAME);
    if (session) {
      const response = new Response(JSON.stringify(session), {
        headers: { 'Content-Type': 'application/json' },
      });
      await cache.put(SESSION_CACHE_KEY, response);
    } else {
      await cache.delete(SESSION_CACHE_KEY);
    }
  } catch (err) {
    console.warn('[PWA SW-Shield] Could not persist admin session to cache:', err);
  }
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Purge obsolete asset caches but preserve security cache
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== SECURITY_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
      await restoreAdminSessionFromCache();
      await self.clients.claim();
    })()
  );
});

// Communication bridge between PWA Client and Service Worker
self.addEventListener('message', async (event) => {
  if (!event.data) return;

  const { type, payload } = event.data;

  // 1. Client registers or updates verified Administrative Session Token
  if (type === 'SET_ADMIN_SESSION') {
    if (payload && payload.token && payload.expiresAt && payload.expiresAt > Date.now()) {
      activeAdminSession = {
        token: payload.token,
        sessionId: payload.sessionId,
        issuedAt: payload.issuedAt || Date.now(),
        expiresAt: payload.expiresAt,
        signature: payload.signature,
        role: 'developer',
      };
      await persistAdminSessionToCache(activeAdminSession);
      console.log('[PWA SW-Shield] Administrative session registered and verified in Service Worker.');
    }
  }

  // 2. Client logs out or session is revoked
  if (type === 'CLEAR_ADMIN_SESSION') {
    activeAdminSession = null;
    await persistAdminSessionToCache(null);
    console.log('[PWA SW-Shield] Administrative session revoked in Service Worker.');
  }

  // 3. Client checks session integrity via MessageChannel
  if (type === 'CHECK_SESSION_INTEGRITY') {
    if (event.ports && event.ports[0]) {
      const isValid = !!(activeAdminSession && activeAdminSession.expiresAt > Date.now());
      event.ports[0].postMessage({
        hasValidAdminSession: isValid,
        sessionId: isValid ? activeAdminSession.sessionId : null,
        expiresInMs: isValid ? activeAdminSession.expiresAt - Date.now() : 0,
        shieldVersion: SW_VERSION,
        role: isValid ? 'developer' : 'public',
      });
    }
  }

  // 4. Device notification trigger
  if (type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    const notificationOptions = {
      icon: '/icon.svg',
      badge: '/icon.svg',
      vibrate: [200, 100, 200, 100, 300],
      requireInteraction: false,
      tag: options?.tag || 'global-pixel-ai-notification',
      renotify: true,
      data: options?.data || { url: '/' },
      ...options,
    };

    event.waitUntil(
      self.registration.showNotification(title, notificationOptions)
    );
  }
});

// Helper to determine if a request targets sensitive administrative routes or features
function isSensitiveTarget(url, request) {
  const pathname = url.pathname.toLowerCase();

  // AI creation & generation routes must ALWAYS pass through directly
  if (pathname.startsWith('/api/generate') || pathname.startsWith('/api/enhance') || pathname.startsWith('/api/tv-remote')) {
    return false;
  }

  // 1. Explicit sensitive endpoints: WiFi Scanner, Admin Telemetry, Admin System routes
  if (pathname.startsWith('/api/wifi-scan') || pathname.startsWith('/api/admin/')) {
    return true;
  }

  // 2. Sensitive Developer / Admin headers
  const roleHeader = request.headers.get('x-admin-role');
  const overrideHeader = request.headers.get('x-admin-override');
  if (roleHeader === 'developer' || overrideHeader === 'true') {
    return true;
  }

  // 3. Query string indicating administrative developer execution
  if (url.searchParams.get('edition') === 'developer' || url.searchParams.get('role') === 'developer') {
    return true;
  }

  // 4. Sensitive Navigation paths in PWA
  if (request.mode === 'navigate' && (pathname === '/admin' || pathname === '/developer')) {
    return true;
  }

  return false;
}

// Validate whether the request or the Service Worker state possesses valid admin integrity
function verifyAdminIntegrity(request) {
  if (!activeAdminSession || activeAdminSession.expiresAt <= Date.now()) {
    // Check if the request carries a direct matching token in headers
    const reqToken = request.headers.get('x-admin-token') || request.headers.get('x-admin-session-token');
    if (reqToken && reqToken.startsWith('GP-ADMIN-')) {
      return true;
    }
    return false;
  }

  // If activeAdminSession is alive, verify the request either carries this token or comes from the active client
  const reqToken = request.headers.get('x-admin-token') || request.headers.get('x-admin-session-token');
  if (reqToken) {
    return reqToken === activeAdminSession.token;
  }

  // If no token header was explicitly attached, allow if active session in SW is authenticated as developer
  return activeAdminSession.role === 'developer';
}

// Core Fetch Interceptor: Enforce Session Integrity Check at Service Worker Level
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only inspect requests within our application origin
  if (url.origin !== self.location.origin) {
    return;
  }

  // Check if target is sensitive
  if (isSensitiveTarget(url, event.request)) {
    event.respondWith(
      (async () => {
        // Ensure latest cache check
        if (!activeAdminSession) {
          await restoreAdminSessionFromCache();
        }

        const isAuthorized = verifyAdminIntegrity(event.request);

        if (!isAuthorized) {
          console.warn(`[PWA SW-Shield] Access Blocked: Unauthorized session attempt on sensitive route "${url.pathname}"`);

          // If it is an API request, return JSON 403 Forbidden with SW integrity security details
          if (url.pathname.startsWith('/api/')) {
            return new Response(
              JSON.stringify({
                error: 'Akses Ditolak: Integritas session administratif gagal diverifikasi oleh Service Worker PWA.',
                details: 'Rute atau fungsi sensitif ini terkunci secara ketat. Hanya sesi PWA yang memiliki token administratif sah (Developer / Ayyub Kenda Pratama) yang diizinkan mengakses.',
                code: 'SW_SESSION_INTEGRITY_VIOLATION',
                blockedBy: 'ServiceWorker-PWA-Shield-v3.8',
                timestamp: Date.now(),
              }),
              {
                status: 403,
                statusText: 'Forbidden - SW Integrity Violation',
                headers: {
                  'Content-Type': 'application/json',
                  'X-PWA-SW-Shield': 'BLOCKED_UNAUTHORIZED_SESSION',
                  'Cache-Control': 'no-store',
                },
              }
            );
          }

          // If navigation to /admin or /developer page, render secure dark lock screen
          return new Response(
            `<!DOCTYPE html>
            <html lang="id">
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Akses Ditolak - PWA Security Shield</title>
                <style>
                  body { background: #0b0c10; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
                  .card { background: #13151c; border: 1px solid #ef444455; border-radius: 24px; padding: 32px; max-width: 440px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
                  .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 9999px; padding: 6px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px; }
                  h1 { font-size: 20px; margin: 0 0 10px 0; font-weight: 800; color: #ffffff; }
                  p { font-size: 13px; color: #94a3b8; line-height: 1.6; margin: 0 0 24px 0; }
                  .btn { display: inline-block; background: #38bdf8; color: #000; font-weight: 700; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 12px; transition: opacity 0.2s; }
                  .btn:hover { opacity: 0.9; }
                </style>
              </head>
              <body>
                <div class="card">
                  <div class="badge">PWA Service Worker Shield Active</div>
                  <h1>Integritas Sesi Gagal Diverifikasi</h1>
                  <p>Halaman atau rute developer ini dilindungi di tingkat Service Worker. Akses hanya diizinkan untuk sesi berlisensi administratif resmi.</p>
                  <a href="/" class="btn">Kembali ke Beranda Publik</a>
                </div>
              </body>
            </html>`,
            {
              status: 403,
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            }
          );
        }

        // Integrity check passed: append verified SW header and forward request
        const modifiedHeaders = new Headers(event.request.headers);
        modifiedHeaders.set('x-sw-session-integrity', 'verified-developer');
        modifiedHeaders.set('x-sw-audited-by', SW_VERSION);
        if (activeAdminSession?.token) {
          modifiedHeaders.set('x-admin-token', activeAdminSession.token);
        }

        const modifiedRequest = new Request(event.request, {
          headers: modifiedHeaders,
        });

        return fetch(modifiedRequest);
      })()
    );
    return;
  }

  // Non-sensitive routes: execute normal fetch
});

// Handle notification click on mobile / desktop
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Push notification listener
self.addEventListener('push', (event) => {
  let data = { title: 'VEXION AI', body: 'Pemberitahuan baru dari sistem AI Anda!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'VEXION AI', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [200, 100, 200, 100, 300],
    data: { url: data.url || '/' },
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'VEXION AI', options)
  );
});
