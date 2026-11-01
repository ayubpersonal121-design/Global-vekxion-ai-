import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Image as ImageIcon, 
  Camera,
  Video, 
  SlidersHorizontal, 
  ShieldCheck, 
  ChevronDown, 
  Check, 
  Sparkles,
  Lock,
  Layers,
  Clock,
  Film,
  Link2,
  Smartphone,
  Monitor,
  Download,
  X,
  Globe,
  ExternalLink
} from 'lucide-react';

export type MediaMode = 'chat' | 'image' | 'video';

export interface PresetsConfig {
  aspectRatio: '1:1' | '16:9' | '9:16';
  resolution: '2K' | '4K';
  framerate: '30fps' | '60fps';
  videoDuration: string;
}

export const VIDEO_DURATIONS = [
  '5 Detik (Cepat)',
  '10 Detik (Sinematik)',
  '5 Menit',
  '7 Menit',
  '9 Menit',
  '11 Menit',
  '15 Menit',
  '20 Menit',
  '30 Menit',
  '1 Jam'
];

interface CapsuleChatInputProps {
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
  isFree?: boolean;
  freeMessagesUsed?: number;
  freeMessageLimit?: number;
  onRequireUpgrade?: (reason: string) => void;
  language?: 'id' | 'en';
  onAutoInstall?: () => void;
  isInstalled?: boolean;
}

