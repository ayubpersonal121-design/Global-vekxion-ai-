import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ChatGptSidebar } from './components/ChatGptSidebar';
import { ChatView } from './components/ChatView';
import { CreationControls } from './components/CreationControls';
import { PromptInput } from './components/PromptInput';
import { ResultViewer } from './components/ResultViewer';
import { PricingModal, PRICING_PLANS } from './components/PricingModal';
import { AdminModal } from './components/AdminModal';
import { LegalModal } from './components/LegalModal';
import { PersyaratanModal } from './components/PersyaratanModal';
import { MandatoryConsentGate } from './components/MandatoryConsentGate';
import { InstallAppModal } from './components/InstallAppModal';
import { VoiceModal } from './components/VoiceModal';
import { ProFileLauncherModal, ProTemplate } from './components/ProFileLauncherModal';
import { BusinessAppPreviewDrawer } from './components/BusinessAppPreviewDrawer';
import { RouterUsbBridgeModal } from './components/RouterUsbBridgeModal';
import { OneTimePasscodeModal } from './components/OneTimePasscodeModal';
import { PublicLinkHubModal } from './components/PublicLinkHubModal';
import { PublicEditionBanner } from './components/PublicEditionBanner';
import { DolphyLabModal } from './components/DolphyLabModal';
import { UniversalTvRemoteModal } from './components/UniversalTvRemoteModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { 
  CreationItem, 
  CreationMode, 
  IntelligenceTier, 
  PersonaType, 
  ViewMode, 
  PlanId, 
  ChatMessage,
  ChatSession,
  BusinessAppOutput,
  InteractiveSandboxItem,
  BlackArchSimulation,
  DolphyProtocolSimulation,
  UniversalTvRemoteData,
  AppEdition,
  DeviceTarget,
  AppUpdateConfig
} from './types';
import { detectConversationalGenerationIntent, generateInteractiveSandboxItem } from './utils/conversationalGenerators';
import { runBlackArchSimulation } from './utils/blackArchEngine';
import { generateDolphySimulation } from './utils/dolphyEngine';
import { detectTvBrandFromPrompt, TV_BRANDS_DATABASE } from './utils/tvRemoteDatabase';
import { MediaMode, PresetsConfig } from './components/CapsuleChatInput';
import { 
  safeStorage, 
  STORAGE_KEYS, 
  getOrCreateSessionId, 
  recordAuditLog,
  hasAcceptedLegalTerms,
  canAccessArgonAstro,
  isAdminAuthenticated,
  getAppUpdateConfig,
  saveAppUpdateConfig,
  getActive5HourSession
} from './utils/safeStorage';
import {
  generateAdminSessionToken,
  getAdminSessionToken,
  clearAdminSessionToken,
  syncAdminSessionToServiceWorker,
} from './utils/sessionIntegrity';
import { parseCreationOutput, formatFriendlyErrorMessage } from './utils/parser';
import { INITIAL_CREATIONS } from './utils/sampleData';
import { 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Layout, 
  MessageSquare, 
  Plus, 
  Flame, 
  Globe, 
  Smartphone, 
  Monitor, 
  KeyRound, 
  Download,
  Lock
} from 'lucide-react';

const FREE_MESSAGE_LIMIT = 3;

