import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  Smartphone, 
  Volume2, 
  Vibrate, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Sparkles, 
  Trash2, 
  ShieldCheck, 
  RefreshCw,
  ExternalLink,
  Crown,
  Check
} from 'lucide-react';
import { 
  AppNotification, 
  getStoredNotifications, 
  saveNotifications, 
  getNotificationPermission, 
  requestDeviceNotificationPermission, 
  sendDeviceNotification,
  sendTestMobileNotification,
  triggerPhoneVibration,
  playNotificationChime,
  getNotificationSettings,
  saveNotificationSettings,
  NotificationSettings,
  isNotificationSupported
} from '../utils/notificationService';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'id' | 'en';
  isFree?: boolean;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  language,
  isFree = false
}) => {
  const isId = language !== 'en';
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings());
  
  // Custom sender form state
  const [customTitle, setCustomTitle] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [customType, setCustomType] = useState<'system' | 'ai_complete' | 'tip' | 'custom'>('custom');
  const [isSending, setIsSending] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Sync state on open
  useEffect(() => {
    if (isOpen) {
      setNotifications(getStoredNotifications());
      setPermission(getNotificationPermission());
      setSettings(getNotificationSettings());
      setFeedbackMsg(null);
    }
  }, [isOpen]);

  // Listen to new notifications while modal is open
  useEffect(() => {
    const handleNewNotif = () => {
      setNotifications(getStoredNotifications());
    };
    window.addEventListener('app_notification_received', handleNewNotif);
    return () => window.removeEventListener('app_notification_received', handleNewNotif);
  }, []);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const result = await requestDeviceNotificationPermission();
    setPermission(result);
    if (result === 'granted') {
      setFeedbackMsg({
        text: 'Izin notifikasi handphone berhasil diaktifkan! Mengirim notifikasi selamat datang...',
        type: 'success'
      });
      await sendTestMobileNotification();
      setNotifications(getStoredNotifications());
    } else if (result === 'denied') {
      setFeedbackMsg({
        text: 'Izin ditolak oleh peramban. Harap aktifkan izin notifikasi di setelan browser atau HP Anda.',
        type: 'error'
      });
    }
  };

  const handleSendTest = async () => {
    setIsSending(true);
    try {
      const res = await sendTestMobileNotification();
      setNotifications(getStoredNotifications());
      setFeedbackMsg({
        text: res.deliveredToOS 
          ? 'Notifikasi uji coba berhasil dikirim langsung ke layar handphone Anda!' 
          : 'Notifikasi tersimpan di aplikasi. Aktifkan izin peramban di atas agar muncul di tirai notifikasi HP Anda.',
        type: 'success'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customBody.trim()) return;

    setIsSending(true);
    try {
      const res = await sendDeviceNotification(customTitle.trim(), customBody.trim(), {
        type: customType,
        tag: `custom-${Date.now()}`
      });
      setNotifications(getStoredNotifications());
      setCustomTitle('');
      setCustomBody('');
      setFeedbackMsg({
        text: res.deliveredToOS 
          ? 'Notifikasi kustom Anda telah dikirim ke handphone!' 
          : 'Notifikasi kustom tersimpan dan bunyi/getar telah dipicu!',
        type: 'success'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleTestVibrate = () => {
    const success = triggerPhoneVibration([300, 150, 300, 150, 400]);
    setFeedbackMsg({
      text: success ? 'Getaran ponsel dipicu! (Pastikan HP tidak dalam mode hening total).' : 'Fitur getar tidak didukung pada peramban/perangkat ini.',
      type: 'info'
    });
  };

  const handleTestSound = () => {
    playNotificationChime();
    setFeedbackMsg({
      text: 'Bunyi nada notifikasi chime diputar!',
      type: 'info'
    });
  };

  const handleToggleSetting = (key: keyof NotificationSettings) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    saveNotificationSettings(next);
  };

  const handleClearHistory = () => {
    saveNotifications([]);
    setNotifications([]);
    setFeedbackMsg({ text: 'Riwayat notifikasi telah dibersihkan.', type: 'info' });
  };

  const handleResend = async (notif: AppNotification) => {
    await sendDeviceNotification(notif.title, notif.body, {
      type: notif.type,
      tag: `resend-${Date.now()}`
    });
    setNotifications(getStoredNotifications());
    setFeedbackMsg({ text: `Notifikasi "${notif.title}" dikirim ulang ke HP!`, type: 'success' });
  };

  const isSupported = isNotificationSupported();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white shrink-0">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-slate-100">
                  {isId ? 'Pusat Notifikasi Handphone' : 'Mobile Notification Center'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/80 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Free & Premium
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isId 
                  ? 'Kirim & terima notifikasi otomatis ke ponsel (HP) Anda untuk semua pengguna' 
                  : 'Send & receive notifications to user mobile devices for both Free & Premium'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback message banner */}
        {feedbackMsg && (
          <div className={`px-4 py-2.5 text-xs flex items-center justify-between gap-2 border-b ${
            feedbackMsg.type === 'success' 
              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-900/60' 
              : feedbackMsg.type === 'error'
              ? 'bg-rose-950/70 text-rose-300 border-rose-900/60'
              : 'bg-cyan-950/70 text-cyan-300 border-cyan-900/60'
          }`}>
            <div className="flex items-center gap-2">
              {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{feedbackMsg.text}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-white text-xs underline">
              Tutup
            </button>
          </div>
        )}

        {/* Body content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-sm">
          
          {/* Universal Free & Premium Guarantee Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-indigo-950/50 border border-cyan-800/40 flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-cyan-200">
                  {isId ? 'Semua Pengguna Sama: Tanpa Kunci Paywall' : 'All Users Equal: Free & Premium Access'}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/60">
                  100% Aktif
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isId
                  ? 'Fitur notifikasi ini dapat mengirimkan pemberitahuan apapun ke handphone pengguna, baik akun Premium maupun Gratis sama saja tanpa perbedaan. Anda akan menerima getar, suara nada, dan notifikasi sistem saat AI selesai memproses karya Anda.'
                  : 'This notification engine delivers alerts to mobile devices equally for both Free and Premium users, including haptic vibration, audio chimes, and system notifications.'}
              </p>
            </div>
          </div>

          {/* Device Permission Status Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">Status Izin Handphone:</span>
                <div className="flex items-center gap-2">
                  {permission === 'granted' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      {isId ? 'Izin HP Aktif (Diizinkan)' : 'Device Permission Granted'}
                    </span>
                  ) : permission === 'denied' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      {isId ? 'Izin Ditolak Browser' : 'Permission Blocked'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      {isId ? 'Menunggu Izin Pengguna' : 'Permission Not Granted Yet'}
                    </span>
                  )}
                  {!isSupported && (
                    <span className="text-[11px] text-rose-400 font-mono">
                      (Browser tidak mendukung Web Notification API)
                    </span>
                  )}
                </div>
              </div>

              {permission !== 'granted' && (
                <button
                  onClick={handleRequestPermission}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  <span>{isId ? 'Aktifkan Izin Notifikasi di HP' : 'Enable Mobile Permission'}</span>
                </button>
              )}
            </div>

            {/* Quick Testing Bar */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Uji Cepat Perangkat:</span>
              <button
                onClick={handleSendTest}
                disabled={isSending}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-cyan-300 font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-cyan-400" />
                <span>Kirim Notif Tes ke HP</span>
              </button>
              <button
                onClick={handleTestVibrate}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-amber-300 font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Vibrate className="w-3.5 h-3.5 text-amber-400" />
                <span>Uji Getar HP</span>
              </button>
              <button
                onClick={handleTestSound}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-purple-300 font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Uji Nada Suara</span>
              </button>
            </div>
          </div>

          {/* Form: Kirim Notifikasi Apapun ke Handphone */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" />
                {isId ? 'Kirim Notifikasi Apapun ke Handphone Pengguna' : 'Send Any Custom Notification to Device'}
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">Bisa Berupa Pesan / Pengingat / AI</span>
            </div>

            <form onSubmit={handleSendCustom} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400 mb-1 block">
                    Judul Notifikasi
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Misal: Halo dari AI, Pengingat Proyek, atau Update Baru"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 mb-1 block">
                    Kategori Notifikasi
                  </label>
                  <select
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="custom">Pesan Kustom</option>
                    <option value="ai_complete">Karya AI Selesai</option>
                    <option value="system">Pengumuman Sistem</option>
                    <option value="tip">Tips / Inspirasi AI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 mb-1 block">
                  Isi Pesan Notifikasi (akan tampil di layar / layar kunci HP)
                </label>
                <textarea
                  rows={2}
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  placeholder="Ketik teks pesan apapun yang ingin dikirimkan langsung ke handphone Anda..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Vibrate className="w-3.5 h-3.5 text-cyan-400" />
                  Otomatis membunyikan nada & menggetarkan ponsel
                </span>
                <button
                  type="submit"
                  disabled={!customTitle.trim() || !customBody.trim() || isSending}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim ke HP Sekarang</span>
                </button>
              </div>
            </form>
          </div>

          {/* Preferences Settings Toggles */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              {isId ? 'Pengaturan Otomatis Notifikasi' : 'Automatic Notification Settings'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-800/80 transition-colors">
                <span className="text-slate-300 font-medium">Notifikasi Otomatis saat AI Selesai</span>
                <input
                  type="checkbox"
                  checked={settings.autoAINotif}
                  onChange={() => handleToggleSetting('autoAINotif')}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-800/80 transition-colors">
                <span className="text-slate-300 font-medium">Bunyi Nada Suara (Chime)</span>
                <input
                  type="checkbox"
                  checked={settings.sound}
                  onChange={() => handleToggleSetting('sound')}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-800/80 transition-colors">
                <span className="text-slate-300 font-medium">Getar di Handphone (Vibrate)</span>
                <input
                  type="checkbox"
                  checked={settings.vibrate}
                  onChange={() => handleToggleSetting('vibrate')}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:bg-slate-800/80 transition-colors">
                <span className="text-slate-300 font-medium">Inspirasi & Tips AI Harian</span>
                <input
                  type="checkbox"
                  checked={settings.dailyTips}
                  onChange={() => handleToggleSetting('dailyTips')}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
              </label>
            </div>
          </div>

          {/* History of Sent Notifications */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                {isId ? 'Riwayat Notifikasi Masuk' : 'Notification History'}
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {notifications.length}
                </span>
              </h4>
              {notifications.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bersihkan</span>
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-slate-500 text-xs">
                Belum ada notifikasi yang tersimpan. Klik "Kirim Notif Tes ke HP" untuk mencoba!
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-200 truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed break-words">
                        {item.body}
                      </p>
                    </div>

                    <button
                      onClick={() => handleResend(item)}
                      title="Kirim ulang ke HP"
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 hover:text-cyan-300 transition-colors shrink-0 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>VEXION AI Notification Engine · Ayyub Kenda Pratama</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
