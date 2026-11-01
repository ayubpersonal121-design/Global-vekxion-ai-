export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  type: 'ai_complete' | 'tip' | 'system' | 'custom';
  url?: string;
}

const STORAGE_NOTIFICATIONS_KEY = 'globalpixel_device_notifications_v1';
const STORAGE_NOTIF_SETTINGS_KEY = 'globalpixel_notif_settings_v1';

export interface NotificationSettings {
  autoAINotif: boolean;
  vibrate: boolean;
  sound: boolean;
  dailyTips: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  autoAINotif: true,
  vibrate: true,
  sound: true,
  dailyTips: true,
};

export const getNotificationSettings = (): NotificationSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_NOTIF_SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {}
  return DEFAULT_SETTINGS;
};

export const saveNotificationSettings = (settings: NotificationSettings) => {
  try {
    localStorage.setItem(STORAGE_NOTIF_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {}
};

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

export const requestDeviceNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    console.warn('Error requesting notification permission:', e);
    return 'denied';
  }
};

// Play pleasant web audio chime
export const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    
    // Pleasant futuristic double chime
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  } catch (e) {
    // Audio context may require user interaction first
  }
};

// Trigger mobile haptic vibration
export const triggerPhoneVibration = (pattern = [200, 100, 200, 100, 300]): boolean => {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
      return navigator.vibrate(pattern);
    }
  } catch (e) {}
  return false;
};

// Get stored notifications history
export const getStoredNotifications = (): AppNotification[] => {
  try {
    const raw = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [
    {
      id: 'welcome-notif',
      title: 'Selamat Datang di VEXION AI!',
      body: 'Fitur notifikasi ke handphone aktif untuk semua pengguna (Free & Premium). Anda akan menerima pemberitahuan saat AI selesai memproses karya Anda.',
      timestamp: Date.now() - 3600000,
      read: false,
      type: 'system',
      url: '/'
    }
  ];
};

export const saveNotifications = (notifications: AppNotification[]) => {
  try {
    localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch (e) {}
};

// Main function to dispatch notification to user's phone / screen
export const sendDeviceNotification = async (
  title: string,
  body: string,
  options?: {
    type?: 'ai_complete' | 'tip' | 'system' | 'custom';
    url?: string;
    vibrate?: boolean;
    sound?: boolean;
    tag?: string;
  }
): Promise<{ success: boolean; deliveredToOS: boolean }> => {
  const settings = getNotificationSettings();
  const shouldSound = options?.sound ?? settings.sound;
  const shouldVibrate = options?.vibrate ?? settings.vibrate;

  // Sound chime
  if (shouldSound) {
    playNotificationChime();
  }

  // Mobile vibration
  if (shouldVibrate) {
    triggerPhoneVibration([200, 100, 200, 100, 250]);
  }

  // Save to internal notification history
  const newNotif: AppNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    body,
    timestamp: Date.now(),
    read: false,
    type: options?.type || 'system',
    url: options?.url || '/'
  };

  try {
    const currentList = getStoredNotifications();
    const updatedList = [newNotif, ...currentList.slice(0, 49)];
    saveNotifications(updatedList);
    // Dispatch custom event for real-time reactivity
    window.dispatchEvent(new CustomEvent('app_notification_received', { detail: newNotif }));
  } catch (e) {}

  let deliveredToOS = false;

  // Check if browser/phone Notification API is granted
  if (isNotificationSupported() && Notification.permission === 'granted') {
    const notifOptions: NotificationOptions = {
      body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: options?.tag || `globalpixel-${Date.now()}`,
      data: { url: options?.url || '/' }
    };

    // 1. First try ServiceWorker registration (Best for mobile Android / PWA)
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg && 'showNotification' in reg) {
          await reg.showNotification(title, {
            ...notifOptions,
            vibrate: [200, 100, 200, 100, 300]
          } as any);
          deliveredToOS = true;
        }
      } catch (swErr) {
        // Fallback to desktop/browser notification
      }
    }

    // 2. Fallback to standard Notification if SW wasn't able to show
    if (!deliveredToOS) {
      try {
        const notif = new Notification(title, notifOptions);
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
        deliveredToOS = true;
      } catch (err) {
        console.warn('Native notification failed:', err);
      }
    }
  }

  return { success: true, deliveredToOS };
};

// Dispatch when AI finishes processing a creation
export const notifyAICompletion = async (itemName: string, previewText?: string) => {
  const settings = getNotificationSettings();
  if (!settings.autoAINotif) return;

  const title = `🎉 AI Selesai: ${itemName.slice(0, 40)}`;
  const body = previewText 
    ? `${previewText.slice(0, 95)}... (Ketuk untuk melihat hasil lengkap di aplikasi)` 
    : 'Ciptaan AI baru Anda telah selesai dibuat dan siap dijalankan di Live Sandbox!';

  return sendDeviceNotification(title, body, {
    type: 'ai_complete',
    tag: 'ai-task-complete'
  });
};

// Dispatch test notification
export const sendTestMobileNotification = async () => {
  return sendDeviceNotification(
    '🔔 Notifikasi Handphone Terhubung!',
    'VEXION AI berhasil mengirimkan notifikasi ke perangkat Anda! Fitur ini aktif penuh untuk SEMUA pengguna (Free & Premium).',
    {
      type: 'system',
      tag: 'test-mobile-push'
    }
  );
};
