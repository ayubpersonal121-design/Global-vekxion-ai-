import React, { useState } from 'react';
import { 
  X, 
  Tv, 
  Power, 
  Volume2, 
  VolumeX, 
  Volume1, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Home, 
  Menu, 
  Download, 
  Copy, 
  Check, 
  Wifi, 
  Radio, 
  Play, 
  Activity, 
  Cast, 
  Zap, 
  Sliders, 
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { 
  TV_BRANDS_DATABASE, 
  generateFlipperIrFile, 
  generateSingleCommandIr, 
  transmitTvCommand,
  openInDolphyApp,
  launchMiRemoteApp
} from '../utils/tvRemoteDatabase';
import { TvBrandProfile } from '../types';

interface UniversalTvRemoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBrand?: string;
}

export const UniversalTvRemoteModal: React.FC<UniversalTvRemoteModalProps> = ({
  isOpen,
  onClose,
  initialBrand = 'toshiba'
}) => {
  const [activeBrandId, setActiveBrandId] = useState<string>(initialBrand);
  const [remoteMode, setRemoteMode] = useState<'ir' | 'wifi' | 'file'>('ir');
  const [smartTvIp, setSmartTvIp] = useState('192.168.1.50');
  const [lastAction, setLastAction] = useState<string>('Standby - Siap memancarkan sinyal');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showNumpad, setShowNumpad] = useState(false);

  React.useEffect(() => {
    if (initialBrand && TV_BRANDS_DATABASE[initialBrand]) {
      setActiveBrandId(initialBrand);
    }
  }, [initialBrand, isOpen]);

  if (!isOpen) return null;

  const brandProfile: TvBrandProfile = TV_BRANDS_DATABASE[activeBrandId] || TV_BRANDS_DATABASE.toshiba;

  const handleSendCommand = (commandKey: string) => {
    const cmd = brandProfile.commands[commandKey];
    if (!cmd) return;

    setIsTransmitting(true);
    if (remoteMode === 'wifi') {
      setLastAction(`🟢 [Wi-Fi LAN Smart TV] Perintah [${cmd.name}] (${brandProfile.name}) dikirim ke IP ${smartTvIp}.`);
    } else {
      setLastAction(`🔴 [IR Blaster 38kHz] Perintah [${cmd.name}] (${brandProfile.name}) dipancarkan via Audio PWM & Dolphy .IR (${cmd.protocol} Addr [${cmd.address}] Cmd [${cmd.command}]).`);
    }

    // 1. Dispatch real network packet to backend
    fetch('/api/tv-remote/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brand: activeBrandId,
        command: commandKey,
        ip: smartTvIp,
        mode: remoteMode
      })
    }).catch(() => {});

    // 2. Transmit differential audio frequency pulse + haptic vibration
    transmitTvCommand(cmd.frequency);

    setTimeout(() => {
      setIsTransmitting(false);
    }, 400);
  };

  const handleDownloadIr = () => {
    try {
      const irContent = generateFlipperIrFile(brandProfile);
      const blob = new Blob([irContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${brandProfile.id}_tv_remote.ir`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Download failed:', e);
    }
  };

  const handleCopyIr = () => {
    try {
      const content = generateFlipperIrFile(brandProfile);
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-rose-500/40 bg-[#0e0f1a] text-neutral-100 shadow-2xl shadow-rose-950/40 overflow-hidden font-sans">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#1c1e33] via-[#161729] to-[#121320] border-b border-rose-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-600 via-rose-500 to-amber-500 p-[1.5px] flex items-center justify-center shadow-lg shadow-rose-950/50">
              <Tv className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-wide">
                  Universal TV Remote Control
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                  Remot TV Apapun
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Kontrol semua merk TV via sensor IR HP, dongle audio, Wi-Fi Smart TV, dan berkas .ir Dolphy / Flipper Zero
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Brand Selector Bar */}
        <div className="px-4 py-2.5 bg-[#121322] border-b border-neutral-800 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 mr-1">
            Pilih Merk TV:
          </span>
          {Object.values(TV_BRANDS_DATABASE).map((brand) => {
            const isSelected = activeBrandId === brand.id;
            return (
              <button
                key={brand.id}
                onClick={() => setActiveBrandId(brand.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-900/40 border border-rose-400/50'
                    : 'bg-[#1a1c2e] hover:bg-[#23263e] text-neutral-300 border border-neutral-800'
                }`}
              >
                {brand.name.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* Transmission Mode Selector */}
        <div className="px-4 py-2 bg-[#0d0e18] border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-neutral-800">
            <button
              onClick={() => setRemoteMode('ir')}
              className={`px-3 py-1 rounded-md font-bold transition-colors ${
                remoteMode === 'ir' ? 'bg-rose-500 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              IR Blaster (38kHz)
            </button>
            <button
              onClick={() => setRemoteMode('wifi')}
              className={`px-3 py-1 rounded-md font-bold transition-colors ${
                remoteMode === 'wifi' ? 'bg-sky-500 text-black shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Wi-Fi Smart TV (LAN)
            </button>
            <button
              onClick={() => setRemoteMode('file')}
              className={`px-3 py-1 rounded-md font-bold transition-colors ${
                remoteMode === 'file' ? 'bg-amber-500 text-black shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Berkas .IR Dolphy
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full transition-all duration-150 ${
              isTransmitting ? 'bg-rose-500 shadow-md shadow-rose-500 ring-4 ring-rose-500/40 animate-ping' : 'bg-neutral-700'
            }`} />
            <span className="font-mono text-[10px] text-neutral-400">
              {isTransmitting ? 'EMITTING IR...' : `${brandProfile.protocol} (${brandProfile.defaultFrequency / 1000} kHz)`}
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
            
            {/* The Remote Hardware Controller UI */}
            <div className="w-72 bg-gradient-to-b from-[#1c1e30] via-[#161726] to-[#11121d] rounded-[42px] p-5 border-2 border-neutral-700/80 shadow-2xl shadow-black flex flex-col items-center gap-4 select-none relative">
              
              {/* Emitter Eye */}
              <div className="absolute -top-1.5 w-8 h-2.5 rounded-t-full bg-neutral-600 border border-neutral-500/50 flex items-center justify-center">
                <span className={`w-3 h-1.5 rounded-full ${isTransmitting ? 'bg-rose-400 shadow-lg shadow-rose-400' : 'bg-rose-950'}`} />
              </div>

              {/* Brand Label on Remote */}
              <div className="text-center pt-2">
                <span className="text-[11px] font-extrabold tracking-widest text-neutral-400 uppercase font-mono">
                  {brandProfile.name.split(' ')[0]}
                </span>
              </div>

              {/* Row 1: Power, Source, Mute */}
              <div className="w-full flex items-center justify-between px-2">
                <button
                  onClick={() => handleSendCommand('power')}
                  className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-700 to-rose-500 hover:from-rose-600 hover:to-rose-400 text-white flex items-center justify-center shadow-lg shadow-rose-900/50 active:scale-95 transition-all cursor-pointer border border-rose-400/40"
                  title="Power Toggle"
                >
                  <Power className="w-5 h-5 text-white" />
                </button>

                <button
                  onClick={() => handleSendCommand('source')}
                  className="w-10 h-10 rounded-2xl bg-[#23263d] hover:bg-[#2b2f4c] text-neutral-300 hover:text-white flex flex-col items-center justify-center text-[9px] font-bold border border-neutral-700 active:scale-95 transition-all cursor-pointer"
                  title="Source Input"
                >
                  <Cast className="w-3.5 h-3.5 text-sky-400 mb-0.5" />
                  <span>SRC</span>
                </button>

                <button
                  onClick={() => handleSendCommand('mute')}
                  className="w-10 h-10 rounded-2xl bg-[#23263d] hover:bg-[#2b2f4c] text-neutral-300 hover:text-white flex items-center justify-center border border-neutral-700 active:scale-95 transition-all cursor-pointer"
                  title="Mute Volume"
                >
                  <VolumeX className="w-4 h-4 text-amber-400" />
                </button>
              </div>

              {/* Row 2: Volume & Channel Rockers */}
              <div className="w-full grid grid-cols-2 gap-3 px-1">
                <div className="bg-[#121320] rounded-2xl p-1 border border-neutral-700/80 flex flex-col items-center justify-between h-28 shadow-inner">
                  <button
                    onClick={() => handleSendCommand('vol_up')}
                    className="w-full py-2 rounded-xl hover:bg-[#22253d] text-white flex flex-col items-center justify-center text-[10px] font-bold active:scale-95 cursor-pointer"
                  >
                    <ChevronUp className="w-4 h-4 text-sky-400" />
                    <span>VOL +</span>
                  </button>
                  <span className="text-[9px] font-mono text-neutral-500">VOL</span>
                  <button
                    onClick={() => handleSendCommand('vol_down')}
                    className="w-full py-2 rounded-xl hover:bg-[#22253d] text-white flex flex-col items-center justify-center text-[10px] font-bold active:scale-95 cursor-pointer"
                  >
                    <span>VOL -</span>
                    <ChevronDown className="w-4 h-4 text-sky-400" />
                  </button>
                </div>

                <div className="bg-[#121320] rounded-2xl p-1 border border-neutral-700/80 flex flex-col items-center justify-between h-28 shadow-inner">
                  <button
                    onClick={() => handleSendCommand('ch_up')}
                    className="w-full py-2 rounded-xl hover:bg-[#22253d] text-white flex flex-col items-center justify-center text-[10px] font-bold active:scale-95 cursor-pointer"
                  >
                    <ChevronUp className="w-4 h-4 text-emerald-400" />
                    <span>CH +</span>
                  </button>
                  <span className="text-[9px] font-mono text-neutral-500">CH</span>
                  <button
                    onClick={() => handleSendCommand('ch_down')}
                    className="w-full py-2 rounded-xl hover:bg-[#22253d] text-white flex flex-col items-center justify-center text-[10px] font-bold active:scale-95 cursor-pointer"
                  >
                    <span>CH -</span>
                    <ChevronDown className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              </div>

              {/* Row 3: Circular D-Pad */}
              <div className="relative w-44 h-44 rounded-full bg-[#121322] border-2 border-neutral-700 p-1 flex items-center justify-center shadow-xl">
                <button
                  onClick={() => handleSendCommand('up')}
                  className="absolute top-1 w-14 h-11 hover:bg-[#23263d] rounded-t-full flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer active:scale-90"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleSendCommand('down')}
                  className="absolute bottom-1 w-14 h-11 hover:bg-[#23263d] rounded-b-full flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer active:scale-90"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleSendCommand('left')}
                  className="absolute left-1 w-11 h-14 hover:bg-[#23263d] rounded-l-full flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer active:scale-90"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleSendCommand('right')}
                  className="absolute right-1 w-11 h-14 hover:bg-[#23263d] rounded-r-full flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer active:scale-90"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleSendCommand('ok')}
                  className="w-18 h-18 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-sky-950/60 flex items-center justify-center border border-sky-400/40 active:scale-90 cursor-pointer"
                >
                  OK
                </button>
              </div>

              {/* Row 4: Back, Home, Menu */}
              <div className="w-full grid grid-cols-3 gap-2 px-1">
                <button
                  onClick={() => handleSendCommand('back')}
                  className="py-2.5 rounded-xl bg-[#202236] hover:bg-[#282a44] text-neutral-300 hover:text-white flex flex-col items-center justify-center text-[9px] font-bold border border-neutral-700/80 active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-neutral-400 mb-0.5" />
                  <span>BACK</span>
                </button>
                <button
                  onClick={() => handleSendCommand('home')}
                  className="py-2.5 rounded-xl bg-[#202236] hover:bg-[#282a44] text-neutral-300 hover:text-white flex flex-col items-center justify-center text-[9px] font-bold border border-neutral-700/80 active:scale-95 cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5 text-sky-400 mb-0.5" />
                  <span>HOME</span>
                </button>
                <button
                  onClick={() => handleSendCommand('menu')}
                  className="py-2.5 rounded-xl bg-[#202236] hover:bg-[#282a44] text-neutral-300 hover:text-white flex flex-col items-center justify-center text-[9px] font-bold border border-neutral-700/80 active:scale-95 cursor-pointer"
                >
                  <Menu className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
                  <span>MENU</span>
                </button>
              </div>

              {/* Row 5: Netflix & YouTube */}
              <div className="w-full grid grid-cols-2 gap-2 px-1">
                <button
                  onClick={() => handleSendCommand('netflix')}
                  className="py-2 rounded-xl bg-black hover:bg-neutral-900 border border-red-700/60 text-red-500 font-extrabold text-[10px] tracking-wider active:scale-95 cursor-pointer shadow-md"
                >
                  NETFLIX
                </button>
                <button
                  onClick={() => handleSendCommand('youtube')}
                  className="py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-600/60 text-red-300 font-extrabold text-[10px] tracking-wider active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-1"
                >
                  <Play className="w-3 h-3 fill-red-400" />
                  <span>YOUTUBE</span>
                </button>
              </div>

              {/* Numpad Toggle Button */}
              <button
                onClick={() => setShowNumpad(!showNumpad)}
                className="text-[10px] text-neutral-400 hover:text-sky-300 font-semibold cursor-pointer underline"
              >
                {showNumpad ? 'Sembunyikan Angka' : 'Tampilkan Numpad 0-9'}
              </button>

              {/* Collapsible Numpad */}
              {showNumpad && (
                <div className="w-full grid grid-cols-3 gap-2 px-1 pt-1 animate-in fade-in">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, ''].map((n, i) => (
                    n !== '' ? (
                      <button
                        key={i}
                        onClick={() => handleSendCommand(`num_${n}`)}
                        className="py-2 rounded-xl bg-[#1e2033] hover:bg-[#262840] text-white font-mono font-bold text-xs border border-neutral-700/80 active:scale-90 cursor-pointer"
                      >
                        {n}
                      </button>
                    ) : <div key={i} />
                  ))}
                </div>
              )}
            </div>

            {/* Diagnostic & Integration Details */}
            <div className="flex-1 w-full space-y-4">
              
              {/* Live Signal Feed */}
              <div className="p-4 rounded-2xl bg-[#121322] border border-neutral-800 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between font-sans">
                  <span className="text-neutral-400 font-bold">Status Pancaran:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                    <span>EMISSION ACTIVE</span>
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-black/60 border border-neutral-800 text-sky-300 break-all leading-relaxed">
                  {lastAction}
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => openInDolphyApp(brandProfile)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                    title="Unduh berkas .ir dan buka langsung di aplikasi Dolphy v2.6"
                  >
                    <span>🐬</span>
                    <span>Buka & Tembakkan via Dolphy App (IR Blaster HP)</span>
                  </button>
                  <button
                    onClick={handleDownloadIr}
                    className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-400" />
                    <span>Unduh .IR {brandProfile.name.split(' ')[0]}</span>
                  </button>
                </div>
                <p className="text-[11px] text-amber-200/90 bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/30 leading-relaxed font-sans">
                  💡 <strong>Cara Kontrol TV Nyata:</strong> Browser Android Chrome tidak diizinkan oleh OS menyalakan lampu LED IR Blaster secara langsung. Gunakan tab <strong>Wi-Fi Smart TV</strong> di bawah jika TV terhubung ke Wi-Fi yang sama, atau tekan tombol <strong>Dolphy App</strong> di atas untuk memancarkan sinyal fisik lewat aplikasi Dolphy di HP Xiaomi Anda.
                </p>
              </div>

              {/* Wi-Fi Smart TV Pairing (if in Wi-Fi mode) */}
              {remoteMode === 'wifi' && (
                <div className="p-4 rounded-2xl bg-[#121322] border border-sky-500/30 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-sky-400" />
                      <span>Kontrol Smart TV via Jaringan Wi-Fi (LAN)</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 text-[10px] font-mono">
                      Port: {brandProfile.ipControlPort || 8080}
                    </span>
                  </div>
                  <p className="text-neutral-400 leading-relaxed">
                    Pastikan HP atau PC Anda terhubung ke jaringan Wi-Fi yang sama dengan Smart TV Anda (misalnya melalui koneksi <strong>USB Router Bridge</strong> kita).
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={smartTvIp}
                      onChange={(e) => setSmartTvIp(e.target.value)}
                      placeholder="192.168.1.50"
                      className="flex-1 px-3.5 py-2 rounded-xl bg-black/60 border border-neutral-700 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                    />
                    <button
                      onClick={async () => {
                        setLastAction(`Memeriksa status Smart TV ${brandProfile.name} pada ${smartTvIp}...`);
                        try {
                          const r = await fetch('/api/tv-remote/send', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ brand: activeBrandId, command: 'ping', ip: smartTvIp, mode: 'wifi' })
                          });
                          const d = await r.json();
                          setLastAction(d.details || `🟢 Smart TV (${smartTvIp}) siap merespons.`);
                        } catch (e) {
                          setLastAction(`⚠️ Gagal menjangkau ${smartTvIp}. Pastikan HP dan TV di Wi-Fi yang sama.`);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs transition-colors cursor-pointer"
                    >
                      Hubungkan TV
                    </button>
                  </div>
                </div>
              )}

              {/* Native Xiaomi / Android IR Blaster Quick Action */}
              {remoteMode === 'ir' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 to-neutral-900 border border-rose-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-300 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-rose-400" />
                      <span>Jalur IR Hardware HP Xiaomi / Dolphy</span>
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      Bypass Web Sandbox
                    </span>
                  </div>
                  <p className="text-neutral-300 leading-relaxed text-[11px]">
                    Karena browser Google Chrome Android tidak diberi izin OS ke lampu IR fisik HP demi privasi, tekan tombol di bawah untuk langsung membuka profil remote {brandProfile.name} di <strong>Mi Remote bawaan HP Xiaomi</strong> atau <strong>Dolphy App</strong>:
                  </p>
                  <button
                    onClick={() => launchMiRemoteApp(brandProfile)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>🚀 BUKA DI MI REMOTE (HP XIAOMI) / DOLPHY</span>
                  </button>
                </div>
              )}

              {/* Flipper & Dolphy File Preview */}
              {remoteMode === 'file' && (
                <div className="p-4 rounded-2xl bg-[#121322] border border-amber-500/30 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      Berkas Resmi .IR untuk Dolphy App / Flipper Zero:
                    </span>
                    <button
                      onClick={handleCopyIr}
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Tersalin' : 'Salin Semua'}</span>
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-black/60 border border-neutral-800 text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-52 leading-relaxed">
                    {generateFlipperIrFile(brandProfile)}
                  </pre>
                </div>
              )}

              {/* Universal Power Storm Button */}
              <div className="p-4 rounded-2xl bg-[#161829] border border-amber-500/40 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Mode Storm Universal (Semua Merk)</span>
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    12 Merk Sekaligus
                  </span>
                </div>
                <p className="text-neutral-400 leading-relaxed">
                  Memancarkan gelombang Power Toggle untuk Samsung, LG, Sony, Xiaomi, Polytron, Sharp, Toshiba, dan TCL secara berurutan.
                </p>
                <button
                  onClick={() => {
                    setActiveBrandId('universal');
                    handleSendCommand('power');
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs shadow-lg shadow-amber-950/40 transition-all cursor-pointer active:scale-95"
                >
                  ⚡ PANCARKAN POWER KE SEMUA MERK SEKARANG
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={handleDownloadIr}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Berkas .IR {brandProfile.name}</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Tutup Remot
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0d0e17] border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Remot TV Universal Aktif di Global Pixel AI</span>
          </div>
          <span className="text-[11px] font-mono text-neutral-500">
            Carrier: 38kHz PWM • Duty: 33%
          </span>
        </div>
      </div>
    </div>
  );
};