export const CapsuleChatInput: React.FC<CapsuleChatInputProps> = ({
  onSendMessage,
  isLoading,
  isFree = false,
  freeMessagesUsed = 0,
  freeMessageLimit = 3,
  onRequireUpgrade,
  language = 'id',
  onAutoInstall,
  isInstalled = false
}) => {
  const isId = language === 'id';
  const [input, setInput] = useState('');

  // 1. Media Selector: 'chat' (default), 'image' (buat gambar), 'video' (buat video)
  const [mediaMode, setMediaMode] = useState<MediaMode>('chat');

  // 2. Quality & Video Presets Popover
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [presets, setPresets] = useState<PresetsConfig>({
    aspectRatio: '16:9',
    resolution: '2K',
    framerate: '60fps',
    videoDuration: '5 Detik (Cepat)'
  });

  // 3. BUTTON 3 State: Cyber Mode (BlackArch Suite)
  const [cyberMode, setCyberMode] = useState(false);

  // 4. Physical Attachment States: Foto, Video, Link
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedVideoName, setSelectedVideoName] = useState<string | null>(null);
  const [attachedLink, setAttachedLink] = useState<{ url: string; title?: string } | null>(null);

  // Link Dialog State
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkInputUrl, setLinkInputUrl] = useState('');
  const [linkInputTitle, setLinkInputTitle] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const linkDialogRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsPresetsOpen(false);
      }
      if (linkDialogRef.current && !linkDialogRef.current.contains(e.target as Node)) {
        setIsLinkDialogOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleToggleImageMode = () => {
    setMediaMode(prev => prev === 'image' ? 'chat' : 'image');
  };

  const handleToggleVideoMode = () => {
    setMediaMode(prev => prev === 'video' ? 'chat' : 'video');
  };

  const handleCyberModeToggle = () => {
    if (isFree && !cyberMode) {
      onRequireUpgrade?.('Akses Language-Driven BlackArch Cyber Suite (Aircrack-ng, Hydra, Sherlock, Network Scanner) adalah fitur eksklusif paket TITAN.');
      return;
    }
    setCyberMode(!cyberMode);
  };

  const handleSelectDuration = (duration: string) => {
    setPresets(p => ({ ...p, videoDuration: duration }));
  };

  const handleSelectResolution = (res: '2K' | '4K') => {
    setPresets(p => ({ ...p, resolution: res }));
  };

  const handleSelectFramerate = (fps: '30fps' | '60fps') => {
    setPresets(p => ({ ...p, framerate: fps }));
  };

  // Photo File Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setSelectedPhoto(base64);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to read photo:', err);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Video File Handler
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setSelectedVideoName(file.name);
      // For fast client-side handling, create object URL or read as base64
      const objectUrl = URL.createObjectURL(file);
      setSelectedVideo(objectUrl);
    } catch (err) {
      console.error('Failed to read video:', err);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Attach Link Handler
  const handleAttachLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkInputUrl.trim()) return;

    let formattedUrl = linkInputUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    setAttachedLink({
      url: formattedUrl,
      title: linkInputTitle.trim() || undefined
    });
    setLinkInputUrl('');
    setLinkInputTitle('');
    setIsLinkDialogOpen(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    const hasAttachments = selectedPhoto || selectedVideo || attachedLink;

    if ((!trimmed && !hasAttachments) || isLoading) return;

    if (isFree && freeMessagesUsed >= freeMessageLimit) {
      onRequireUpgrade?.(`Batas ${freeMessageLimit} pesan sesi gratis tercapai. Tingkatkan ke Premium untuk obrolan tanpa batas.`);
      return;
    }

    // Default message text if user only uploaded an attachment
    let messageContent = trimmed;
    if (!messageContent) {
      if (attachedLink) {
        messageContent = `Tautan terlampir: ${attachedLink.url}${attachedLink.title ? ` (${attachedLink.title})` : ''}`;
      } else if (selectedVideo) {
        messageContent = `Video terlampir: ${selectedVideoName || 'Video Lampiran'}`;
      } else if (selectedPhoto) {
        messageContent = 'Foto terlampir untuk dianalisis.';
      }
    }

    onSendMessage(messageContent, {
      image: selectedPhoto || undefined,
      video: selectedVideo || undefined,
      videoName: selectedVideoName || undefined,
      link: attachedLink || undefined,
      mediaMode: mediaMode === 'chat' ? undefined : mediaMode,
      presets,
      cyberMode
    });

    // Reset fields
    setInput('');
    setSelectedPhoto(null);
    setSelectedVideo(null);
    setSelectedVideoName(null);
    setAttachedLink(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="sticky bottom-0 z-30 px-3 pt-2 pb-3 sm:px-4 sm:pb-4 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/95 to-transparent">
      <div className="max-w-3xl mx-auto w-full relative">

        {/* =========================================================================
            BARIS TOMBOL FISIK (FOTO, VIDEO, LINK, & AUTO-INSTALL HP OTOMATIS)
            Memenuhi instruksi User: "Tambahkan tombol fisik juga di bagian kolom chat
            untuk mengirimkan foto, video/link. Ubah/tambahkan tombol fisik yang bisa
            ditekan dan aplikasi ai otomatis ter install di Handphone tanpa manual!"
            ========================================================================= */}
        <div className="flex items-center justify-between gap-1.5 mb-2 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Hidden file inputs */}
            <input 
              ref={photoInputRef}
              type="file" 
              accept="image/*" 
              onChange={handlePhotoUpload} 
              className="hidden" 
            />
            <input 
              ref={videoInputRef}
              type="file" 
              accept="video/*" 
              onChange={handleVideoUpload} 
              className="hidden" 
            />

            {/* Tombol Fisik 1: Kirim Foto */}
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181926] hover:bg-[#222436] border border-cyan-500/40 hover:border-cyan-400 text-xs font-semibold text-cyan-200 transition-all cursor-pointer shadow-md active:scale-95 group"
              title="Kirim Foto / Gambar"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>Foto</span>
            </button>

            {/* Tombol Fisik 2: Kirim Video */}
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181926] hover:bg-[#222436] border border-purple-500/40 hover:border-purple-400 text-xs font-semibold text-purple-200 transition-all cursor-pointer shadow-md active:scale-95 group"
              title="Kirim Video"
            >
              <Video className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span>Video</span>
            </button>

            {/* Tombol Fisik 3: Sisipkan Link */}
            <button
              type="button"
              onClick={() => setIsLinkDialogOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181926] hover:bg-[#222436] border border-amber-500/40 hover:border-amber-400 text-xs font-semibold text-amber-200 transition-all cursor-pointer shadow-md active:scale-95 group"
              title="Kirim atau Tautkan Link"
            >
              <Link2 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Link</span>
            </button>
          </div>

          {/* Tombol Fisik 4: AUTO-INSTALL APLIKASI DI HANDPHONE & WINDOWS */}
          <div className="shrink-0 flex items-center gap-1.5">
            <button
              type="button"
              onClick={onAutoInstall}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white text-xs font-extrabold border border-emerald-400 shadow-lg shadow-emerald-950/60 active:scale-95 transition-all cursor-pointer animate-pulse"
              title="Pasang aplikasi VEXION AI otomatis di Handphone atau Komputer Windows Anda"
            >
              <Smartphone className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Install di HP / Windows</span>
              <span className="sm:hidden">Install di HP</span>
            </button>
          </div>
        </div>

        {/* DIALOG SISIPKAN LINK / URL */}
        {isLinkDialogOpen && (
          <div 
            ref={linkDialogRef}
            className="absolute bottom-full mb-3 left-0 sm:left-12 z-50 w-80 sm:w-96 p-4 rounded-2xl bg-[#141520] border border-amber-500/50 shadow-2xl shadow-black/80 text-xs text-neutral-200 animate-in slide-in-from-bottom-2"
          >
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Globe className="w-4 h-4" />
                <span>Sisipkan Link / URL Web</span>
              </div>
              <button 
                onClick={() => setIsLinkDialogOpen(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAttachLinkSubmit} className="space-y-2.5">
              <div>
                <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                  URL Tautan (Website / Portofolio / Berita / Video):
                </label>
                <input
                  type="text"
                  value={linkInputUrl}
                  onChange={(e) => setLinkInputUrl(e.target.value)}
                  placeholder="https://example.com/artikel-atau-produk"
                  className="w-full bg-[#1b1c2b] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                  Catatan atau Judul Link (Opsional):
                </label>
                <input
                  type="text"
                  value={linkInputTitle}
                  onChange={(e) => setLinkInputTitle(e.target.value)}
                  placeholder="Contoh: Landing Page Klien, Referensi Iklan, dsb."
                  className="w-full bg-[#1b1c2b] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsLinkDialogOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!linkInputUrl.trim()}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold transition-all cursor-pointer shadow-md"
                >
                  Lampirkan Link
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ACTIVE ATTACHMENTS PREVIEW BAR */}
        {(selectedPhoto || selectedVideo || attachedLink) && (
          <div className="flex items-center gap-2 mb-2 flex-wrap animate-in fade-in">
            {/* Foto Preview */}
            {selectedPhoto && (
              <div className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-[#1b1c2b] border border-cyan-500/50 shadow-md">
                <img src={selectedPhoto} alt="Foto Preview" className="w-8 h-8 rounded-lg object-cover" />
                <span className="text-[11px] font-semibold text-cyan-300">Foto Siap Dikirim</span>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="p-1 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Video Preview */}
            {selectedVideo && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#1b1c2b] border border-purple-500/50 shadow-md">
                <Video className="w-4 h-4 text-purple-400" />
                <span className="text-[11px] font-semibold text-purple-300 truncate max-w-[150px]">
                  {selectedVideoName || 'Video Terlampir'}
                </span>
                <button
                  onClick={() => {
                    setSelectedVideo(null);
                    setSelectedVideoName(null);
                  }}
                  className="p-1 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Link Preview */}
            {attachedLink && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#1b1c2b] border border-amber-500/50 shadow-md">
                <Link2 className="w-4 h-4 text-amber-400" />
                <div className="text-[11px] leading-tight">
                  <span className="font-semibold text-amber-300 truncate max-w-[150px] block">
                    {attachedLink.title || attachedLink.url}
                  </span>
                </div>
                <button
                  onClick={() => setAttachedLink(null)}
                  className="p-1 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* PRESETS SETTINGS POPOVER MENU (BUTTON 2 POPOVER) */}
        {isPresetsOpen && (
          <div 
            ref={popoverRef}
            className="absolute bottom-full mb-3 left-0 sm:left-4 z-50 w-80 p-4 rounded-2xl bg-[#141520] border border-cyan-500/40 shadow-2xl shadow-cyan-950/60 text-xs text-slate-100 font-sans animate-in slide-in-from-bottom-3"
          >
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-neutral-800">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Quality & Video Presets</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400 uppercase">
                {mediaMode.toUpperCase()} MODE
              </span>
            </div>

            {/* 1. Aspect Ratio */}
            <div className="mb-3 space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-400 block">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['1:1', '16:9', '9:16'] as const).map(ratio => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setPresets(p => ({ ...p, aspectRatio: ratio }))}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                      presets.aspectRatio === ratio
                        ? 'bg-cyan-500 text-black border-cyan-400 shadow-md'
                        : 'bg-[#1b1c2b] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Output Resolution & Framerate */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="text-[11px] font-semibold text-neutral-400 block mb-1">Resolution</label>
                <div className="grid grid-cols-2 gap-1">
                  {(['2K', '4K'] as const).map(res => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => handleSelectResolution(res)}
                      className={`py-1 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                        presets.resolution === res
                          ? 'bg-cyan-500 text-black border-cyan-400'
                          : 'bg-[#1b1c2b] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-400 block mb-1">Framerate</label>
                <div className="grid grid-cols-2 gap-1">
                  {(['30fps', '60fps'] as const).map(fps => (
                    <button
                      key={fps}
                      type="button"
                      onClick={() => handleSelectFramerate(fps)}
                      className={`py-1 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                        presets.framerate === fps
                          ? 'bg-cyan-500 text-black border-cyan-400'
                          : 'bg-[#1b1c2b] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      {fps}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Video Duration Dropdown (Exact Specifications) */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-400 flex items-center justify-between">
                <span>Video Duration</span>
                <span className="text-[9px] text-cyan-400">Semua Durasi Terbuka</span>
              </label>
              <div className="relative">
                <select
                  value={presets.videoDuration}
                  onChange={(e) => handleSelectDuration(e.target.value)}
                  className="w-full bg-[#1b1c2b] border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {VIDEO_DURATIONS.map(duration => (
                    <option key={duration} value={duration} className="bg-[#141520] text-white">
                      {duration}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-500">
              <span>{presets.aspectRatio} · {presets.resolution} @ {presets.framerate}</span>
              <button
                type="button"
                onClick={() => setIsPresetsOpen(false)}
                className="text-cyan-400 hover:underline font-bold cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        )}

        {/* PILL-SHAPED CAPSULE CHAT INPUT CONTAINER */}
        <form
          onSubmit={handleSubmit}
          className={`rounded-full bg-[#151620] border transition-all duration-300 shadow-2xl flex items-center px-3 py-1.5 sm:px-4 sm:py-2 gap-2 ${
            cyberMode
              ? 'border-emerald-500/60 ring-2 ring-emerald-500/20 shadow-emerald-950/40'
              : 'border-neutral-800 focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/20'
          }`}
        >
          {/* ================= INLINE UTILITY BUTTONS ================= */}
          <div className="flex items-center gap-1 shrink-0">
            
            {/* BUTTON 1: IMAGE GENERATION MODE TOGGLE */}
            <button
              type="button"
              onClick={handleToggleImageMode}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                mediaMode === 'image'
                  ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-400/50'
                  : 'bg-neutral-800/80 text-neutral-300 border-neutral-700/60 hover:text-cyan-300 hover:bg-neutral-700'
              }`}
              title={mediaMode === 'image' ? 'Mode Gambar Aktif (Klik untuk matikan)' : 'Aktifkan Mode Buat Gambar Ultra-HD'}
            >
              <ImageIcon className={`w-3.5 h-3.5 ${mediaMode === 'image' ? 'text-cyan-300' : 'text-cyan-400'}`} />
              <span className="hidden sm:inline">{mediaMode === 'image' ? 'Gambar (ON)' : 'Gambar'}</span>
            </button>

            {/* BUTTON 2: VIDEO GENERATION MODE TOGGLE */}
            <button
              type="button"
              onClick={handleToggleVideoMode}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                mediaMode === 'video'
                  ? 'bg-purple-600/35 text-purple-200 border-purple-400 shadow-md shadow-purple-950/40 ring-1 ring-purple-400/50'
                  : 'bg-neutral-800/80 text-neutral-300 border-neutral-700/60 hover:text-purple-300 hover:bg-neutral-700'
              }`}
              title={mediaMode === 'video' ? 'Mode Video Aktif (Klik untuk matikan)' : 'Aktifkan Mode Buat Video Sinematik 60fps'}
            >
              <Film className={`w-3.5 h-3.5 ${mediaMode === 'video' ? 'text-purple-300' : 'text-purple-400'}`} />
              <span className="hidden sm:inline">{mediaMode === 'video' ? 'Video (ON)' : 'Video'}</span>
            </button>

            {/* BUTTON 3: QUALITY & VIDEO PRESETS POPOVER TOGGLE */}
            <button
              type="button"
              onClick={() => setIsPresetsOpen(!isPresetsOpen)}
              className={`p-2 rounded-full transition-all cursor-pointer border ${
                isPresetsOpen
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/30'
                  : 'bg-neutral-800/80 text-neutral-300 border-neutral-700/60 hover:text-cyan-300 hover:bg-neutral-700'
              }`}
              title="Preset Kualitas & Format (Rasio, Resolusi 2K/4K, 30/60fps, Durasi)"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* BUTTON 4: GLOWING CYBER MODE TOGGLE SWITCH */}
            <button
              type="button"
              onClick={handleCyberModeToggle}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                cyberMode
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500 shadow-lg shadow-emerald-500/20 animate-pulse'
                  : 'bg-neutral-800/80 text-neutral-400 border-neutral-700/60 hover:text-emerald-400 hover:bg-neutral-700'
              }`}
              title={cyberMode ? 'Cyber Mode Aktif (BlackArch Suite Language-Driven)' : 'Aktifkan Cyber Mode (BlackArch Suite)'}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${cyberMode ? 'text-emerald-400' : 'text-neutral-400'}`} />
              <span className="hidden md:inline">Cyber Mode</span>
              {cyberMode && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>}
            </button>
          </div>

          {/* DIVIDER */}
          <div className="h-5 w-px bg-neutral-800 shrink-0 mx-0.5"></div>

          {/* INPUT TEXTAREA */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              cyberMode
                ? (isId ? 'Cyber Mode: Ketik instruksi audit wifi, tes password, atau scan port...' : 'Cyber Mode: Type security audit, wifi scan, or OSINT prompt...')
                : mediaMode === 'image'
                ? (isId ? `🎨 Mode Gambar (${presets.aspectRatio}): Ketik deskripsi gambar untuk dirender...` : `🎨 Image Mode (${presets.aspectRatio}): Describe image to render...`)
                : mediaMode === 'video'
                ? (isId ? `🎬 Mode Video (${presets.aspectRatio}, ${presets.videoDuration}): Ketik adegan/skenario video...` : `🎬 Video Mode (${presets.aspectRatio}, ${presets.videoDuration}): Describe video scenario...`)
                : (isId ? 'Tanyakan apa pun, buatkan game, aplikasi, website, gambar, atau video...' : 'Ask anything, create games, apps, websites, images, or videos...')
            }
            rows={1}
            className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none resize-none py-1.5 max-h-32"
          />

          {/* SEND BUTTON */}
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !selectedPhoto && !selectedVideo && !attachedLink)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              input.trim() || selectedPhoto || selectedVideo || attachedLink
                ? cyberMode 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 font-bold'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-black shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 font-bold'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-50'
            }`}
            title="Kirim Pesan"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
