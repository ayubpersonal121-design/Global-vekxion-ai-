import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Image as ImageIcon, 
  Mic, 
  MicOff, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Play, 
  RotateCcw, 
  BrainCircuit, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Loader2,
  Lock,
  ArrowRight,
  TrendingUp,
  Layout,
  Target,
  BarChart3,
  Megaphone,
  Code2,
  Download,
  Wifi,
  Video,
  Link2,
  ExternalLink
} from 'lucide-react';
import { ChatMessage, BusinessAppOutput } from '../types';
import { LivePreviewSandbox } from './LivePreviewSandbox';
import { BlackArchTerminalCard } from './BlackArchTerminalCard';
import { DolphyProtocolCard } from './DolphyProtocolCard';
import { UniversalTvRemoteCard } from './UniversalTvRemoteCard';
import { CapsuleChatInput, MediaMode, PresetsConfig } from './CapsuleChatInput';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (
    content: string, 
    options?: {
      image?: string;
      video?: string;
      videoName?: string;
      link?: { url: string; title?: string };
      mediaMode?: MediaMode;
      presets?: PresetsConfig;
      cyberMode?: boolean;
    }
  ) => void;
  isLoading: boolean;
  onRunInSandbox: (htmlCode: string, title?: string) => void;
  onOpenPricing: () => void;
  onOpenVoice?: () => void;
  onOpenProLauncher?: () => void;
  onOpenBusinessAppPreview?: (app: BusinessAppOutput) => void;
  onOpenInstall?: () => void;
  onOpenDolphyLab?: (initialTab?: string) => void;
  onOpenTvRemoteModal?: (initialBrand?: string) => void;
  deferredPrompt?: any;
  language: 'id' | 'en';
  isFree?: boolean;
  isArgonUnlocked?: boolean;
  isAdmin?: boolean;
  freeMessagesUsed?: number;
  freeMessageLimit?: number;
  onRequireUpgrade?: (message: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onRunInSandbox,
  onOpenPricing,
  onOpenVoice,
  onOpenProLauncher,
  onOpenBusinessAppPreview,
  onOpenInstall,
  onOpenDolphyLab,
  onOpenTvRemoteModal,
  deferredPrompt,
  language,
  isFree = false,
  isArgonUnlocked = false,
  isAdmin = false,
  freeMessagesUsed = 0,
  freeMessageLimit = 3,
  onRequireUpgrade,
}) => {
  const isId = language !== 'en';
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Speech Recognition hook
  useEffect(() => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = isId ? 'id-ID' : 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results?.[0]?.[0]?.transcript || '';
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsRecording(false);
        };

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognitionRef.current = recognition;
      }
    } catch (e) {
      console.warn('Speech recognition not available:', e);
    }
  }, [isId]);

  const toggleVoiceRecording = () => {
    try {
      if (isFree && freeMessagesUsed >= freeMessageLimit) {
        onRequireUpgrade?.('Batas 3 pesan sesi gratis tercapai. Buka akun Premium untuk obrolan suara tanpa batas!');
        return;
      }

      if (!recognitionRef.current) {
        alert(isId ? 'Browser ini belum mendukung input suara dikte.' : 'Speech recognition not supported in this browser.');
        return;
      }

      if (isRecording) {
        recognitionRef.current.stop();
        setIsRecording(false);
      } else {
        recognitionRef.current.start();
        setIsRecording(true);
      }
    } catch (e) {
      setIsRecording(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch (e) {
      console.error('Failed to read image:', e);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if ((!trimmed && !selectedImage) || isLoading) return;

    // Strict Paywall enforcement: Free users get 3-message limit per session
    if (isFree && freeMessagesUsed >= freeMessageLimit) {
      onRequireUpgrade?.(`Batas ${freeMessageLimit} pesan sesi gratis tercapai. Tingkatkan ke Premium untuk obrolan dan fitur tanpa batas.`);
      return;
    }

    onSendMessage(trimmed, { image: selectedImage || undefined });
    setInput('');
    setSelectedImage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleReasoning = (msgId: string) => {
    setExpandedReasoning((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const handleCopy = (text: string, id: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const handleSpeak = (text: string, msgId: string) => {
    try {
      if (isFree) {
        onRequireUpgrade?.(isId ? 'Fitur Text-to-Speech tanpa batas memerlukan akun Premium.' : 'Unlimited Text-to-Speech requires a Premium account.');
        return;
      }
      if (speakingMessageId === msgId) {
        window.speechSynthesis.cancel();
        setSpeakingMessageId(null);
      } else {
        window.speechSynthesis.cancel();
        const clean = text.replace(/[#*`_\[\]()]/g, '').slice(0, 800);
        const utter = new SpeechSynthesisUtterance(clean);
        utter.lang = isId ? 'id-ID' : 'en-US';
        utter.onend = () => setSpeakingMessageId(null);
        utter.onerror = () => setSpeakingMessageId(null);
        window.speechSynthesis.speak(utter);
        setSpeakingMessageId(msgId);
      }
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  // 4 Actionable preview cards highlighting AI Argon Ultra-HD & No-Code Business Builder
  const previewCards = [
    {
      title: isId ? 'Game Snake Canvas' : 'Playable Canvas Snake Game',
      description: isId 
        ? 'Buatkan saya game snake canvas interaktif yang bisa langsung dimainkan di layar ini.'
        : 'Create a playable canvas snake mini-game with score tracking.',
      icon: <Play className="w-4 h-4 text-emerald-400" />,
      tag: 'Game Engine'
    },
    {
      title: isId ? 'Website Landing Page' : 'Landing Page Website',
      description: isId 
        ? 'Buatkan landing page website modern untuk produk bisnis saya dengan hero section dan pricing.'
        : 'Create a modern landing page website with responsive hero and pricing grid.',
      icon: <Layout className="w-4 h-4 text-sky-400" />,
      tag: 'Web Synthesis'
    },
    {
      title: isId ? 'Audit & Scanning Wi-Fi' : 'Scan & Audit Wi-Fi',
      description: isId 
        ? 'Scan wifi dan lakukan audit keamanan jaringan nirkabel sekitar, sinyal dBm, dan enkripsi router.'
        : 'Scan nearby Wi-Fi networks, signal strength dBm, and wireless router encryption audit.',
      icon: <Wifi className="w-4 h-4 text-cyan-400" />,
      tag: 'Wireless Tool'
    },
    {
      title: isId ? 'Sistem Kasir & POS Bisnis' : 'Business POS Cashier System',
      description: isId 
        ? 'Buatkan aplikasi bisnis sistem kasir POS lengkap dengan kasir, kalkulasi otomatis, dan cetak struk penjualan.'
        : 'Build a complete Point of Sale cashier business application with automated checkout.',
      icon: <Code2 className="w-4 h-4 text-indigo-400" />,
      tag: 'App Generator'
    },
    {
      title: isId ? 'Engine Gambar Ultra-HD' : 'Ultra-HD Visual Engine',
      description: isId 
        ? 'Buatkan gambar mobil sport futuristik ultra-hd dengan pencahayaan sinematik dan detail mikro 8K di jalanan malam kota.'
        : 'Generate an ultra-hd futuristic sports car image with cinematic lighting and micro-details.',
      icon: <ImageIcon className="w-4 h-4 text-purple-400" />,
      tag: 'Visual AI'
    },
    {
      title: isId ? 'Strategi ROAS & Copywriting' : 'ROAS & High-Converting Copy',
      description: isId 
        ? 'Buatkan strategi copy iklan Meta & Google Ads dengan headline memikat dan formula alokasi budget ROAS 4.5x.'
        : 'Formulate high-converting ad copy and multi-channel budget allocation.',
      icon: <Megaphone className="w-4 h-4 text-pink-400" />,
      tag: 'Marketing AI'
    },
  ];

  const handlePreviewCardClick = (promptText: string) => {
    if (isFree && freeMessagesUsed >= freeMessageLimit) {
      onRequireUpgrade?.(`Batas ${freeMessageLimit} pesan sesi gratis tercapai. Tingkatkan ke Premium untuk mencoba template ini.`);
      return;
    }
    onSendMessage(promptText);
  };

  // Safe formatting helper
  const renderMessageContent = (content: string) => {
    try {
      const codeBlockRegex = /```([a-zA-Z0-9_\-+]*)\n([\s\S]*?)```/g;
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = codeBlockRegex.exec(content)) !== null) {
        const textBefore = content.substring(lastIndex, match.index);
        if (textBefore) {
          parts.push(
            <div key={`text-${lastIndex}`} className="whitespace-pre-wrap leading-relaxed text-sm text-neutral-200">
              {formatMarkdown(textBefore)}
            </div>
          );
        }

        const lang = (match[1] || 'code').toLowerCase();
        const code = match[2];
        const isHtml = ['html', 'htm'].includes(lang) || code.includes('<!DOCTYPE') || code.includes('<html');

        parts.push(
          <div key={`code-${match.index}`} className="my-3 rounded-xl overflow-hidden border border-neutral-800 bg-[#121212] shadow-md">
            <div className="px-3.5 py-2 bg-[#1c1c1c] border-b border-neutral-800 flex items-center justify-between text-xs">
              <span className="font-mono text-sky-300 font-semibold uppercase text-[11px]">{lang}</span>
              <div className="flex items-center gap-2">
                {isHtml && (
                  <button
                    onClick={() => onRunInSandbox(code, 'Aplikasi / Banner Iklan')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-[11px] transition-colors shadow-sm cursor-pointer"
                    title="Jalankan di Live Sandbox"
                  >
                    <Play className="w-3 h-3" />
                    <span>Live Sandbox</span>
                  </button>
                )}
                <button
                  onClick={() => handleCopy(code, `code-${match?.index}`)}
                  className="flex items-center gap-1 text-neutral-400 hover:text-white px-2 py-1 rounded hover:bg-neutral-800 transition-colors text-[11px] cursor-pointer"
                >
                  {copiedId === `code-${match.index}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === `code-${match.index}` ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>
            <pre className="p-3.5 overflow-x-auto text-xs font-mono text-neutral-200 leading-relaxed bg-[#0d0d0d]">
              <code>{code}</code>
            </pre>
          </div>
        );

        lastIndex = match.index + match[0].length;
      }

      const remainingText = content.substring(lastIndex);
      if (remainingText) {
        parts.push(
          <div key={`text-final`} className="whitespace-pre-wrap leading-relaxed text-sm text-neutral-200">
            {formatMarkdown(remainingText)}
          </div>
        );
      }

      return <div className="space-y-2">{parts}</div>;
    } catch (e) {
      return <p className="whitespace-pre-wrap text-sm text-neutral-200">{content}</p>;
    }
  };

  const formatMarkdown = (str: string) => {
    const lines = str.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-base font-bold text-sky-300 mt-2 mb-1">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-lg font-bold text-indigo-300 mt-3 mb-1.5">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-xl font-bold text-white mt-4 mb-2">{line.replace('# ', '')}</h1>;
      }
      return (
        <span key={idx} className="block">
          <span dangerouslySetInnerHTML={{
            __html: line
              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
              .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-[#202020] text-sky-300 font-mono text-xs border border-neutral-700">$1</code>')
          }} />
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0f0f0f] relative overflow-hidden">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
        {messages.length === 0 ? (
          /* Gemini Welcome State */
          <div className="h-full flex flex-col items-center justify-center text-center max-w-3xl mx-auto py-8 sm:py-14 space-y-8 animate-in fade-in duration-300">
            {/* Shimmering Gemini-Style Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight gemini-gradient-text leading-tight sm:leading-tight">
                {isId ? 'Halo, Selamat Datang di Global Pixel AI. Ada yang bisa saya bantu hari ini?' : "Hello, Welcome to Global Pixel AI. How can I help you today?"}
              </h1>
              <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto leading-relaxed">
                {isId 
                  ? 'Aplikasi AI publik cerdas menggabungkan Google Gemini & OpenAI ChatGPT untuk pembuatan simulasi aplikasi, game interaktif, website modern, strategi iklan konversi tinggi, dan audit jaringan Wi-Fi.'
                  : 'Your premier generative workspace combining Google Gemini cognitive reasoning and OpenAI ChatGPT conversational fluency for high-converting marketing, ad strategies, and interactive web synthesis.'}
              </p>
            </div>

            {/* 4 Actionable Prompt Preview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left pt-2">
              {previewCards.map((card, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePreviewCardClick(card.description)}
                  className="p-4 rounded-2xl bg-[#171717] hover:bg-[#1f1f1f] border border-neutral-800 hover:border-sky-500/40 transition-all duration-200 group flex flex-col justify-between cursor-pointer text-left shadow-lg hover:shadow-sky-500/5 hover:-translate-y-0.5"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#202020] border border-neutral-700/80 flex items-center justify-center group-hover:bg-sky-500/10 transition-colors">
                        {card.icon}
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                        {card.tag}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors mb-1">
                      {card.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400 leading-relaxed line-clamp-2">
                      {card.description}
                    </p>
                  </div>
                  <div className="pt-2 mt-2 border-t border-neutral-800/60 flex items-center justify-end text-[11px] text-sky-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span className="mr-1">Generate</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>

            {/* Free Tier Notice / Status Banner */}
            {isFree && (
              <div className="p-3 px-4 rounded-full bg-[#171717] border border-neutral-800 text-xs text-neutral-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span>
                  Free Session: <strong className="text-white">{freeMessagesUsed}/{freeMessageLimit}</strong> messages used
                </span>
                <button
                  onClick={onOpenPricing}
                  className="ml-2 text-sky-400 hover:underline font-semibold"
                >
                  Upgrade to Unlimited
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Active Chat Thread */
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const isReasoningOpen = expandedReasoning[msg.id] ?? false;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
                >
                  {/* AI Avatar */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-[#171717] border border-sky-500/30 p-[1px] shrink-0 mt-0.5 shadow-md flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-sky-400" />
                    </div>
                  )}

                  {/* Chat Bubbles: Strictly mapped to specifications
                      User: #2f2f2f
                      AI: transparent with gradient border
                  */}
                  <div
                    className={`p-4 sm:p-5 shadow-lg ${
                      isUser
                        ? 'bg-[#2f2f2f] text-neutral-100 rounded-2xl rounded-tr-sm max-w-[85%] sm:max-w-[75%]'
                        : 'bg-transparent border border-neutral-800 text-neutral-100 rounded-2xl rounded-tl-sm max-w-[92%] sm:max-w-[82%] relative [background:linear-gradient(#0f0f0f,#0f0f0f)_padding-box,linear-gradient(135deg,rgba(56,189,248,0.4),rgba(129,140,248,0.4),rgba(236,72,153,0.4))_border-box]'
                    }`}
                  >
                    {/* Model Badge */}
                    {!isUser && msg.modelBadge && (
                      <div className="flex items-center gap-1.5 mb-2.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-sky-500/20 to-indigo-500/20 border border-sky-500/30 w-fit text-[10px] font-bold text-sky-300">
                        <Sparkles className="w-3 h-3 text-sky-400" />
                        <span>{msg.modelBadge}</span>
                      </div>
                    )}

                    {/* User Attached Image */}
                    {msg.image && (
                      <div className="mb-3 max-w-sm rounded-xl overflow-hidden border border-white/20 shadow-md">
                        <img src={msg.image} alt="User attachment" className="max-h-60 w-auto object-cover" />
                      </div>
                    )}

                    {/* User Attached Video */}
                    {msg.video && (
                      <div className="mb-3 max-w-sm rounded-xl overflow-hidden border border-purple-500/40 bg-black/60 p-2 shadow-md">
                        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-purple-300">
                          <Video className="w-4 h-4 text-purple-400" />
                          <span className="truncate">{msg.videoName || 'Lampiran Video'}</span>
                        </div>
                        <video 
                          src={msg.video} 
                          controls 
                          className="w-full max-h-56 rounded-lg bg-black object-contain"
                        />
                      </div>
                    )}

                    {/* User Attached Link */}
                    {msg.link && (
                      <div className="mb-3 max-w-md rounded-xl border border-amber-500/40 bg-[#161722] p-3 shadow-md flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                            <Link2 className="w-4 h-4" />
                          </div>
                          <div className="truncate text-xs">
                            <span className="font-bold text-amber-300 block truncate">
                              {msg.link.title || 'Tautan Terlampir'}
                            </span>
                            <span className="font-mono text-[11px] text-neutral-400 truncate block">
                              {msg.link.url}
                            </span>
                          </div>
                        </div>
                        <a
                          href={msg.link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors shrink-0"
                          title="Buka Tautan"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}

                    {/* AI Cognitive Reasoning Accordion */}
                    {!isUser && msg.reasoning && (
                      <div className="mb-3 border-b border-neutral-800 pb-2.5">
                        <button
                          onClick={() => toggleReasoning(msg.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors py-1 cursor-pointer"
                        >
                          <BrainCircuit className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                          <span>Gemini Cognitive Reasoning Stream</span>
                          {isReasoningOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {isReasoningOpen && (
                          <div className="mt-2 p-3 rounded-xl bg-[#141414] border border-neutral-800 font-mono text-xs text-neutral-400 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                            {msg.reasoning}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Generating States */}
                    {!isUser && msg.isGeneratingImage && (
                      <div className="my-2 p-3.5 rounded-xl bg-neutral-900 border border-sky-500/40 flex items-center gap-3">
                        <Loader2 className="w-4 h-4 animate-spin text-sky-400 shrink-0" />
                        <span className="text-xs text-sky-300 font-medium">Merender visual Ultra-HD dengan pencahayaan sinematik & detail mikro...</span>
                      </div>
                    )}

                    {!isUser && msg.isGeneratingVideo && (
                      <div className="my-2 p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 flex items-center gap-3">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-400 shrink-0" />
                        <span className="text-xs text-purple-300 font-medium">AI Video Synthesizer sedang memproses rendering gerak sinematik 60fps...</span>
                      </div>
                    )}

                    {!isUser && msg.isGeneratingApp && (
                      <div className="my-2 p-3.5 rounded-xl bg-neutral-900 border border-indigo-500/40 flex items-center gap-3">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
                        <span className="text-xs text-indigo-300 font-medium">AI Argon sedang menyusun kode struktural & prototipe aplikasi bisnis...</span>
                      </div>
                    )}

                    {/* Message Body */}
                    <div>
                      {isUser ? (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                      ) : (
                        renderMessageContent(msg.content)
                      )}
                    </div>

                    {/* BAGIAN 3A: HASIL SINTESIS VIDEO AI DENGAN PEMUTAR VIDEO DAN OPSI UNDUH */}
                    {!isUser && msg.generatedVideo && (
                      <div className="mt-3.5 space-y-2.5 rounded-2xl overflow-hidden border border-purple-500/40 bg-gradient-to-b from-[#181528] to-[#0f0e1a] p-3 shadow-2xl">
                        <div className="flex items-center justify-between pb-1.5 px-1 border-b border-purple-900/40 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                            <span className="font-extrabold text-white flex items-center gap-1.5">
                              <Video className="w-4 h-4 text-purple-400" />
                              <span>AI Motion Video (Veo Engine)</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-purple-300">
                            <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800">
                              {msg.generatedVideo.resolution || '720p HD'}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-black/60 border border-neutral-800">
                              {msg.generatedVideo.fps || '60fps'}
                            </span>
                          </div>
                        </div>

                        {/* Native Video Player Container */}
                        <div className="relative group rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-purple-950">
                          {msg.generatedVideo.videoUrl ? (
                            <video
                              src={msg.generatedVideo.videoUrl}
                              controls
                              playsInline
                              loop
                              className="w-full h-full object-contain rounded-xl"
                            />
                          ) : (
                            <div className="text-xs text-neutral-400">Video sedang disiapkan...</div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center justify-between pt-1 px-1 gap-2">
                          <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            <span className="font-semibold text-neutral-300">Google Gemini Omni Flash / Veo Synthesizer</span>
                          </span>
                          {msg.generatedVideo.videoUrl && (
                            <a
                              href={msg.generatedVideo.videoUrl}
                              download={`AI_Video_${Date.now()}.mp4`}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Unduh Video (.mp4)</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* BAGIAN 3B: HASIL GAMBAR ULTRA-HD DALAM GELEMBUNG CHAT DENGAN OPSI UNDUH BERSIH */}
                    {!isUser && msg.generatedImage && (
                      <div className="mt-3.5 space-y-2 rounded-2xl overflow-hidden border border-neutral-700/80 bg-[#121212] p-2.5 shadow-2xl">
                        <div className="relative group rounded-xl overflow-hidden bg-black/80">
                          <img
                            src={msg.generatedImage}
                            alt="Visual Ultra-HD"
                            className="w-full max-h-[460px] object-contain rounded-xl transition-transform duration-300 group-hover:scale-[1.01]"
                          />
                          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-sky-300 border border-sky-500/40">
                            Ultra-HD · 8K Photorealistic
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1 px-1">
                          <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                            <span className="font-semibold text-neutral-300">AI Ultra-HD Image Engine</span>
                          </span>
                          <a
                            href={msg.generatedImage}
                            download={`AI_UltraHD_${Date.now()}.png`}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh Gambar Ultra-HD</span>
                          </a>
                        </div>
                      </div>
                    )}

                    {/* BAGIAN 3: HASIL APLIKASI BISNIS DALAM TAB PREVIEW / JENDELA KECIL DI SISI CHAT */}
                    {!isUser && msg.businessApp && (
                      <div className="mt-3.5 p-4 rounded-2xl border border-sky-500/30 bg-gradient-to-br from-[#171717] to-[#111111] space-y-3 shadow-xl">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-sky-950 text-sky-400 border border-sky-800 font-bold">
                                No-Code Builder
                              </span>
                              <h4 className="text-sm font-extrabold text-white">
                                {msg.businessApp.title}
                              </h4>
                            </div>
                            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                              {msg.businessApp.summary || 'Purwarupa aplikasi bisnis interaktif dengan kalkulasi otomatis dan data dinamis.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-800">
                          <button
                            onClick={() => onOpenBusinessAppPreview?.(msg.businessApp!)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-950/50 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                          >
                            <Layout className="w-3.5 h-3.5" />
                            <span>Buka Pratinjau Interaktif di Sisi Chat</span>
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(msg.businessApp!.html);
                              setCopiedId(`app_${msg.id}`);
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
                            className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            {copiedId === `app_${msg.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedId === `app_${msg.id}` ? 'Kode Tersalin' : 'Salin Kode HTML'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Conversational Live Preview Sandbox Container (Playable Games, Websites, Applications) */}
                    {!isUser && msg.sandboxItem && (
                      <div className="mt-3.5">
                        <LivePreviewSandbox item={msg.sandboxItem} />
                      </div>
                    )}

                    {/* BlackArch Cyber Mode Visual Terminal Simulation & Intelligence Matrix */}
                    {!isUser && msg.blackArchSimulation && (
                      <div className="mt-3.5">
                        <BlackArchTerminalCard simulation={msg.blackArchSimulation} />
                      </div>
                    )}

                    {/* Dolphy Cyber & Wireless Protocol Intelligence Card */}
                    {!isUser && msg.dolphySimulation && (
                      <div className="mt-3.5">
                        <DolphyProtocolCard 
                          simulation={msg.dolphySimulation} 
                          onOpenDolphyLab={onOpenDolphyLab}
                        />
                      </div>
                    )}

                    {/* Universal TV Remote Control Interactive Card (Remot TV Apapun) */}
                    {!isUser && msg.tvRemoteSimulation && (
                      <div className="mt-3.5">
                        <UniversalTvRemoteCard 
                          data={msg.tvRemoteSimulation}
                          onOpenFullRemoteModal={onOpenTvRemoteModal}
                        />
                      </div>
                    )}

                    {/* Assistant Message Actions */}
                    {!isUser && (
                      <div className="mt-3 pt-2 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-500">
                        <span className="text-[10px] font-mono text-neutral-500">
                          VEXION AI
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSpeak(msg.content, msg.id)}
                            className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                            title="Read Aloud"
                          >
                            {speakingMessageId === msg.id ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                            title="Copy text"
                          >
                            {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="max-w-4xl mx-auto flex items-center gap-3 text-xs text-sky-400 font-medium py-3">
            <div className="w-8 h-8 rounded-xl bg-[#171717] border border-sky-500/30 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
            </div>
            <span>VEXION AI is thinking and formulating response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* User Image Attachment Preview */}
      {selectedImage && (
        <div className="px-4 max-w-3xl mx-auto w-full mb-1">
          <div className="relative inline-block">
            <img src={selectedImage} alt="Attachment" className="h-16 w-16 object-cover rounded-xl border border-neutral-700 shadow-md" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-1.5 -right-1.5 p-1 bg-neutral-800 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* CAPSULE CHAT INPUT WITH PHYSICAL ATTACHMENT & UTILITY BUTTONS */}
      <CapsuleChatInput
        onSendMessage={(content, options) => {
          onSendMessage(content, {
            image: options?.image || selectedImage || undefined,
            video: options?.video,
            videoName: options?.videoName,
            link: options?.link,
            mediaMode: options?.mediaMode,
            presets: options?.presets,
            cyberMode: options?.cyberMode,
          });
          setSelectedImage(null);
        }}
        isLoading={isLoading}
        isFree={isFree}
        freeMessagesUsed={freeMessagesUsed}
        freeMessageLimit={freeMessageLimit}
        onRequireUpgrade={onRequireUpgrade}
        language={language}
        onAutoInstall={onOpenInstall}
      />
    </div>
  );
};