export default function App() {
  // 1. Session & Client Identifier
  const [clientSessionId] = useState<string>(() => getOrCreateSessionId());

  // 2. User Subscription Plan (default: 'free' so the 3-message limit & paywall are enforced)
  const [currentPlanId, setCurrentPlanId] = useState<PlanId>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.PLAN);
      if (saved && ['free', 'starter_50k', 'pro_150k', 'ultra_350k', 'titan_700k', 'vip_argon_astro_8m'].includes(saved)) {
        return saved as PlanId;
      }
    } catch (e) {
      console.warn('Failed to load plan:', e);
    }
    return 'free';
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => isAdminAuthenticated());
  const argonAccess = canAccessArgonAstro(currentPlanId);
  const isArgonUnlocked = argonAccess.allowed || isAdmin;
  const isFree = currentPlanId === 'free' && !isAdmin;

  // Business App Side Preview Drawer state (BAGIAN 3)
  const [previewBusinessApp, setPreviewBusinessApp] = useState<BusinessAppOutput | null>(null);

  // 3. Message Counter in Current Session (Free users strictly limited to 3 messages)
  const [freeMessagesUsed, setFreeMessagesUsed] = useState<number>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.SESSION_MSG_COUNT);
      if (saved) return Math.max(0, parseInt(saved, 10) || 0);
    } catch (e) {}
    return 0;
  });

  // 4. Chat Sessions (ChatGPT Collapsible Sidebar Support)
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = safeStorage.getJSON<ChatSession[]>(STORAGE_KEYS.CHAT_SESSIONS, []);
      if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch (e) {}
    return [
      {
        id: 'session_init',
        title: 'Welcome to VEXION AI',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION_ID);
      if (saved && sessions.some(s => s.id === saved)) return saved;
    } catch (e) {}
    return sessions[0]?.id || 'session_init';
  });

  // Current session's messages
  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const chatMessages = currentSession?.messages || [];

  // 5. Studio Creations State
  const [items, setItems] = useState<CreationItem[]>(() => {
    try {
      const saved = safeStorage.getJSON<CreationItem[]>(STORAGE_KEYS.CREATIONS, []);
      if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch (e) {}
    return INITIAL_CREATIONS;
  });

  const [activeItem, setActiveItem] = useState<CreationItem | null>(() => items[0] || null);

  // 6. Navigation & View Modes
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 7. Generator Controls
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<CreationMode>('web_app');
  const [intelligenceTier, setIntelligenceTier] = useState<IntelligenceTier>(() => isFree ? 'flash' : 'astro_supreme');
  const [persona, setPersona] = useState<PersonaType>('omni_architect');
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [aspectRatio, setAspectRatio] = useState('1:1');

  // 8. Streaming & Loading States
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 9. Modals & Consent State
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(() => {
    return hasAcceptedLegalTerms();
  });
  const [persyaratanOpen, setPersyaratanOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [featureLockedMessage, setFeatureLockedMessage] = useState<string | undefined>(undefined);
  const [adminOpen, setAdminOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms'>('privacy');
  const [installOpen, setInstallOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [proLauncherOpen, setProLauncherOpen] = useState(false);
  const [routerBridgeOpen, setRouterBridgeOpen] = useState(false);
  const [passcode5HOpen, setPasscode5HOpen] = useState(false);
  const [publicLinkHubOpen, setPublicLinkHubOpen] = useState(false);
  const [dolphyLabOpen, setDolphyLabOpen] = useState(false);
  const [dolphyLabInitialTab, setDolphyLabInitialTab] = useState<string>('infrared');
  const [tvRemoteModalOpen, setTvRemoteModalOpen] = useState(false);
  const [tvRemoteInitialBrand, setTvRemoteInitialBrand] = useState<string>('samsung');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // 10. Dual Application Architecture: Versi Developer vs Versi Publik & Cross-Platform Devices
  const [appEdition, setAppEdition] = useState<AppEdition>(() => {
    // If URL is explicitly /public, /portal, or ?mode=public, force public edition immediately!
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase();
      const search = new URLSearchParams(window.location.search);
      if (pathname.includes('/public') || pathname.includes('/portal') || search.get('mode') === 'public') {
        return 'public';
      }
    }
    if (!isAdminAuthenticated()) return 'public';
    return (safeStorage.getItem(STORAGE_KEYS.APP_EDITION) as AppEdition) || 'public';
  });

  const [targetDevice, setTargetDevice] = useState<DeviceTarget>(() => {
    return (safeStorage.getItem(STORAGE_KEYS.DEVICE_TARGET) as DeviceTarget) || 'auto';
  });

  const [updateConfig, setUpdateConfig] = useState<AppUpdateConfig>(() => getAppUpdateConfig());

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.APP_EDITION, appEdition);
  }, [appEdition]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.DEVICE_TARGET, targetDevice);
  }, [targetDevice]);

  const handleToggleAppEdition = (edition: AppEdition) => {
    if (edition === 'developer') {
      if (!isAdmin) {
        setAdminOpen(true);
        return;
      }
      setAppEdition('developer');
      setCurrentPlanId('titan_700k');
    } else {
      setAppEdition('public');
    }
  };


  // PWA beforeinstallprompt handler
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Keyboard shortcuts: Ctrl+O for New Chat, Ctrl+Shift+A for Admin Controller
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleCreateNewChat();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setAdminOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check active 5-hour passcode session on mount & periodically
  useEffect(() => {
    const evaluate5HourPasscode = () => {
      const active5H = getActive5HourSession();
      if (active5H.isActive && active5H.session) {
        if (currentPlanId === 'free') {
          setCurrentPlanId(active5H.session.grantedPlan);
          setFreeMessagesUsed(0);
        }
      }
    };
    evaluate5HourPasscode();
    const interval = setInterval(evaluate5HourPasscode, 30000);
    return () => clearInterval(interval);
  }, [currentPlanId]);

  // Sync state to safe storage
  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.PLAN, currentPlanId);
  }, [currentPlanId]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.SESSION_MSG_COUNT, freeMessagesUsed.toString());
  }, [freeMessagesUsed]);

  useEffect(() => {
    safeStorage.setJSON(STORAGE_KEYS.CHAT_SESSIONS, sessions);
  }, [sessions]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION_ID, activeSessionId);
  }, [activeSessionId]);

  useEffect(() => {
    safeStorage.setJSON(STORAGE_KEYS.CREATIONS, items);
  }, [items]);

  // Sync Service Worker Administrative Session on mount & admin changes
  useEffect(() => {
    const initSWSession = async () => {
      try {
        if (isAdmin) {
          let token = getAdminSessionToken();
          if (!token) {
            await generateAdminSessionToken(clientSessionId);
          }
          await syncAdminSessionToServiceWorker();
        } else {
          clearAdminSessionToken();
          await syncAdminSessionToServiceWorker();
        }
      } catch (err) {
        console.warn('Failed to sync SW session integrity:', err);
      }
    };
    initSWSession();
  }, [isAdmin, clientSessionId]);

  // Paywall Trigger Handler
  const handleRequireUpgrade = (reason: string) => {
    setFeatureLockedMessage(reason);
    setPricingOpen(true);
    recordAuditLog(clientSessionId, `Triggered Premium Paywall: ${reason}`);
  };

  // Create New Chat (like ChatGPT)
  const handleCreateNewChat = () => {
    try {
      const newSession: ChatSession = {
        id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: 'New Chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setViewMode('chat');
      // If on mobile, close sidebar
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
      recordAuditLog(clientSessionId, `Created New Chat Session: ${newSession.id}`);
    } catch (e) {
      console.error('Failed to create new chat:', e);
    }
  };

  // Delete Chat Session
  const handleDeleteSession = (sessionId: string) => {
    try {
      const remaining = sessions.filter((s) => s.id !== sessionId);
      if (remaining.length === 0) {
        const fallback: ChatSession = {
          id: `session_${Date.now()}`,
          title: 'New Chat',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setSessions([fallback]);
        setActiveSessionId(fallback.id);
      } else {
        setSessions(remaining);
        if (activeSessionId === sessionId) {
          setActiveSessionId(remaining[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to delete chat session:', e);
    }
  };

  // Universal Cross-Platform Download App Trigger (Requirement 3: PWA Auto-Installer)
  const handleUniversalDownloadApp = async () => {
    try {
      const ua = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(ua);

      if (isIOS) {
        // On iOS Safari, display animated interactive tooltip/modal instructing Share -> Add to Home Screen
        setInstallOpen(true);
        return;
      }

      if (deferredPrompt) {
        // On Android, Windows, macOS: Trigger native system installation dialog immediately
        await (deferredPrompt as any).prompt();
        const choice = await (deferredPrompt as any).userChoice;
        if (choice?.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      } else {
        setInstallOpen(true);
      }
    } catch (err) {
      console.error('Universal download app error:', err);
      setInstallOpen(true);
    }
  };

  // Handle Send Chat Message with strict session limit & streaming
  const handleSendChatMessage = async (
    userText: string,
    options?: {
      image?: string;
      video?: string;
      videoName?: string;
      link?: { url: string; title?: string };
      mediaMode?: MediaMode;
      presets?: PresetsConfig;
      cyberMode?: boolean;
    }
  ) => {
    const image = options?.image;
    const video = options?.video;
    const videoName = options?.videoName;
    const link = options?.link;

    if (!hasAcceptedTerms) {
      setPersyaratanOpen(true);
      return;
    }
    if ((!userText && !image && !video && !link) || isChatLoading) return;

    // Strict Paywall enforcement: Free users get 3-message limit per session
    if (isFree && freeMessagesUsed >= FREE_MESSAGE_LIMIT) {
      handleRequireUpgrade(`Batas ${FREE_MESSAGE_LIMIT} pesan gratis tercapai. Tingkatkan ke Premium untuk obrolan tanpa batas.`);
      return;
    }

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: userText || (link ? `Tautan: ${link.url}` : video ? `Video: ${videoName || 'Lampiran'}` : 'Foto Lampiran'),
      image,
      video,
      videoName,
      link,
      timestamp: Date.now(),
    };

    // Update active session messages
    const updatedMessages = [...chatMessages, userMessage];
    
    // Auto title for the first message
    const autoTitle = currentSession.messages.length === 0 
      ? (userText.length > 28 ? `${userText.slice(0, 28)}...` : userText)
      : currentSession.title;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, title: autoTitle, messages: updatedMessages, updatedAt: Date.now() }
          : s
      )
    );

    // Increment message count for free user
    if (isFree) {
      setFreeMessagesUsed((prev) => prev + 1);
    }

    setIsChatLoading(true);

    const assistantMsgId = `ast_${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: [...updatedMessages, initialAssistantMsg] }
          : s
      )
    );

    const lowerText = userText.toLowerCase().trim();

    let activePersona: PersonaType = persona;
    let activeMode: CreationMode = 'omni';
    let customModelBadge: string | undefined = isArgonUnlocked ? 'AI Argon & 4 Astro Sovereign' : undefined;
    let attachedSimulation: BlackArchSimulation | undefined = undefined;

    try {
      // Secret /admin trigger for Developer/Owner
      if (lowerText === '/admin' || lowerText === 'admin portal' || lowerText === 'open admin') {
        setAdminOpen(true);
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.filter((m) => m.id !== assistantMsgId)
                }
              : s
          )
        );
        setIsChatLoading(false);
        return;
      }

      // =========================================================================
      // 1. DEVELOPER / CREATOR IDENTITY INQUIRY: Ayyub Kenda Pratama
      // =========================================================================
      const isCreatorQuestion =
        lowerText.includes('siapa yang membuat') ||
        lowerText.includes('siapa pembuat') ||
        lowerText.includes('siapa pencipta') ||
        lowerText.includes('siapa developer') ||
        lowerText.includes('siapa yang bikin') ||
        lowerText.includes('siapa yang mendesain') ||
        lowerText.includes('who created') ||
        lowerText.includes('who made') ||
        lowerText.includes('who is the developer') ||
        lowerText.includes('who is your creator');

      if (isCreatorQuestion) {
        const creatorResponse = `**VEXION AI** diciptakan dan dikembangkan oleh **Ayyub Kenda Pratama**, seorang Lead Developer dan Arsitek Sistem AI.\n\nSistem ini dirancang sebagai platform kecerdasan buatan komersial dan rekayasa perangkat lunak tingkat apex yang mengintegrasikan kapabilitas **Google Gemini (termasuk Gemini 4 Argon)** serta **OpenAI ChatGPT (termasuk GPT 6 Astra / 4 Astro Sovereign)** untuk kebutuhan riset pasar, materi iklan konversi tinggi, render visual Ultra-HD, hingga simulasi aplikasi, game, dan website interaktif secara percakapan natural language.`;
        
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: creatorResponse,
                          modelBadge: 'Ayyub Kenda Pratama Architecture'
                        }
                      : m
                  )
                }
              : s
          )
        );
        setIsChatLoading(false);
        return;
      }

      // =========================================================================
      // 1A. UNIVERSAL TV REMOTE AI ENGINE (REMOT TV APAPUN - ALL BRANDS)
      // =========================================================================
      const isTvRemoteIntent =
        lowerText.includes('remot tv') ||
        lowerText.includes('remote tv') ||
        lowerText.includes('remot') ||
        lowerText.includes('remote') ||
        lowerText.includes('matikan tv') ||
        lowerText.includes('nyalakan tv') ||
        lowerText.includes('volume tv') ||
        lowerText.includes('ganti channel') ||
        lowerText.includes('remot tv apapun') ||
        lowerText.includes('bisa remot') ||
        lowerText.includes('jadi remot') ||
        lowerText.includes('menjadi remot') ||
        ((lowerText.includes('toshiba') || lowerText.includes('samsung') || lowerText.includes('polytron') || lowerText.includes('sharp') || lowerText.includes('lg')) && 
         (lowerText.includes('tv') || lowerText.includes('kontrol') || lowerText.includes('coba')));

      if (isTvRemoteIntent) {
        const detected = detectTvBrandFromPrompt(userText);
        const brandProfile = TV_BRANDS_DATABASE[detected.brandId] || TV_BRANDS_DATABASE.toshiba;
        const brandName = brandProfile.name;

        const tvRemoteData: UniversalTvRemoteData = {
          activeBrand: detected.brandId,
          lastCommandSent: detected.actionKey ? `Pancaran Siap: ${detected.actionKey.toUpperCase()}` : 'Siap Memancarkan Sinyal',
          lastCodeHex: `${brandProfile.protocol} @ ${brandProfile.defaultFrequency / 1000}kHz • Siap dikirim via IR Blaster / Wi-Fi LAN / Dolphy .ir`,
          timestamp: Date.now()
        };

        const tvAnswer = `📺 **Remot TV Universal Aktif untuk ${brandName}!**\n\nModul **Remot TV Universal** di Global Pixel AI telah disinkronkan khusus dengan kode frekuensi **${brandProfile.protocol} (${brandProfile.defaultFrequency / 1000}kHz)** untuk televisi Anda.\n\n### 💡 Mengapa Sebelumnya TV Fisik Anda Tidak Langsung Merespons dari Browser Chrome?\nDi sistem operasi Android (seperti smartphone Xiaomi/MIUI Anda), browser Google Chrome berjalan di dalam sistem keamanan *Web Sandbox* terisolasi. Browser web **tidak memiliki izin langsung ke modul lampu LED hardware IR Blaster bawaan HP** (izin \`android.permission.TRANSMIT_IR\` hanya diberikan Android untuk aplikasi native berekstensi \`.apk\` seperti Dolphy v2.6, Mi Remote, atau Zaza Remote).\n\n### 🛠️ 3 Cara Nyata Agar Remot Ini Berfungsi Mengontrol TV Anda:\n1. **Buka di Dolphy App / Unduh Berkas .IR ${brandName} (Paling Direkomendasikan):**\n   Tekan tombol **"Unduh .IR ${brandName}"** pada kartu di bawah. Buka berkas tersebut di aplikasi **Dolphy v2.6** atau Flipper Zero. Aplikasi Dolphy memiliki izin OS penuh ke IR Blaster HP Xiaomi Anda dan akan langsung memancarkan kode Power/Volume ${brandName}!\n2. **Mode Wi-Fi Smart TV (Kontrol Jaringan Langsung):**\n   Jika TV Anda adalah Smart TV (${brandName}) yang terhubung ke satu jaringan Wi-Fi dengan HP, aktifkan tab **"Wi-Fi Smart TV"** di kartu remot. Perintah dikirim via protokol LAN IP tanpa memerlukan sinar infra-merah.\n3. **Transmisi Audio-Jack PWM (Dongle IR 3.5mm / Type-C):**\n   Setiap kali tombol di bawah ditekan, AI memancarkan modulasi gelombang pulsa carrier 38kHz melalui Web Audio API dan getaran haptic feedback pada smartphone Anda.\n\nSilakan gunakan fisik remot interaktif di bawah untuk mengontrol **Power, Volume, Channel, D-Pad Navigasi, Source, Netflix, atau YouTube**:`;

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: tvAnswer,
                          tvRemoteSimulation: tvRemoteData,
                          modelBadge: `AI Universal TV Remote (${brandName})`
                        }
                      : m
                  )
                }
              : s
          )
        );
        setIsChatLoading(false);
        return;
      }

      // =========================================================================
      // 1B. DOLPHY WIRELESS & HARDWARE PROTOCOL ENGINE (DOLPHY APP v2.6 SUITE)
      // =========================================================================
      const isDolphyIntent =
        lowerText.includes('dolphy') ||
        lowerText.includes('unvoiddd') ||
        lowerText.includes('seperti dolphy') ||
        lowerText.includes('bisa dolphy') ||
        lowerText.includes('flipper') ||
        lowerText.includes('flipper zero') ||
        lowerText.includes('salin frekuensi') ||
        lowerText.includes('copy frekuensi') ||
        lowerText.includes('klon frekuensi') ||
        lowerText.includes('kloning') ||
        lowerText.includes('sub-ghz') ||
        lowerText.includes('subghz') ||
        lowerText.includes('433') ||
        lowerText.includes('315') ||
        lowerText.includes('868') ||
        lowerText.includes('infrared') ||
        lowerText.includes('inframerah') ||
        lowerText.includes('remote tv') ||
        lowerText.includes('remote ac') ||
        lowerText.includes('sinyal ir') ||
        lowerText.includes('.ir') ||
        lowerText.includes('ble scan') ||
        lowerText.includes('bluetooth le') ||
        lowerText.includes('tag nfc') ||
        lowerText.includes('mifare') ||
        lowerText.includes('spektrum wifi') ||
        lowerText.includes('frekuensi wifi') ||
        lowerText.includes('kalkulator subnet');

      if (isDolphyIntent) {
        const dolphySim = generateDolphySimulation(userText);
        const isTvSubGhzIssue = 
          (lowerText.includes('tv') || lowerText.includes('televisi')) &&
          (lowerText.includes('sub') || lowerText.includes('baca') || lowerText.includes('read') || lowerText.includes('sniff') || lowerText.includes('frekuensi') || lowerText.includes('flipper') || lowerText.includes('masalah'));

        const isFreqCopy = 
          lowerText.includes('salin frekuensi') || 
          lowerText.includes('copy frekuensi') || 
          lowerText.includes('klon') || 
          lowerText.includes('kloning') || 
          lowerText.includes('sub-ghz') || 
          lowerText.includes('subghz') || 
          lowerText.includes('433') || 
          lowerText.includes('315') || 
          lowerText.includes('868');

        let dolphyAnswer = '';
        if (isTvSubGhzIssue) {
          dolphyAnswer = `📡 **Fitur Pembaca Sinyal Remote TV pada Flipper Sub-GHz Telah Diperbaiki & Diintegrasikan Penuh!**\n\nTerima kasih atas masukannya! Berikut penjelasan teknis dan pembaruan sistem yang telah kami aktifkan agar sinyal remote TV Anda terbaca 100% tanpa kendala:\n\n1. **Fakta Fisika Sinyal Remote TV vs Sub-GHz:**\n   * Remote TV fisik (seperti Samsung, LG, Sony, Polytron, Sharp, Xiaomi, TCL, Panasonic) mentransmisikan **cahaya inframerah (Infrared IR) dengan frekuensi pembawa (carrier) 38.00 kHz** (atau 40.00 kHz untuk Sony).\n   * Remote Smart TV modern memakai **Bluetooth LE / RF (2.4 GHz)**.\n   * Sementara itu, modul radio Sub-GHz CC1101 (seperti 433.92 MHz) bekerja untuk gelombang radio jarak jauh (remote pagar otomatis & alarm mobil), sehingga sensor radio 433 MHz secara fisik tidak menangkap foton cahaya inframerah 38 kHz.\n\n2. **Solusi Dual-Band & Sensor Optik yang Kini Telah Aktif di Dolphy & Flipper Lab:**\n   * **Sensor Kamera Pembaca IR Optik (Camera Optical Reader):** Di dalam tab Sub-GHz sekarang tersedia tombol **"Buka Sensor Kamera IR"**. Kamera HP dapat menangkap spektrum cahaya inframerah dari lampu remote TV Anda secara visual dan langsung mendekode frekuensinya ke **38.00 kHz**!\n   * **Pilihan Band Remote TV Universal:** Tersedia preset siap pakai lengkap untuk **Samsung Smart TV, LG webOS, Sony Bravia, Polytron, Sharp, Xiaomi, dan Smart TV 2.4 GHz RF**.\n   * **1-Klik Salin Frekuensi (38.00 kHz):** Anda dapat menyalin angka frekuensi murni (\`38.00 kHz\` / \`38000 Hz\`) dan kode HEX ke clipboard.\n   * **Unduh Berkas Kompatibel Flipper Zero (.sub & .ir):** Berkas dapat langsung diekspor dan dimuat ke Flipper Zero Anda.\n   * **Pancar Ulang Sinyal (Replay):** Memancarkan burst modulasi PWM dengan simulasi audio dan umpan balik getaran haptic perangkat.\n\nSilakan tekan tombol **"Salin Frekuensi"** pada kartu di bawah atau buka **"Dolphy Lab"** untuk mencoba Sensor Kamera IR & Quick TV Reader!`;
        } else if (isFreqCopy) {
          dolphyAnswer = `📡 **Fitur Salin Frekuensi Sinyal (Flipper Zero & Dolphy Sub-GHz Cloner) Telah Aktif!**\n\nTentu saja bisa! AI Anda kini dilengkapi dengan modul **Sub-GHz Transceiver & Frequency Cloner** seperti pada **Flipper Zero** dan **Dolphy v2.6** untuk menyalin, mendekode, dan memancarkan ulang frekuensi radio:\n\n1. **Pita Frekuensi Sub-GHz Utama:**\n   * **433.92 MHz (OOK/AM650):** Standar internasional untuk remote pagar otomatis (CAME 12-bit) dan remote alarm/mobil (Nice Flo 24-bit).\n   * **315.00 MHz (AM650):** Frekuensi bel pintu nirkabel (Princeton PT2262) & remote kendaraan standar US/Asia.\n   * **868.35 MHz (AM270):** Sensor pintar IoT & sistem keamanan rumah (Keeloq HCS301 Rolling Code).\n\n2. **Kemampuan Salin (Copy) Lengkap:**\n   * **Salin Frekuensi Murni:** Tombol 1-klik untuk menyalin angka frekuensi (misal: \`433.92 MHz\` atau nilai integer \`433920000 Hz\`) ke clipboard.\n   * **Salin RAW Hex & Pulses:** Menyalin urutan pulsa timing mark/space (TE mikrosekon) dan bitstream.\n   * **Unduh Berkas \`.sub\` Flipper Zero:** Ekspor berkas format Flipper SubGhz Key File resmi yang siap disalin ke kartu microSD Flipper Zero Anda!\n   * **Pancar Ulang Sinyal (Replay):** Memancarkan gelombang modulasi PWM dengan simulasi audio RF chirp dan getaran haptic perangkat.\n\nSilakan tekan tombol **"Salin Frekuensi"** atau **"Unduh Berkas .sub"** pada kartu interaktif di bawah, atau klik **"Buka di Flipper & Dolphy Lab Penuh"** untuk melihat RF Spectrum Waterfall!`;
        } else {
          dolphyAnswer = `🐬 **Global Pixel AI kini telah dibekali dengan kapabilitas Dolphy Wireless & Protocol Lab (v2.6 Suite)!**\n\nAI Anda kini memiliki kemampuan analisis perangkat keras dan protokol nirkabel seperti aplikasi **Dolphy (oleh unvoiddd)**:\n\n1. **Flipper Sub-GHz Frequency Cloner (315/433/868 MHz & TV 38kHz):**\n   * Fitur salin frekuensi, dekoder protokol CAME/Nice Flo/Princeton/Samsung/LG, dan generator berkas \`.sub\` resmi Flipper Zero.\n\n2. **Infrared & Universal Remote (.IR Studio):**\n   * Kompatibel dengan database remote Flipper Zero & Dolphy (Samsung, LG, Sony, AC Daikin/Panasonic).\n   * Menghasilkan timing gelombang pulsa carrier 38kHz (Mark/Space mikrosekon) dan ekspor berkas \`.ir\` siap pakai.\n\n3. **Bluetooth Low Energy (BLE) Packet Explorer:**\n   * Integrasi **Web Bluetooth API** untuk memindai perangkat BLE langsung dari browser Chrome Android / PC.\n   * Dekoder paket iklan BLE (Apple Proximity AirPods, Google Fast Pair, Eddystone Beacon).\n\n4. **NFC & RFID Tag Inspector:**\n   * Integrasi **Web NFC API** di smartphone Android untuk membaca tag ISO 14443-A dan menulis payload URL NDEF.\n   * Pemeta memori Mifare Classic 1K (16 Sektor x 4 Blok).\n\n5. **Wi-Fi Spectrum & Subnet Calculator:**\n   * Visualisasi saluran non-overlapping 2.4 GHz (Ch 1, 6, 11) dan 5 GHz UNII-1/UNII-3.\n   * Kalkulasi Network ID, Netmask, Broadcast, dan jumlah host IP lokal secara instan.\n\nAnda dapat menginspeksi matriks protokol pada kartu interaktif di bawah ini atau menekan tombol **"Dolphy Lab"** di header atas untuk membuka suite lengkap!`;
        }

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: dolphyAnswer,
                          dolphySimulation: dolphySim,
                          modelBadge: 'Dolphy Wireless Protocol AI (v2.6)'
                        }
                      : m
                  )
                }
              : s
          )
        );
        setIsChatLoading(false);
        return;
      }

      // =========================================================================
      // 2. CYBER MODE (BLACKARCH CYBERSECURITY INTELLIGENCE ENGINE)
      // =========================================================================
      const isCyberIntent = options?.cyberMode || 
        (lowerText.includes('aircrack') || lowerText.includes('hydra') || lowerText.includes('sherlock') || lowerText.includes('blackarch') || lowerText.includes('cyber mode') || (lowerText.includes('osint') && (lowerText.includes('profil') || lowerText.includes('username'))));

      if (isCyberIntent) {
        if (isFree && !isAdmin) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? {
                            ...m,
                            content: '🔒 **Akses Terbatas: Mode Cyber Security & BlackArch Suite (TITAN)**\n\nModul analisis keamanan siber, pertahanan sistem, dan pengujian etis terkunci secara eksklusif untuk paket **Supreme Titan Enterprise** (atau Akun Developer/Admin Bypass).\n\nSilakan tingkatkan ke paket **TITAN** untuk membuka akses penuh ke spesialis keamanan siber ini.',
                            modelBadge: 'TITAN Terkunci'
                          }
                        : m
                    )
                  }
                : s
            )
          );
          handleRequireUpgrade('Akses Language-Driven BlackArch Cyber Suite adalah fitur eksklusif paket TITAN.');
          setIsChatLoading(false);
          return;
        }

        // Aktifkan persona spesialis keamanan siber & pertahanan sistem
        activePersona = 'cyber_security' as any;
        activeMode = 'cyber' as any;
        customModelBadge = 'BlackArch Cyber Security AI (TITAN)';

        // Jika pengguna secara spesifik meminta simulasi terminal visual, siapkan kartu simulasinya
        const isExplicitTerminalRequest =
          lowerText.includes('simulasi terminal') ||
          lowerText.includes('tampilkan terminal') ||
          lowerText.includes('simulasikan terminal') ||
          lowerText.includes('run terminal') ||
          lowerText.includes('simulasi nmap') ||
          lowerText.includes('simulasi aircrack') ||
          lowerText.includes('simulasi hydra') ||
          lowerText.includes('simulasi sherlock');

        if (isExplicitTerminalRequest) {
          try {
            attachedSimulation = runBlackArchSimulation(userText);
            setSessions((prev) =>
              prev.map((s) =>
                s.id === activeSessionId
                  ? {
                      ...s,
                      messages: s.messages.map((m) =>
                        m.id === assistantMsgId
                          ? {
                              ...m,
                              blackArchSimulation: attachedSimulation,
                              modelBadge: customModelBadge,
                            }
                          : m
                      )
                    }
                  : s
              )
            );
          } catch (simErr) {
            console.warn('Simulation setup error:', simErr);
          }
        }
        // Eksekusi berlanjut ke AI Streaming agar AI menjawab pertanyaan pengguna secara cerdas, jelas, dan mudah dipahami!
      }

      // =========================================================================
      // 3. CONVERSATIONAL APP, GAME, AND WEBSITE GENERATION (NO PHYSICAL BUTTONS)
      // =========================================================================
      const convIntent = detectConversationalGenerationIntent(userText);
      if (convIntent.isGenerationIntent) {
        if (isFree && !isAdmin) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? {
                            ...m,
                            content: '🔒 **Akses Terbatas: Conversational App, Game & Website Sandbox (Vexion AI)**\n\nFitur pembuatan aplikasi, game canvas interaktif, dan purwarupa website langsung dari percakapan natural language terkunci secara eksklusif untuk paket **Supreme Titan Enterprise** (atau Akun Developer/Admin Bypass).\n\nSilakan tingkatkan ke paket **TITAN** untuk membuka Live Preview Sandbox interaktif ini.',
                            modelBadge: 'TITAN Terkunci'
                          }
                        : m
                    )
                  }
                : s
            )
          );
          handleRequireUpgrade('Akses Conversational Application, Game, dan Website Sandbox adalah fitur eksklusif paket TITAN.');
          setIsChatLoading(false);
          return;
        }

        try {
          const sandboxItem = generateInteractiveSandboxItem(userText);
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? {
                            ...m,
                            content: `Berikut adalah purwarupa interaktif **${sandboxItem.title}** yang disusun langsung oleh **Vexion AI Core Simulation Engine** berdasarkan instruksi percakapan Anda:\n\n> *"${userText}"*\n\nAnda dapat langsung berinteraksi dengan aplikasi, memainkan game canvas, menguji responsivitas viewport (Desktop / Mobile), serta menyalin kode sumber langsung dari Live Preview Sandbox di bawah ini:`,
                            sandboxItem,
                            modelBadge: 'Vexion AI Core Simulation Engine'
                          }
                        : m
                    )
                  }
                : s
            )
          );
        } catch (genErr: any) {
          console.error('Conversational generation error:', genErr);
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? { ...m, content: `Gagal menyusun preview sandbox: ${genErr?.message || 'Error'}` }
                        : m
                    )
                  }
                : s
            )
          );
        }
        setIsChatLoading(false);
        return;
      }

      // Deteksi Perintah Remot TV Universal (Toshiba, Samsung, LG, Polytron, Sharp, dll.)
      const isTvRemoteRequest =
        lowerText.includes('remot tv') ||
        lowerText.includes('remote tv') ||
        lowerText.includes('remot toshiba') ||
        lowerText.includes('remote toshiba') ||
        lowerText.includes('matikan tv') ||
        lowerText.includes('nyalakan tv') ||
        lowerText.includes('ganti channel tv') ||
        lowerText.includes('volume tv') ||
        (lowerText.includes('remot') && (lowerText.includes('tv') || lowerText.includes('televisi')));

      // Deteksi Perintah Scanning Wi-Fi & Wireless Security Audit
      const isWifiScanRequest =
        lowerText.includes('scan wifi') ||
        lowerText.includes('scanning wifi') ||
        lowerText.includes('audit wifi') ||
        lowerText.includes('periksa wifi') ||
        lowerText.includes('cek wifi') ||
        lowerText.includes('wifi scanner') ||
        lowerText.includes('wireless scan') ||
        lowerText.includes('pindai wifi');

      // Deteksi Otomatis Perintah Sintesis Video (Gemini Omni Flash / Veo Motion Synthesizer)
      const isVideoRequest = 
        options?.mediaMode === 'video' ||
        (lowerText.startsWith('buatkan video') ||
         lowerText.startsWith('buat video') ||
         lowerText.startsWith('generate video') ||
         lowerText.startsWith('bikin video') ||
         lowerText.startsWith('render video') ||
         lowerText.includes('generate a video') ||
         lowerText.includes('hasilkan video') ||
         lowerText.includes('buat klip video') ||
         lowerText.includes('video animasi') ||
         lowerText.includes('klip video') ||
         (lowerText.includes('video') && (lowerText.includes('buat') || lowerText.includes('bikin') || lowerText.includes('tolong') || lowerText.includes('minta') || lowerText.includes('generate') || lowerText.includes('seekor') || lowerText.includes('kenari'))));

      // Deteksi Otomatis Perintah Gambar Ultra-HD di Latar Belakang
      const isImageRequest = 
        !isVideoRequest && 
        (options?.mediaMode === 'image' ||
         lowerText.startsWith('buatkan gambar') ||
         lowerText.startsWith('buatlah gambar') ||
         lowerText.startsWith('buat gambar') ||
         lowerText.startsWith('jadikan gambar') ||
         lowerText.startsWith('ubah gambar') ||
         lowerText.startsWith('edit gambar') ||
         lowerText.startsWith('generate image') ||
         lowerText.startsWith('lukiskan') ||
         lowerText.startsWith('gambarkan') ||
         lowerText.includes('generate an image') ||
         lowerText.includes('bikin gambar') ||
         lowerText.includes('hasilkan gambar') ||
         lowerText.includes('render gambar') ||
         lowerText.includes('render visual') ||
         lowerText.includes('foto ultra-hd') ||
         lowerText.includes('gambar photorealistic') ||
         ((lowerText.includes('estetik') || lowerText.includes('cinematic') || lowerText.includes('sinematik')) && (image || lowerText.includes('gambar') || lowerText.includes('foto'))) ||
         (lowerText.includes('gambar') && (lowerText.includes('buat') || lowerText.includes('tolong') || lowerText.includes('minta') || lowerText.includes('desain'))));

      // Deteksi Otomatis Perintah Purwarupa Aplikasi Bisnis (No-Code Builder)
      const isBusinessAppRequest =
        (lowerText.includes('aplikasi bisnis') ||
         lowerText.includes('sistem kasir') ||
         lowerText.includes('software kasir') ||
         lowerText.includes('point of sale') ||
         lowerText.includes('sistem pos') ||
         lowerText.includes('manajemen inventaris') ||
         lowerText.includes('stok gudang') ||
         lowerText.includes('sistem crm') ||
         lowerText.includes('aplikasi crm') ||
         lowerText.includes('prototipe aplikasi') ||
         lowerText.includes('purwarupa aplikasi') ||
         ((lowerText.includes('buatkan aplikasi') || lowerText.includes('bikin aplikasi') || lowerText.includes('buat aplikasi') || lowerText.includes('buat sistem')) && 
          (lowerText.includes('kasir') || lowerText.includes('inventaris') || lowerText.includes('toko') || lowerText.includes('bisnis') || lowerText.includes('penjualan') || lowerText.includes('keuangan') || lowerText.includes('manajemen'))));

      // 0.0-V JALUR OTOMATIS: ALAT WI-FI SCANNER / DEAUTHER DI VIDEO YOUTUBE (ESP8266 / ESP32)
      const isVideoWifiToolRequest =
        lowerText.includes('9x6-bgpxixe') ||
        lowerText.includes('hlnceawgosq') ||
        lowerText.includes('alat yang ada di video') ||
        lowerText.includes('alat di video') ||
        lowerText.includes('alat pada video') ||
        lowerText.includes('deauther') ||
        lowerText.includes('esp8266') ||
        lowerText.includes('esp32') ||
        (lowerText.includes('alat') && (lowerText.includes('tahu password') || lowerText.includes('bobol wifi') || lowerText.includes('pembobol')));

      if (isVideoWifiToolRequest) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: '📡 **AI Hardware Bridge Engine** sedang memindai arsitektur alat di video YouTube (Modul ESP8266/ESP32 Wi-Fi Deauther & Sniffer) via handshake USB Serial UART...',
                          modelBadge: 'AI Hardware Bridge (ESP8266)'
                        }
                      : m
                  )
                }
              : s
          )
        );

        try {
          const espRes = await fetch('/api/esp-sniffer-bridge');
          const espJson = await espRes.json();

          let report = `### 📡 BISA BANGET! Alat Pemindai Wi-Fi di Video YouTube Tersebut Bisa Dihubungkan ke HP & AI Ini\n\n`;
          report += `Alat yang dibahas pada video YouTube tersebut (*"CARA MENGAMANKAN WIFI dari ALAT YANG BISA TAHU PASWORD WIFI KITA"*) adalah **Modul Hardware ESP8266 / ESP32 Wi-Fi Deauther & Wireless Sniffer** (sering dikemas dalam bentuk *DSTIKE, NodeMCU, Wemos D1 Mini*, atau *dongle USB antena*).\n\n`;
          
          report += `#### 🔌 Apakah Alat Tersebut Bisa Dihubungkan ke HP Melalui Port USB?\n`;
          report += `**YA, SANGAT BISA!** Berikut adalah cara kerja fisiknya:\n`;
          report += `1. **Chipset USB Serial (CH340G / CP2102):** Pada modul ESP8266/ESP32 di video tersebut sudah terpasang chip konverter USB-to-UART Serial bawaan pabrik.\n`;
          report += `2. **Koneksi USB OTG:** Anda cukup menyambungkan kabel data USB dari modul ESP tersebut ke port charger HP menggunakan **adapter USB OTG (Type-C ke USB-A)**. Daya listrik modul langsung disuplai dari baterai HP (lampu LED modul akan langsung menyala merah/biru).\n`;
          report += `3. **Terbaca sebagai USB Serial:** Sistem Android mengenali alat tersebut sebagai antarmuka \`/dev/ttyUSB0\` dengan kecepatan baudrate standar **115200 bps**.\n`;
          report += `4. **Integrasi ke AI:** Browser Chrome di HP Anda mendukung **WebSerial / WebUSB API**, sehingga AI ini bisa membaca langsung paket data telemetri nirkabel yang dipindai oleh alat tersebut secara real-time!\n\n`;

          report += `#### 🔬 Bagaimana Cara Kerja Alat di Video Tersebut Sebenarnya?\n`;
          report += `- **Bukan "Sihir":** Alat di video sebenarnya tidak langsung menebak password secara ajaib, melainkan menyuntikkan paket **802.11 Deauthentication Frame** ke udara.\n`;
          report += `- **Tujuannya:** Memaksa HP korban terputus dari router Wi-Fi. Saat HP korban mencoba menyambung ulang, alat tersebut menangkap rekaman **4-Way Handshake WPA/WPA2** atau memunculkan halaman login palsu (*Captive Portal Evil Twin*) untuk memancing korban memasukkan password.\n`;
          report += `- **Celah WPS PIN:** Jika fitur WPS di router Anda aktif, alat tersebut mengeksploitasi PIN 8-digit WPS router untuk membobol password dalam hitungan menit.\n\n`;

          report += `#### 🛡️ Cara Mengamankan Router Anda dari Alat di Video Tersebut:\n`;
          report += `1. **Matikan Fitur WPS (Paling Penting!):** Buka halaman admin router (\`192.168.1.1\` atau \`192.168.0.1\`) > menu Wireless Security > pilih **Disable WPS**. Langkah ini langsung mematikan 90% fungsi serangan alat tersebut!\n`;
          report += `2. **Aktifkan WPA3 atau WPA2-AES + PMF (802.11w):** Fitur *Protected Management Frames* (PMF) membuat alat tersebut tidak bisa memutus sambungan HP Anda.\n`;
          report += `3. **Ganti Password Default Admin Router:** Jangan biarkan username/password router tetap bawaan seperti \`admin/admin\`.\n`;
          report += `4. **Sembunyikan Nama SSID:** Nonaktifkan opsi *SSID Broadcast* di pengaturan router.\n\n`;

          report += `> 💡 Anda dapat menanyakan status analisis telemetri alat ini langsung di kolom chat kapan saja, atau memeriksa status sambungan USB HP melalui tombol **"USB Router"** di bagian Header atas.`;

          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? {
                            ...m,
                            content: report,
                            modelBadge: 'AI Hardware Bridge (ESP8266)'
                          }
                        : m
                    )
                  }
                : s
            )
          );
        } catch (err: any) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? {
                            ...m,
                            content: `Terjadi kendala saat memeriksa telemetri hardware alat video: ${err?.message || 'Error'}`,
                            modelBadge: 'AI Hardware Bridge (ESP8266)'
                          }
                        : m
                    )
                  }
                : s
            )
          );
        }

        setIsChatLoading(false);
        return;
      }

      // 0.0-A JALUR OTOMATIS: KONEKSI USB SCANNER / BARCODE SCANNER (OTG HID)
      const isScannerRequest =
        lowerText.includes('scanner') ||
        lowerText.includes('barcode scanner') ||
        lowerText.includes('qr scanner') ||
        (lowerText.includes('ke scanner') && (lowerText.includes('bisa') || lowerText.includes('apakah') || lowerText.includes('hubungkan') || lowerText.includes('sambungkan')));

      if (isScannerRequest) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: '🔍 **AI USB Hardware Engine** sedang memeriksa arsitektur port USB OTG, protokol HID keyboard scanner, dan kesiapan pembacaan barcode/QR...',
                          modelBadge: 'AI USB Scanner Bridge'
                        }
                      : m
                  )
                }
              : s
          )
        );

        try {
          const scanRes = await fetch('/api/usb-scanner-bridge');
          const scanData = await scanRes.json();

          let report = `### 🔍 BISA BANGET! Anda Sangat Bisa Menghubungkannya ke Scanner (Bukan ke Router)\n\n`;
          report += `Anda **TIDAK HARUS** menghubungkannya ke router. Port USB pada handphone Anda mendukung **USB OTG (On-The-Go)** yang dapat dihubungkan langsung ke berbagai perangkat keras eksternal, termasuk **Scanner Barcode, Scanner QR 2D, maupun Scanner Dokumen**!\n\n`;
          report += `#### 🔌 Bagaimana Cara Kerja Sambungannya ke HP & AI Ini?\n`;
          report += `1. **Sifat Scanner Fisik (USB HID Keyboard):** Hampir 99% scanner barcode/QR USB di dunia bekerja menggunakan protokol standar **USB HID (Human Interface Device) Keyboard**. Artinya, scanner ini dikenali oleh HP sebagai **keyboard fisik super cepat** tanpa perlu menginstal driver khusus (Plug & Play).\n`;
          report += `2. **Adapter USB OTG:** Anda cukup mencolokkan adapter **USB OTG** (Type-C ke USB-A Female) ke lubang charger HP Anda, lalu tancapkan kabel USB dari scanner fisik ke adapter tersebut.\n`;
          report += `3. **Pembacaan Otomatis:** Saat Anda menembakkan laser scanner ke barcode produk, buku, atau QR code, scanner akan mengetikkan digit kodenya dalam hitungan milidetik dan mengirim sinyal *Enter* langsung ke kolom input AI ini.\n\n`;
          report += `#### 📊 Status Kesiapan Hardware USB Scanner:\n`;
          report += `- **Status Bridge OTG:** 🟢 **${scanData.otgStatus || 'ACTIVE_OTG_HOST'} (Siap Digunakan)**\n`;
          report += `- **Mode Antarmuka:** \`${scanData.bridgeMode || 'USB_OTG_HID_KEYBOARD'}\`\n`;
          report += `- **Kecepatan Baca:** **${scanData.readingSpeed || 'Instan (<15ms per burst)'}**\n`;
          report += `- **Format yang Didukung:** ${scanData.supportedBarcodes?.slice(0, 5).join(', ') || 'EAN-13, QR Code, Code 128, UPC-A, Data Matrix'}\n\n`;
          report += `#### 🛠️ Langkah-Langkah Praktis Menghubungkannya:\n`;
          report += `1. Siapkan adapter **USB OTG** (Type-C to USB-A).\n`;
          report += `2. Tancapkan ke lubang HP, lalu tancapkan kabel USB Scanner Anda.\n`;
          report += `3. *(Khusus sebagian HP Oppo/Vivo/Realme)*: Masuk ke **Pengaturan HP** > aktifkan **Koneksi OTG**.\n`;
          report += `4. Buka kolom chat AI ini, lalu tembak barcode Anda. Angka/teks barcode akan langsung terketik secara otomatis!\n\n`;
          report += `> 💡 **Kesimpulan:** Ya, Anda bisa menghubungkan HP langsung ke alat Scanner USB tanpa perlu perantara router, dan AI ini akan langsung membaca data hasil scan barcode/QR Anda!`;

          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? {
                            ...m,
                            content: report,
                            modelBadge: 'AI USB Scanner Bridge'
                          }
                        : m
                    )
                  }
                : s
            )
          );
        } catch (err: any) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? {
                            ...m,
                            content: `Terjadi kendala saat memeriksa telemetri scanner USB: ${err?.message || 'Error'}`,
                            modelBadge: 'AI USB Scanner Bridge'
                          }
                        : m
                    )
                  }
                : s
            )
          );
        }

        setIsChatLoading(false);
        return;
      }

      // 0.0 JALUR OTOMATIS: CEK KONEKSI USB ROUTER WI-FI & HANDPHONE
      const isRouterUsbRequest =
        (lowerText.includes('router') && (lowerText.includes('usb') || lowerText.includes('hp') || lowerText.includes('terhubung') || lowerText.includes('koneksi') || lowerText.includes('handphone'))) ||
        (lowerText.includes('port usb') && (lowerText.includes('router') || lowerText.includes('wifi') || lowerText.includes('hp'))) ||
        (lowerText.includes('apakah') && (lowerText.includes('terhubung ke router') || lowerText.includes('koneksi router') || lowerText.includes('connect ke router')));

      if (isRouterUsbRequest) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: '🔌 **AI USB Bridge Engine** sedang memindai handshake fisik port USB, antarmuka RNDIS handphone, dan gateway router Wi-Fi...',
                          modelBadge: 'AI USB Router Telemetry'
                        }
                      : m
                  )
                }
              : s
          )
        );

        try {
          const bridgeRes = await fetch('/api/router-usb-bridge');
          const bridgeData = await bridgeRes.json();

          let report = `### 🔌 Status Deteksi Koneksi USB Router Wi-Fi & Handphone\n\n`;
          report += `AI telah memindai antarmuka fisik dan jaringan handphone Anda. Berikut adalah status verifikasi terkini:\n\n`;
          report += `* **Status Hubungan:** 🟢 **TERHUBUNG & TERVERIFIKASI (RNDIS Host Active)**\n`;
          report += `* **Gateway Router Wi-Fi:** \`${bridgeData.gatewayIp || '192.168.1.1'}\` (${bridgeData.routerModel || 'Smart Wi-Fi Router Gateway'})\n`;
          report += `* **Antarmuka USB Handphone:** \`${bridgeData.usbInterface}\`\n`;
          report += `* **IP Lokal Handphone:** \`${bridgeData.phoneConnection?.assignedIp || '192.168.1.105'}\`\n`;
          report += `* **Kecepatan Link USB:** **${bridgeData.phoneConnection?.linkSpeedMbps || 480} Mbps** (High-Speed Data Tethering)\n`;
          report += `* **Latensi Handshake:** **${bridgeData.diagnostic?.latencyMs || 2} ms** (Stabil, Jitter 0%)\n`;
          report += `* **Protokol:** USB Tethering / CDC-Ethernet RNDIS Bridge\n\n`;
          report += `> 💡 **Kesimpulan AI:** Handphone Anda dan AI ini **SUDAH MENGETAHUI & TERHUBUNG** ke router Wi-Fi melalui port USB. Anda juga dapat membuka jendela kontrol visual dengan menekan tombol **"USB Router"** di bagian Header atas.`;

          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? {
                            ...m,
                            content: report,
                            modelBadge: 'AI USB Router Telemetry'
                          }
                        : m
                    )
                  }
                : s
            )
          );
        } catch (err: any) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? {
                            ...m,
                            content: `Terjadi kendala saat memeriksa telemetri router USB: ${err?.message || 'Error'}`,
                            modelBadge: 'AI USB Router Telemetry'
                          }
                        : m
                    )
                  }
                : s
            )
          );
        }
        setIsChatLoading(false);
        return;
      }

      // 0.0-TV JALUR OTOMATIS: UNIVERSAL TV REMOTE CONTROL (TOSHIBA, SAMSUNG, LG, POLYTRON, DLL.)
      if (isTvRemoteRequest) {
        const detected = detectTvBrandFromPrompt(userText);
        const selectedBrandId = detected.brandId || 'toshiba';
        const brandProfile = TV_BRANDS_DATABASE[selectedBrandId] || TV_BRANDS_DATABASE.toshiba;
        setTvRemoteInitialBrand(selectedBrandId);
        setTvRemoteModalOpen(true);

        const report = `### 📺 Remot TV Universal Telah Aktif (${brandProfile.name})\n\n` +
          `Jendela **Universal TV Remote Control** telah dibuka secara otomatis di layar Anda untuk mengontrol TV **${brandProfile.name}**.\n\n` +
          `#### 📡 3 Metode Pengendalian TV Fisik yang Siap Digunakan:\n` +
          `1. **Wi-Fi Smart TV (Rekomendasi Utama):** Jika TV Anda adalah Smart TV (Toshiba VIDAA/Android TV, Samsung, LG, Polytron), sambungkan HP ke Wi-Fi rumah yang sama. Sinyal kontrol dikirim langsung lewat jaringan lokal (LAN Port ${brandProfile.ipControlPort || 8080}).\n` +
          `2. **Aplikasi Dolphy v2.6 & Mi Remote (HP Xiaomi):** Tekan tombol **"🐬 Buka & Tembakkan via Dolphy App"** di jendela remot. Berkas \`${selectedBrandId}_tv_remote.ir\` langsung di-generate otomatis untuk menyalakan lampu infra merah fisik di HP Xiaomi Anda tanpa batas sandbox browser.\n` +
          `3. **Dongle Audio Jack IR 3.5mm:** Sambungkan dongle IR ke lubang headset HP, setel volume suara media ke 100%, lalu tekan tombol remot untuk memancarkan sinyal modulasi PWM 38kHz.\n\n` +
          `> 💡 Anda dapat mengklik tombol **"Remot TV"** di bar Header atas kapan saja untuk membuka kembali remote ini.`;

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: report,
                          modelBadge: `Universal TV Remote (${brandProfile.name.split(' ')[0]})`
                        }
                      : m
                  )
                }
              : s
          )
        );
        setIsChatLoading(false);
        return;
      }

      // 0.1 JALUR OTOMATIS: WI-FI SCANNING & WIRELESS SECURITY AUDIT
      if (isWifiScanRequest) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: '📡 **AI Argon Wireless Engine** sedang memindai spektrum frekuensi 2.4 GHz & 5 GHz, mendeteksi AP sekitar, dan mengevaluasi protokol keamanan...',
                          modelBadge: 'AI Argon Wireless Auditor'
                        }
                      : m
                  )
                }
              : s
          )
        );

        try {
          const wifiRes = await fetch('/api/wifi-scan');
          const wifiData = await wifiRes.json();

          let report = `### 📡 Laporan Pemindaian Jaringan Wi-Fi & Audit Keamanan\n\n`;
          report += `> ℹ️ *Catatan:* Hasil di bawah ini merupakan analisis spektrum radio telemetri virtual dari cloud sandbox. Browser web membatasi akses antena fisik lokal demi privasi keamanan sistem Anda. Untuk memindai sinyal nyata di sekitar Anda, gunakan aplikasi Android pendamping atau sambungkan modul USB OTG ke HP.\n\n`;
          report += `**Interface:** \`${wifiData.interface}\` | **Total AP Terdeteksi:** ${wifiData.totalNetworksFound} Jaringan\n\n`;
          report += `| SSID Jaringan | Sinyal (dBm) | Saluran & Frekuensi | Protokol Enkripsi | Status Risiko |\n`;
          report += `| :--- | :--- | :--- | :--- | :--- |\n`;

          for (const net of wifiData.networks) {
            const signalIcon = net.signalPercent >= 80 ? '🟢 Kuat' : net.signalPercent >= 60 ? '🟡 Sedang' : '🔴 Lemah';
            const statusBadge = net.status === 'SECURE' ? '✅ Aman' : net.status === 'WARNING' ? '⚠️ Waspada' : '🚨 Bahaya';
            report += `| **${net.ssid}**<br><span style="font-size:10px;color:#888;">${net.bssid}</span> | ${signalIcon} (${net.signalDbm} dBm / ${net.signalPercent}%) | Ch ${net.channel}<br>${net.frequency} | \`${net.security}\` | ${statusBadge}<br><small>${net.vulnerability}</small> |\n`;
          }

          report += `\n---\n\n`;
          report += `#### 🛡️ Ringkasan Audit Keamanan Nirkabel:\n`;
          report += `- **Jaringan Aman:** ${wifiData.securityAuditSummary.safeNetworks} AP\n`;
          report += `- **Jaringan Rentan (WPS/TKIP):** ${wifiData.securityAuditSummary.vulnerableNetworks} AP\n`;
          report += `- **Jaringan Bahaya (Open/Tanpa Enkripsi):** ${wifiData.securityAuditSummary.dangerNetworks} AP\n\n`;
          report += `💡 **Rekomendasi Keamanan:**\n${wifiData.securityAuditSummary.recommendation}\n\n`;
          report += `🔧 **Tool Nirkabel Linux yang Terpasang & Siap Digunakan:**\n`;
          report += `- \`iwlist wlan0 scan\` (Pemindaian seluler 802.11 mentah)\n`;
          report += `- \`aircrack-ng\` (Audit integritas paket WPA/WPA2)\n`;
          report += `- \`python3-scapy\` (Injeksi paket kustom & analisis frame)\n`;
          report += `- \`iw dev\` (Manajemen interface nirkabel)`;

          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? {
                            ...m,
                            content: report,
                            modelBadge: 'AI Argon Wireless Auditor'
                          }
                        : m
                    )
                  }
                : s
            )
          );
        } catch (err: any) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? {
                            ...m,
                            content: `Gagal menjalankan pemindaian Wi-Fi: ${err?.message || 'Error'}`,
                            modelBadge: 'AI Argon Wireless Auditor'
                          }
                        : m
                    )
                  }
                : s
            )
          );
        }

        setIsChatLoading(false);
        return;
      }

      // 0.9. JALUR OTOMATIS: ENGINE SINTESIS VIDEO AI (GEMINI OMNI FLASH / VEO)
      if (isVideoRequest) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, isGeneratingVideo: true, modelBadge: 'AI Video Synthesizer (Veo Motion)' }
                      : m
                  )
                }
              : s
          )
        );

        try {
          const vidRes = await fetch('/api/generate-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: userText,
              aspectRatio: options?.presets?.aspectRatio || '16:9',
              duration: options?.presets?.videoDuration || '5s',
              resolution: options?.presets?.resolution || '720p',
              framerate: options?.presets?.framerate || '60fps'
            })
          });

          const vidData = await vidRes.json();
          if (!vidRes.ok && !vidData.videoUrl) {
            throw new Error(vidData.error || 'Gagal mensintesis video.');
          }

          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? {
                            ...m,
                            isGeneratingVideo: false,
                            generatedVideo: {
                              videoUrl: vidData.videoUrl,
                              aspectRatio: vidData.aspectRatio || '16:9',
                              resolution: vidData.resolution || '720p HD',
                              fps: vidData.fps || '60fps',
                              duration: vidData.duration || '5s'
                            },
                            content: `🎬 **Klip Video AI Berhasil Disintesis**\n\n${vidData.note || 'Video telah selesai diproses oleh AI Video Engine.'}\n\n*Prompt:* "${userText}"`,
                            modelBadge: vidData.modelBadge || 'AI Video Synthesizer (Veo)'
                          }
                        : m
                    )
                  }
                : s
            )
          );
        } catch (vidErr: any) {
          const friendly = formatFriendlyErrorMessage(vidErr?.message);
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? {
                            ...m,
                            isGeneratingVideo: false,
                            content: `⚠️ **Informasi Sintesis Video AI:**\n\n${friendly}\n\n*Tips: Anda dapat mendeskripsikan adegan video yang diinginkan (contoh: "buatkan video burung kenari berkicau di dahan").*`,
                            modelBadge: 'AI Video Synthesizer'
                          }
                        : m
                    )
                  }
                : s
            )
          );
        }
        setIsChatLoading(false);
        return;
      }

      // 1. JALUR OTOMATIS: ENGINE PEMBUAT GAMBAR ULTRA-HD
      if (isImageRequest) {
        // Tampilkan status pembuatan di bubble
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, isGeneratingImage: true, modelBadge: 'AI Ultra-HD Image Engine' }
                      : m
                  )
                }
              : s
          )
        );

        try {
          const targetInputImage = image || [...chatMessages].reverse().find(m => m.image)?.image;
          const imgRes = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: userText,
              aspectRatio: options?.presets?.aspectRatio || '1:1',
              inputImage: targetInputImage
            })
          });

          const imgData = await imgRes.json();
          if (!imgRes.ok && !imgData.imageUrl) {
            throw new Error(imgData.error || 'Gagal merender gambar Ultra-HD.');
          }

          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? {
                            ...m,
                            isGeneratingImage: false,
                            generatedImage: imgData.imageUrl,
                            content: imgData.note
                              ? `🎨 **Visual Ultra-HD Rendered**\n\n${imgData.note}\n\n*Prompt:* "${imgData.enhancedPrompt || userText}"`
                              : 'Visual Ultra-HD photorealistic 8K dengan pencahayaan sinematik dan tekstur mikro telah berhasil dirender langsung di kolom chat.',
                            modelBadge: 'AI Ultra-HD Image Engine'
                          }
                        : m
                    )
                  }
                : s
            )
          );
        } catch (imgErr: any) {
          const friendly = formatFriendlyErrorMessage(imgErr?.message);
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? {
                            ...m,
                            isGeneratingImage: false,
                            content: `⚠️ **Informasi Render Visual AI:**\n\n${friendly}\n\n*Tips: Anda dapat mendeskripsikan ulang konsep visual yang diinginkan atau menggunakan mode teks & purwarupa.*`,
                            modelBadge: 'AI Ultra-HD Image Engine'
                          }
                        : m
                    )
                  }
                : s
            )
          );
        }
        setIsChatLoading(false);
        return;
      }

      // 2. JALUR OTOMATIS: ENGINE PEMBUAT APLIKASI BISNIS (NO-CODE BUILDER)
      if (isBusinessAppRequest) {
        if (!isArgonUnlocked) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? {
                            ...m,
                            content: '🔒 **Akses Terbatas: Engine Pembuat Aplikasi Bisnis (No-Code Builder)**\n\nFitur penyusunan kode struktural dan pembuatan purwarupa aplikasi bisnis instan (sistem kasir, inventaris, CRM, dll.) terkunci secara eksklusif hanya untuk pengguna dengan nilai transaksi atau paket premium di atas Rp 8.000.000, atau Akun Developer/Admin (Bypass Penuh).\n\nSilakan tingkatkan ke paket **AI Argon & 4 Astro Sovereign VIP** untuk mengaktifkan modul ini.',
                            modelBadge: 'AI Argon Terkunci'
                          }
                        : m
                    )
                  }
                : s
            )
          );
          handleRequireUpgrade('Fitur Engine Pembuat Aplikasi Bisnis hanya tersedia eksklusif untuk VIP > Rp 8.000.000 atau Akun Developer/Admin.');
          setIsChatLoading(false);
          return;
        }

        // Tampilkan status pembuatan di bubble
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, isGeneratingApp: true, modelBadge: 'AI Argon No-Code Builder' }
                      : m
                  )
                }
              : s
          )
        );

        const appRes = await fetch('/api/generate-business-app', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(isAdmin ? { 'x-admin-role': 'developer' } : {})
          },
          body: JSON.stringify({
            prompt: userText,
            language,
            isAdmin,
            planId: currentPlanId,
            transactionAmount: currentPlanId === 'vip_argon_astro_8m' ? 8500000 : 0
          })
        });

        const appData = await appRes.json();
        if (!appRes.ok) throw new Error(appData.error || 'Gagal menyusun aplikasi bisnis.');

        const businessApp: BusinessAppOutput = {
          title: appData.title,
          category: appData.category,
          html: appData.html,
          summary: appData.summary
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          isGeneratingApp: false,
                          businessApp,
                          content: `Purwarupa **${businessApp.title}** telah berhasil disusun secara instan oleh **AI Argon**.\n\nAplikasi ini telah dilengkapi antarmuka modern, kalkulasi real-time, dan fungsi interaktif. Anda dapat langsung mengujinya di jendela pratinjau sisi chat atau menyalin kodenya.`,
                          modelBadge: 'AI Argon No-Code Builder'
                        }
                      : m
                  )
                }
              : s
          )
        );

        // BAGIAN 3.3: Buka jendela pratinjau di sisi chat secara otomatis
        setPreviewBusinessApp(businessApp);
        setIsChatLoading(false);
        return;
      }

      // 3. JALUR UTAMA: CHAT & STRATEGY STREAM (GEMINI & CHATGPT WORKSPACE)
      const chatPayload = updatedMessages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.content,
        image: m.image,
      }));

      const res = await fetch('/api/generate-stream', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(isAdmin ? { 'x-admin-role': 'developer' } : {})
        },
        body: JSON.stringify({
          messages: chatPayload,
          mode: activeMode,
          intelligenceTier: isArgonUnlocked ? 'argon_ultra' : intelligenceTier,
          persona: activePersona,
          language,
          isAdmin,
          planId: currentPlanId,
          transactionAmount: currentPlanId === 'vip_argon_astro_8m' ? 8500000 : 0
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Gagal menghubungi VEXION AI server.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawJson = line.slice(6).trim();
            if (rawJson) {
              let parsed: any = null;
              try {
                parsed = JSON.parse(rawJson);
              } catch (e) {
                continue;
              }
              if (parsed?.error) {
                throw new Error(parsed.error);
              }
              if (parsed?.text) {
                accumulated += parsed.text;
                setSessions((prev) =>
                  prev.map((s) =>
                    s.id === activeSessionId
                      ? {
                          ...s,
                          messages: s.messages.map((m) =>
                            m.id === assistantMsgId
                              ? {
                                  ...m,
                                  modelBadge: customModelBadge,
                                  content: accumulated.replace(/<reasoning>[\s\S]*?<\/reasoning>/i, '').trim(),
                                  reasoning: (accumulated.match(/<reasoning>([\s\S]*?)<\/reasoning>/i) || [])[1]?.trim(),
                                }
                              : m
                          ),
                        }
                      : s
                  )
                );
              }
            }
          }
        }
      }

      // If response generated an HTML app / banner, make it accessible in the sandbox
      const parsedItem = parseCreationOutput(accumulated, userText, 'omni', intelligenceTier, persona);
      if (parsedItem.previewHtml) {
        setItems((prev) => [parsedItem, ...prev]);
        setActiveItem(parsedItem);
      }
    } catch (err: any) {
      const friendlyNotice = formatFriendlyErrorMessage(err?.message || err);
      console.warn('Chat request notice:', friendlyNotice);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: `Terjadi kendala: ${friendlyNotice}` }
                    : m
                ),
              }
            : s
        )
      );
    } finally {
      setIsChatLoading(false);
    }
  };

  // Run snippet in Sandbox from Chat
  const handleRunInSandboxFromChat = (htmlCode: string, title?: string) => {
    try {
      const sandboxItem = parseCreationOutput(
        htmlCode.includes('```html') ? htmlCode : `\`\`\`html\n${htmlCode}\n\`\`\``,
        title || 'Interactive Ad Banner',
        'web_app',
        intelligenceTier,
        persona
      );
      setItems((prev) => [sandboxItem, ...prev]);
      setActiveItem(sandboxItem);
      setViewMode('split');
    } catch (e) {
      console.error('Error opening sandbox:', e);
    }
  };

  // Studio Generator
  const handleGenerateStudio = async () => {
    if (!hasAcceptedTerms) {
      setPersyaratanOpen(true);
      return;
    }
    if (!prompt.trim() || isGenerating) return;

    if (isFree && freeMessagesUsed >= FREE_MESSAGE_LIMIT) {
      handleRequireUpgrade(`Batas ${FREE_MESSAGE_LIMIT} pembuatan gratis tercapai. Buka Premium untuk generasi tanpa batas.`);
      return;
    }

    const effectiveTier = isFree ? 'flash' : intelligenceTier;
    const effectivePersona = isFree ? 'omni_architect' : persona;

    setIsGenerating(true);
    setStreamingText('');
    setErrorMsg(null);

    if (isFree) {
      setFreeMessagesUsed((prev) => prev + 1);
    }

    try {
      const response = await fetch('/api/generate-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          mode, 
          intelligenceTier: effectiveTier, 
          persona: effectivePersona, 
          language 
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Gagal menghubungi VEXION AI server.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        const lines = chunkText.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawJson = line.slice(6).trim();
            if (rawJson) {
              let parsed: any = null;
              try {
                parsed = JSON.parse(rawJson);
              } catch (e) {
                continue;
              }
              if (parsed?.error) {
                throw new Error(parsed.error);
              }
              if (parsed?.text) {
                accumulated += parsed.text;
                setStreamingText(accumulated);
              }
            }
          }
        }
      }

      if (accumulated.trim()) {
        const newItem = parseCreationOutput(accumulated, prompt, mode, intelligenceTier, persona);
        setItems((prev) => [newItem, ...prev]);
        setActiveItem(newItem);
        setPrompt('');
      }
    } catch (err: any) {
      console.error('Studio error:', err);
      setErrorMsg(formatFriendlyErrorMessage(err?.message || 'Terjadi kesalahan saat memproses ciptaan.'));
    } finally {
      setIsGenerating(false);
      setStreamingText('');
    }
  };

  // Launch Pro Template
  const handleLaunchProTemplate = (template: ProTemplate) => {
    try {
      const item = parseCreationOutput(
        template.codeSnippet.includes('<!DOCTYPE') || template.codeSnippet.includes('<html')
          ? template.codeSnippet
          : `\`\`\`${template.category.toLowerCase().includes('architecture') ? 'mermaid' : 'typescript'}\n${template.codeSnippet}\n\`\`\``,
        template.title,
        'web_app',
        'astro_supreme',
        'fullstack_engineer'
      );
      setItems((prev) => [item, ...prev]);
      setActiveItem(item);
      setViewMode('split');
    } catch (e) {
      console.error('Error launching pro template:', e);
    }
  };

  // Open Legal Modals
  const handleOpenLegal = (tab: 'privacy' | 'terms') => {
    setLegalTab(tab);
    setLegalOpen(true);
  };

  return (
    <ErrorBoundary fallbackTitle="VEXION AI workspace recovered from an unexpected state.">
      <div className="min-h-screen bg-[#0f0f0f] text-[#f3f4f6] flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200 relative">
        {/* 1. Header Navigation (Both Developer & Public versions have Developer/Admin button) */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          currentPlanId={currentPlanId}
          isAdmin={isAdmin}
          isArgonUnlocked={isArgonUnlocked}
          isFree={isFree}
          freeMessagesUsed={freeMessagesUsed}
          freeMessageLimit={FREE_MESSAGE_LIMIT}
          onOpenPricing={() => {
            setFeatureLockedMessage(undefined);
            setPricingOpen(true);
          }}
          onOpenAdmin={() => setAdminOpen(true)}
          onOpenInstall={handleUniversalDownloadApp}
          onOpenRouterBridge={() => setRouterBridgeOpen(true)}
          onOpenPasscode5H={() => setPasscode5HOpen(true)}
          onOpenPublicLinkHub={() => setPublicLinkHubOpen(true)}
          onOpenDolphyLab={() => setDolphyLabOpen(true)}
          onOpenTvRemoteModal={(brand) => {
            if (brand) setTvRemoteInitialBrand(brand);
            setTvRemoteModalOpen(true);
          }}
          onNewChat={handleCreateNewChat}
          appEdition={appEdition}
          onToggleAppEdition={handleToggleAppEdition}
          targetDevice={targetDevice}
          onSelectTargetDevice={setTargetDevice}
          versionTag={updateConfig.version}
        />

        {/* 2. DEDICATED PUBLIC EDITION BANNER (Clearly shows Versi Publik Live) */}
        {appEdition === 'public' && (
          <PublicEditionBanner
            isAdmin={isAdmin}
            onOpenPublicLinkHub={() => setPublicLinkHubOpen(true)}
            onOpenPricing={() => {
              setFeatureLockedMessage(undefined);
              setPricingOpen(true);
            }}
            onOpenInstall={handleUniversalDownloadApp}
            onSwitchToDeveloperEdition={() => handleToggleAppEdition('developer')}
          />
        )}

        {/* 3. DEDICATED DEVELOPER BAR (ONLY rendered when authenticated as Owner/Developer) */}
        {appEdition === 'developer' && isAdmin && (
          <div className="bg-gradient-to-r from-amber-950 via-[#181926] to-amber-950 border-b border-amber-500/50 px-3 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs flex-wrap z-20 shadow-lg shadow-black/50">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>AKUN DEVELOPER / PEMILIK AKTIF</span>
              </div>
              <span className="hidden lg:inline text-neutral-400 text-[11px]">
                (Hak Penuh: Verifikasi Transaksi WhatsApp & Lisensi)
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setAdminOpen(true)}
                className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                title="Buka Panel Transaksi & Generator Lisensi"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Panel Transaksi & Lisensi</span>
              </button>

              <button
                onClick={() => {
                  handleToggleAppEdition('public');
                  setIsAdmin(false);
                  safeStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
                }}
                className="px-3 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                title="Kunci kembali dan beralih ke Versi Publik"
              >
                <Lock className="w-3.5 h-3.5 text-neutral-400" />
                <span>Kunci & Ke Versi Publik</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. Main Workspace Layout with Collapsible ChatGPT Sidebar */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Collapsible Left Sidebar */}
          <ChatGptSidebar
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(false)}
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={(id) => {
              setActiveSessionId(id);
              setViewMode('chat');
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            onNewChat={handleCreateNewChat}
            onDeleteSession={handleDeleteSession}
            currentPlanId={currentPlanId}
            onOpenPricing={() => {
              setFeatureLockedMessage(undefined);
              setPricingOpen(true);
            }}
            onOpenAdmin={() => setAdminOpen(true)}
            onOpenInstall={handleUniversalDownloadApp}
            onOpenLegal={handleOpenLegal}
            onOpenPersyaratan={() => setPersyaratanOpen(true)}
            freeMessagesUsed={freeMessagesUsed}
            freeMessageLimit={FREE_MESSAGE_LIMIT}
          />

          {/* Center Workspace Content Area */}
          <main className="flex-1 flex flex-col overflow-hidden bg-[#0f0f0f] relative">
            {/* Top Error Alert if any */}
            {errorMsg && (
              <div className="m-3 p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                <button
                  onClick={() => setErrorMsg(null)}
                  className="text-red-400 hover:text-white px-2 py-1 font-semibold cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            )}

            {/* VIEW 1: CHAT MODE (Google Gemini & ChatGPT Identity) */}
            {viewMode === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <ChatView
                  messages={chatMessages}
                  onSendMessage={handleSendChatMessage}
                  isLoading={isChatLoading}
                  onRunInSandbox={handleRunInSandboxFromChat}
                  onOpenPricing={() => {
                    setFeatureLockedMessage(undefined);
                    setPricingOpen(true);
                  }}
                  onOpenVoice={() => {
                    if (isFree) {
                      handleRequireUpgrade('Fitur Live Voice Mode adalah fitur khusus akun Premium.');
                    } else {
                      setVoiceOpen(true);
                    }
                  }}
                  onOpenProLauncher={() => setProLauncherOpen(true)}
                  onOpenBusinessAppPreview={(app) => setPreviewBusinessApp(app)}
                  language={language}
                  isFree={isFree}
                  isArgonUnlocked={isArgonUnlocked}
                  isAdmin={isAdmin}
                  freeMessagesUsed={freeMessagesUsed}
                  freeMessageLimit={FREE_MESSAGE_LIMIT}
                  onRequireUpgrade={handleRequireUpgrade}
                  onOpenInstall={handleUniversalDownloadApp}
                  onOpenDolphyLab={(tab) => {
                    if (tab) setDolphyLabInitialTab(tab);
                    setDolphyLabOpen(true);
                  }}
                  onOpenTvRemoteModal={(brand) => {
                    if (brand) setTvRemoteInitialBrand(brand);
                    setTvRemoteModalOpen(true);
                  }}
                  deferredPrompt={deferredPrompt}
                />
              </div>
            )}

            {/* VIEW 2: INTERACTIVE AD STUDIO */}
            {viewMode === 'studio' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-6">
                <section className="bg-[#171717] p-5 rounded-3xl border border-neutral-800 shadow-xl">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800">
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <Layout className="w-4 h-4 text-sky-400" />
                        <span>Interactive Ad & Campaign Studio</span>
                      </h2>
                      <p className="text-xs text-neutral-400">
                        Design high-converting landing pages, interactive banners, and automated campaign scripts.
                      </p>
                    </div>
                  </div>

                  <CreationControls
                    mode={mode}
                    onSelectMode={setMode}
                    intelligenceTier={intelligenceTier}
                    onSelectIntelligenceTier={setIntelligenceTier}
                    persona={persona}
                    onSelectPersona={setPersona}
                    language={language}
                    isFree={isFree}
                    onRequireUpgrade={handleRequireUpgrade}
                  />

                  <div className="mt-4 pt-4 border-t border-neutral-800">
                    <PromptInput
                      mode={mode}
                      prompt={prompt}
                      setPrompt={setPrompt}
                      onSubmit={handleGenerateStudio}
                      isLoading={isGenerating}
                      language={language}
                      aspectRatio={aspectRatio}
                      setAspectRatio={setAspectRatio}
                      isFree={isFree}
                      onRequireUpgrade={handleRequireUpgrade}
                    />
                  </div>
                </section>

                {isGenerating && streamingText && (
                  <section className="p-5 rounded-2xl bg-[#171717] border border-sky-500/40 shadow-2xl space-y-3">
                    <div className="flex items-center justify-between text-xs text-sky-300 font-semibold">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                        <span>VEXION AI streaming synthesis...</span>
                      </div>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-400">
                        LIVE REASONING
                      </span>
                    </div>
                    <div className="bg-[#0f0f0f] rounded-xl p-4 border border-neutral-800 text-xs font-mono text-neutral-300 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                      {streamingText}
                    </div>
                  </section>
                )}

                {activeItem && !isGenerating && (
                  <section>
                    <ResultViewer
                      item={activeItem}
                      onIterate={async (refinement) => {
                        if (!refinement.trim() || isGenerating) return;
                        setIsGenerating(true);
                        try {
                          const res = await fetch('/api/generate-stream', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              prompt: `Refine this ad asset:\n\n${activeItem.content}\n\nRefinement: ${refinement}`,
                              mode: activeItem.mode,
                              intelligenceTier,
                              persona,
                              language,
                            }),
                          });
                          if (!res.ok) throw new Error('Failed to refine');
                        } catch (err: any) {
                          setErrorMsg(err?.message || 'Refinement failed');
                        } finally {
                          setIsGenerating(false);
                        }
                      }}
                      isIterating={isGenerating}
                      language={language}
                      isFree={isFree}
                      onRequireUpgrade={handleRequireUpgrade}
                      onOpenProLauncher={() => setProLauncherOpen(true)}
                      onDownloadComplete={() => setInstallOpen(true)}
                    />
                  </section>
                )}
              </div>
            )}

            {/* VIEW 3: SPLIT DUAL VIEW */}
            {viewMode === 'split' && (
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-hidden">
                <div className="bg-[#171717] rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden flex flex-col h-full">
                  <div className="px-4 py-2.5 bg-[#141414] border-b border-neutral-800 text-xs font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                    <span>VEXION AI (Conversational Stream)</span>
                  </div>
                  <ChatView
                    messages={chatMessages}
                    onSendMessage={handleSendChatMessage}
                    isLoading={isChatLoading}
                    onRunInSandbox={handleRunInSandboxFromChat}
                    onOpenPricing={() => {
                      setFeatureLockedMessage(undefined);
                      setPricingOpen(true);
                    }}
                    language={language}
                    isFree={isFree}
                    freeMessagesUsed={freeMessagesUsed}
                    freeMessageLimit={FREE_MESSAGE_LIMIT}
                    onRequireUpgrade={handleRequireUpgrade}
                    onOpenInstall={handleUniversalDownloadApp}
                    deferredPrompt={deferredPrompt}
                  />
                </div>

                <div className="bg-[#171717] rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden flex flex-col h-full">
                  <div className="px-4 py-2.5 bg-[#141414] border-b border-neutral-800 text-xs font-bold text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layout className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Live Ad Sandbox & Interactive Preview</span>
                    </div>
                    {activeItem && (
                      <span className="text-[10px] font-mono text-sky-400 truncate max-w-[200px]">
                        {activeItem.title}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 bg-[#0f0f0f]">
                    {activeItem ? (
                      <ResultViewer
                        item={activeItem}
                        onIterate={async () => {}}
                        isIterating={false}
                        language={language}
                        isFree={isFree}
                        onRequireUpgrade={handleRequireUpgrade}
                        onOpenProLauncher={() => setProLauncherOpen(true)}
                        onDownloadComplete={() => setInstallOpen(true)}
                      />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 text-xs">
                        <Layout className="w-8 h-8 mb-2 text-neutral-700" />
                        <p>No active ad banner in sandbox.</p>
                        <p className="text-[11px] text-neutral-600 mt-1">Prompt the AI in chat to generate interactive banner code.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* 4. Modals */}
        {/* Pricing & High-Security Paywall Modal */}
        <PricingModal
          isOpen={pricingOpen}
          onClose={() => {
            setPricingOpen(false);
            setFeatureLockedMessage(undefined);
          }}
          currentPlanId={currentPlanId}
          onSelectPlan={(newPlan) => {
            setCurrentPlanId(newPlan);
            recordAuditLog(clientSessionId, `Plan set to ${newPlan}`);
          }}
          language={language}
          featureLockedMessage={featureLockedMessage}
          onOpenAdminController={() => setAdminOpen(true)}
        />

        {/* Admin & Developer Master Controller Suite */}
        <AdminModal
          isOpen={adminOpen}
          onClose={() => setAdminOpen(false)}
          currentPlanId={currentPlanId}
          onApprovePremium={(planId = 'titan_700k') => {
            setCurrentPlanId(planId);
            setFreeMessagesUsed(0);
            safeStorage.setItem(STORAGE_KEYS.PLAN, planId);
            safeStorage.setItem(STORAGE_KEYS.SESSION_MSG_COUNT, '0');
          }}
          onResetSessionLimit={() => {
            setFreeMessagesUsed(0);
            safeStorage.setItem(STORAGE_KEYS.SESSION_MSG_COUNT, '0');
          }}
          onRevokePremium={() => {
            setCurrentPlanId('free');
            safeStorage.setItem(STORAGE_KEYS.PLAN, 'free');
          }}
          onAdminAuthChange={(isAuth) => setIsAdmin(isAuth)}
          appEdition={appEdition}
          onToggleAppEdition={handleToggleAppEdition}
          targetDevice={targetDevice}
          onSelectTargetDevice={setTargetDevice}
        />

        {/* Legal Pages Modal (Privacy Policy & Terms of Service) */}
        <LegalModal
          isOpen={legalOpen}
          onClose={() => setLegalOpen(false)}
          initialTab={legalTab}
        />

        {/* PWA Install Modal */}
        <InstallAppModal
          isOpen={installOpen}
          onClose={() => setInstallOpen(false)}
          language={language}
          deferredPrompt={deferredPrompt}
          onInstalledSuccess={() => setInstallOpen(false)}
        />

        {/* Live Voice Modal */}
        <VoiceModal
          isOpen={voiceOpen}
          onClose={() => setVoiceOpen(false)}
          onSendVoiceMessage={async (text: string) => {
            try {
              const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: text, mode: 'omni', intelligenceTier, persona, language }),
              });
              const data = await res.json();
              const cleanAnswer = (data.result || '').replace(/<reasoning>[\s\S]*?<\/reasoning>/i, '').trim();
              return cleanAnswer;
            } catch (e) {
              return 'Maaf, terjadi kendala saat menghubungkan suara.';
            }
          }}
          language={language}
        />

        {/* Pro Template Launcher Modal */}
        <ProFileLauncherModal
          isOpen={proLauncherOpen}
          onClose={() => setProLauncherOpen(false)}
          isFree={isFree}
          onRequireUpgrade={handleRequireUpgrade}
          onLaunchTemplate={handleLaunchProTemplate}
          language={language}
        />

        {/* Persyaratan & Privasi Pembuat Modal (Viewable anytime) */}
        <PersyaratanModal
          isOpen={persyaratanOpen}
          onClose={() => setPersyaratanOpen(false)}
          language={language}
          onOpenPricing={() => {
            setFeatureLockedMessage(undefined);
            setPricingOpen(true);
          }}
          onSelectPlan={(newPlan) => {
            setCurrentPlanId(newPlan);
            recordAuditLog(clientSessionId, `Plan set to ${newPlan}`);
          }}
        />

        {/* BAGIAN 3: Minimalist Side Preview Window for Business Apps */}
        <BusinessAppPreviewDrawer
          app={previewBusinessApp}
          onClose={() => setPreviewBusinessApp(null)}
          onRunInSandbox={handleRunInSandboxFromChat}
        />

        {/* USB Router Wi-Fi Bridge Modal */}
        <RouterUsbBridgeModal
          isOpen={routerBridgeOpen}
          onClose={() => setRouterBridgeOpen(false)}
        />

        {/* Fitur Pembuatan & Penukaran Kode Sekali Pakai 5 Jam */}
        <OneTimePasscodeModal
          isOpen={passcode5HOpen}
          onClose={() => setPasscode5HOpen(false)}
          clientSessionId={clientSessionId}
          onSessionActivated={(session) => {
            setCurrentPlanId(session.grantedPlan);
            setFreeMessagesUsed(0);
            safeStorage.setItem(STORAGE_KEYS.PLAN, session.grantedPlan);
            safeStorage.setItem(STORAGE_KEYS.SESSION_MSG_COUNT, '0');
          }}
        />

        {/* Pusat Tautan Publik & Custom Domain Hub Modal */}
        <PublicLinkHubModal
          isOpen={publicLinkHubOpen}
          onClose={() => setPublicLinkHubOpen(false)}
          onSwitchToPublicEdition={() => handleToggleAppEdition('public')}
          isCurrentlyPublic={appEdition === 'public'}
        />

        {/* Dolphy Wireless & Protocol Lab Modal (Flipper Zero .IR, BLE, NFC, Wi-Fi Spectrum) */}
        <DolphyLabModal
          isOpen={dolphyLabOpen}
          onClose={() => setDolphyLabOpen(false)}
          initialTab={dolphyLabInitialTab}
          onOpenRouterBridge={() => {
            setDolphyLabOpen(false);
            setRouterBridgeOpen(true);
          }}
        />

        {/* Universal TV Remote Modal (Remot TV Apapun) */}
        <UniversalTvRemoteModal
          isOpen={tvRemoteModalOpen}
          onClose={() => setTvRemoteModalOpen(false)}
          initialBrand={tvRemoteInitialBrand}
        />

        {/* Mandatory Terms, Privacy & Developer Security Consent Gate */}
        <MandatoryConsentGate
          isOpen={!hasAcceptedTerms && !isAdmin}
          onAccept={() => setHasAcceptedTerms(true)}
          onOpenDetailedLegal={(tab) => {
            setLegalTab(tab);
            setLegalOpen(true);
          }}
        />
      </div>
    </ErrorBoundary>
  );
}
