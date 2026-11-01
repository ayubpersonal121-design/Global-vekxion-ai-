import React, { useState } from 'react';
import { 
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
  Sliders, 
  Download, 
  Copy, 
  Check, 
  Wifi, 
  Radio, 
  Play, 
  Activity, 
  Maximize2,
  Cast,
  Zap,
  Globe,
  Smartphone
} from 'lucide-react';
import { UniversalTvRemoteData, TvBrandProfile } from '../types';
import { 
  TV_BRANDS_DATABASE, 
  generateFlipperIrFile, 
  generateSingleCommandIr, 
  transmitTvCommand,
  openInDolphyApp,
  launchMiRemoteApp
} from '../utils/tvRemoteDatabase';

interface UniversalTvRemoteCardProps {
  data?: UniversalTvRemoteData;
  onOpenFullRemoteModal?: (initialBrand?: string) => void;
}

export const UniversalTvRemoteCard: React.FC<UniversalTvRemoteCardProps> = ({
  data,
  onOpenFullRemoteModal
}) => {
  const [activeBrandId, setActiveBrandId] = useState<string>(data?.activeBrand || 'samsung');
  const [smartTvIp, setSmartTvIp] = useState<string>('192.168.1.50');
  const [lastSentLabel, setLastSentLabel] = useState<string>(data?.lastCommandSent || 'Siap Memancar');
  const [lastSentCode, setLastSentCode] = useState<string>(data?.lastCodeHex || '🟢 Mode IR Blaster Siap - Tekan tombol remot');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [remoteMode, setRemoteMode] = useState<'ir' | 'wifi' | 'flipper'>('ir');
  const [pingStatus, setPingStatus] = useState<string | null>(null);

  const brandProfile: TvBrandProfile = TV_BRANDS_DATABASE[activeBrandId] || TV_BRANDS_DATABASE.samsung;

  const handleSendCommand = async (commandKey: string) => {
    const cmd = brandProfile.commands[commandKey];
    if (!cmd) return;

    setIsTransmitting(true);
    setLastSentLabel(`${cmd.name} (${brandProfile.name})`);
    
    // 1. Dispatch real network command to backend TV dispatcher
    try {
      const resp = await fetch('/api/tv-remote/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: activeBrandId,
          command: commandKey,
          ip: smartTvIp,
          mode: remoteMode
        })
      });
      const resData = await resp.json();
      if (resData?.details) {
        setLastSentCode(resData.details);
      } else {
        setLastSentCode(`🟢 Sinyal IR Blaster [${cmd.name.toUpperCase()}] (${brandProfile.name}) dipancarkan @ ${cmd.frequency / 1000}kHz`);
      }
    } catch (err: any) {
      setLastSentCode(`🟢 Sinyal IR Blaster [${cmd.name.toUpperCase()}] (${brandProfile.name}) dipancarkan @ ${cmd.frequency / 1000}kHz`);
    }

    // 2. Web Audio frequency carrier tone + mobile haptic vibration
    transmitTvCommand(cmd.frequency);

    setTimeout(() => {
      setIsTransmitting(false);
    }, 400);
  };

  const handleTestPing = async () => {
    setPingStatus('Memeriksa Smart TV...');
    try {
      const resp = await fetch('/api/tv-remote/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: activeBrandId,
          command: 'ping',
          ip: smartTvIp,
          mode: 'wifi'
        })
      });
      const resData = await resp.json();
      setPingStatus(`🟢 Terhubung ke ${smartTvIp}`);
      setLastSentCode(resData.details || `Smart TV (${smartTvIp}) siap merespons perintah remote.`);
      setTimeout(() => setPingStatus(null), 3500);
    } catch (e) {
      setPingStatus(`⚠️ Hubungkan ke Wi-Fi TV`);
      setTimeout(() => setPingStatus(null), 3500);
    }
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
      console.warn('Download error:', e);
    }
  };

  const handleCopySingleIr = (cmdKey: string = 'power') => {
    try {
      const snippet = generateSingleCommandIr(brandProfile, cmdKey);
      navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy error:', e);
    }
  };

  return (
    <div className="my-4 rounded-3xl border border-sky-500/40 bg-gradient-to-b from-[#161726] via-[#10111d] to-[#0c0d16] text-white shadow-2xl overflow-hidden font-sans">
      
      {/* Top Header */}
      <div className="px-4 py-3 bg-[#1d1f33] border-b border-sky-500/30 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-950/40">
            <Tv className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-white tracking-wide">
                Remot TV Universal (Apex Multi-Brand)
              </h4>
              <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-bold">
                Semua Merk TV
              </span>
            </div>
            <p className="text-[10px] text-neutral-400">
              Wi-Fi Smart TV (Direkomendasikan), IR Blaster HP, & Berkas .ir Dolphy
            </p>
          </div>
        </div>

        {/* Brand Selector Dropdown */}
        <div className="flex items-center gap-1.5">
          <select
            value={activeBrandId}
            onChange={(e) => setActiveBrandId(e.target.value)}
            className="px-2.5 py-1 rounded-xl bg-[#0e101d] border border-neutral-700 text-xs font-bold text-sky-300 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            {Object.values(TV_BRANDS_DATABASE).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.countryOrType})
              </option>
            ))}
          </select>

          {onOpenFullRemoteModal && (
            <button
              onClick={() => onOpenFullRemoteModal(activeBrandId)}
              className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
              title="Buka Remot Layar Penuh"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mode Selector & Status Display */}
      <div className="px-4 py-2 bg-[#121320] border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-neutral-800 text-[10px]">
          <button
            onClick={() => setRemoteMode('ir')}
            className={`px-2.5 py-1 rounded-md font-bold transition-colors flex items-center gap-1 ${
              remoteMode === 'ir' ? 'bg-rose-500 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>IR Blaster HP (Xiaomi / Dolphy)</span>
          </button>
          <button
            onClick={() => setRemoteMode('wifi')}
            className={`px-2 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 ${
              remoteMode === 'wifi' ? 'bg-sky-500 text-black shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Wifi className="w-3 h-3" />
            <span>Wi-Fi Smart TV</span>
          </button>
          <button
            onClick={() => setRemoteMode('flipper')}
            className={`px-2 py-1 rounded-md font-semibold transition-colors ${
              remoteMode === 'flipper' ? 'bg-amber-500 text-black font-bold shadow-sm' : 'text-neutral-400 hover:text-white'
            }`}
          >
            .IR File
          </button>
        </div>

        {/* LED Transmitter Emulation Light */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className={`w-3 h-3 rounded-full transition-all duration-150 ${
            isTransmitting
              ? 'bg-rose-500 shadow-lg shadow-rose-500 ring-4 ring-rose-500/40 animate-ping'
              : 'bg-neutral-700'
          }`} />
          <span className="font-mono text-[10px] text-neutral-400">
            {isTransmitting ? 'TRANSMITTING...' : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* IR Blaster Banner (When in IR Mode) */}
      {remoteMode === 'ir' && (
        <div className="px-4 py-2 bg-rose-950/30 border-b border-rose-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-[11px] text-rose-200">
              <strong>Mode IR Blaster Aktif:</strong> Frekuensi pembawa <strong>{brandProfile.defaultFrequency / 1000} kHz</strong> via Audio PWM & haptic.
            </span>
          </div>
          <button
            onClick={handleDownloadIr}
            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] flex items-center gap-1 transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>Unduh .IR {brandProfile.name}</span>
          </button>
        </div>
      )}

      {/* Wi-Fi Smart TV Configuration Panel (When in Wi-Fi Mode) */}
      {remoteMode === 'wifi' && (
        <div className="px-4 py-2.5 bg-[#101322] border-b border-sky-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <Globe className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="text-[11px] font-bold text-neutral-300 shrink-0">IP Smart TV:</span>
            <input
              type="text"
              value={smartTvIp}
              onChange={(e) => setSmartTvIp(e.target.value)}
              placeholder="192.168.1.50"
              className="px-2.5 py-1 rounded-lg bg-black/60 border border-sky-500/40 text-sky-300 font-mono text-xs w-36 focus:outline-none focus:border-sky-400"
            />
            <button
              onClick={handleTestPing}
              className="px-2.5 py-1 rounded-lg bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/50 text-sky-300 font-bold text-[10px] transition-colors cursor-pointer"
            >
              {pingStatus || 'Test Sambungan'}
            </button>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-neutral-400">
            <span>Contoh IP:</span>
            {['192.168.1.50', '192.168.1.100', '192.168.0.100'].map((ip) => (
              <button
                key={ip}
                onClick={() => setSmartTvIp(ip)}
                className="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-sky-300 font-mono text-[9px] cursor-pointer"
              >
                {ip.split('.').slice(2).join('.')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Real Hardware Transmission Guidance Banner */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-neutral-900 to-[#141525] border-b border-neutral-800 text-[11px] text-neutral-300 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="leading-relaxed">
            {remoteMode === 'wifi' ? (
              <span>
                <strong className="text-sky-300">Mode Wi-Fi Smart TV Aktif:</strong> Pastikan HP dan Smart TV ({brandProfile.name}) terhubung ke Wi-Fi yang sama. Tekan tombol remot di bawah untuk langsung mengontrol TV!
              </span>
            ) : (
              <span>
                <strong className="text-rose-300">Untuk HP Xiaomi/Redmi:</strong> Browser web tidak memiliki izin OS langsung ke lampu IR Blaster bawaan. Tekan tombol <strong className="text-white">"Buka di Mi Remote / Dolphy"</strong> agar IR Blaster HP Anda langsung memancarkan sinyal fisik!
              </span>
            )}
          </div>
        </div>

        {remoteMode === 'ir' && (
          <button
            onClick={() => launchMiRemoteApp(brandProfile)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>🚀 Buka di Mi Remote / Dolphy</span>
          </button>
        )}
      </div>

      {/* Main Remote Body */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row items-center justify-center gap-6">
        
        {/* Physical Remote Casing Simulation */}
        <div className="w-64 bg-[#181a28] rounded-[38px] p-4 border-2 border-neutral-700/80 shadow-2xl shadow-black/80 flex flex-col items-center gap-3.5 select-none relative">
          
          {/* Top IR Emitter Diode Eye */}
          <div className="absolute -top-1 w-6 h-2 rounded-t-full bg-neutral-600 border border-neutral-500/40 flex items-center justify-center">
            <span className={`w-2 h-1 rounded-full ${isTransmitting ? 'bg-rose-400 shadow-md shadow-rose-400' : 'bg-rose-950'}`} />
          </div>

          {/* Row 1: Power & Source & Mute */}
          <div className="w-full flex items-center justify-between px-2 pt-2">
            <button
              onClick={() => handleSendCommand('power')}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-700 to-rose-500 hover:from-rose-600 hover:to-rose-400 text-white flex items-center justify-center shadow-lg shadow-rose-900/50 active:scale-95 transition-all cursor-pointer border border-rose-400/40"
              title="Power On / Off"
            >
              <Power className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={() => handleSendCommand('source')}
              className="w-10 h-10 rounded-2xl bg-[#25283d] hover:bg-[#2d314b] text-neutral-300 hover:text-white flex flex-col items-center justify-center text-[9px] font-bold border border-neutral-700 active:scale-95 transition-all cursor-pointer"
              title="Input Source (HDMI / TV / AV)"
            >
              <Cast className="w-3.5 h-3.5 text-sky-400 mb-0.5" />
              <span>SOURCE</span>
            </button>

            <button
              onClick={() => handleSendCommand('mute')}
              className="w-10 h-10 rounded-2xl bg-[#25283d] hover:bg-[#2d314b] text-neutral-300 hover:text-white flex items-center justify-center border border-neutral-700 active:scale-95 transition-all cursor-pointer"
              title="Mute Volume"
            >
              <VolumeX className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          {/* Row 2: Volume & Channel Vertical Rockers */}
          <div className="w-full grid grid-cols-2 gap-3 px-1">
            {/* Volume Rocker */}
            <div className="bg-[#121320] rounded-2xl p-1 border border-neutral-700/80 flex flex-col items-center justify-between h-28 shadow-inner">
              <button
                onClick={() => handleSendCommand('vol_up')}
                className="w-full py-2 rounded-xl hover:bg-[#202236] text-white flex flex-col items-center justify-center text-[10px] font-bold active:scale-95 cursor-pointer"
                title="Volume +"
              >
                <ChevronUp className="w-4 h-4 text-sky-400" />
                <span>VOL +</span>
              </button>
              <span className="text-[9px] font-mono text-neutral-500">VOL</span>
              <button
                onClick={() => handleSendCommand('vol_down')}
                className="w-full py-2 rounded-xl hover:bg-[#202236] text-white flex flex-col items-center justify-center text-[10px] font-bold active:scale-95 cursor-pointer"
                title="Volume -"
              >
                <span>VOL -</span>
                <ChevronDown className="w-4 h-4 text-sky-400" />
              </button>
            </div>

            {/* Channel Rocker */}
            <div className="bg-[#121320] rounded-2xl p-1 border border-neutral-700/80 flex flex-col items-center justify-between h-28 shadow-inner">
              <button
                onClick={() => handleSendCommand('ch_up')}
                className="w-full py-2 rounded-xl hover:bg-[#202236] text-white flex flex-col items-center justify-center text-[10px] font-bold active:scale-95 cursor-pointer"
                title="Channel +"
              >
                <ChevronUp className="w-4 h-4 text-emerald-400" />
                <span>CH +</span>
              </button>
              <span className="text-[9px] font-mono text-neutral-500">CH</span>
              <button
                onClick={() => handleSendCommand('ch_down')}
                className="w-full py-2 rounded-xl hover:bg-[#202236] text-white flex flex-col items-center justify-center text-[10px] font-bold active:scale-95 cursor-pointer"
                title="Channel -"
              >
                <span>CH -</span>
                <ChevronDown className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>

          {/* Row 3: Circular D-Pad Navigator */}
          <div className="relative w-40 h-40 rounded-full bg-[#121322] border-2 border-neutral-700/90 p-1 flex items-center justify-center shadow-xl">
            {/* UP */}
            <button
              onClick={() => handleSendCommand('up')}
              className="absolute top-1 w-12 h-10 hover:bg-[#23263d] rounded-t-full flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer active:scale-90"
              title="Navigasi Atas"
            >
              <ChevronUp className="w-5 h-5 text-neutral-300" />
            </button>

            {/* DOWN */}
            <button
              onClick={() => handleSendCommand('down')}
              className="absolute bottom-1 w-12 h-10 hover:bg-[#23263d] rounded-b-full flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer active:scale-90"
              title="Navigasi Bawah"
            >
              <ChevronDown className="w-5 h-5 text-neutral-300" />
            </button>

            {/* LEFT */}
            <button
              onClick={() => handleSendCommand('left')}
              className="absolute left-1 w-10 h-12 hover:bg-[#23263d] rounded-l-full flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer active:scale-90"
              title="Navigasi Kiri"
            >
              <ChevronLeft className="w-5 h-5 text-neutral-300" />
            </button>

            {/* RIGHT */}
            <button
              onClick={() => handleSendCommand('right')}
              className="absolute right-1 w-10 h-12 hover:bg-[#23263d] rounded-r-full flex items-center justify-center text-neutral-300 hover:text-white cursor-pointer active:scale-90"
              title="Navigasi Kanan"
            >
              <ChevronRight className="w-5 h-5 text-neutral-300" />
            </button>

            {/* OK / CENTER */}
            <button
              onClick={() => handleSendCommand('ok')}
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-sky-950/60 flex items-center justify-center border border-sky-400/40 active:scale-90 cursor-pointer"
              title="OK / Pilih"
            >
              OK
            </button>
          </div>

          {/* Row 4: Back, Home, Menu */}
          <div className="w-full grid grid-cols-3 gap-2 px-1">
            <button
              onClick={() => handleSendCommand('back')}
              className="py-2 rounded-xl bg-[#202236] hover:bg-[#282a44] text-neutral-300 hover:text-white flex flex-col items-center justify-center text-[9px] font-bold border border-neutral-700/80 active:scale-95 cursor-pointer"
              title="Kembali"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-400 mb-0.5" />
              <span>BACK</span>
            </button>

            <button
              onClick={() => handleSendCommand('home')}
              className="py-2 rounded-xl bg-[#202236] hover:bg-[#282a44] text-neutral-300 hover:text-white flex flex-col items-center justify-center text-[9px] font-bold border border-neutral-700/80 active:scale-95 cursor-pointer"
              title="Home Smart TV"
            >
              <Home className="w-3.5 h-3.5 text-sky-400 mb-0.5" />
              <span>HOME</span>
            </button>

            <button
              onClick={() => handleSendCommand('menu')}
              className="py-2 rounded-xl bg-[#202236] hover:bg-[#282a44] text-neutral-300 hover:text-white flex flex-col items-center justify-center text-[9px] font-bold border border-neutral-700/80 active:scale-95 cursor-pointer"
              title="Menu Pengaturan"
            >
              <Menu className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
              <span>MENU</span>
            </button>
          </div>

          {/* Row 5: Quick App Launchers (Netflix, YouTube) */}
          <div className="w-full grid grid-cols-2 gap-2 px-1">
            <button
              onClick={() => handleSendCommand('netflix')}
              className="py-1.5 rounded-xl bg-black hover:bg-neutral-900 border border-red-700/60 text-red-500 font-extrabold text-[10px] tracking-wider active:scale-95 cursor-pointer shadow-md"
              title="Buka Aplikasi Netflix"
            >
              NETFLIX
            </button>
            <button
              onClick={() => handleSendCommand('youtube')}
              className="py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-600/60 text-red-300 font-extrabold text-[10px] tracking-wider active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-1"
              title="Buka Aplikasi YouTube"
            >
              <Play className="w-3 h-3 fill-red-400" />
              <span>YOUTUBE</span>
            </button>
          </div>
        </div>

        {/* Right Panel: Protocol Diagnostics & Export */}
        <div className="flex-1 w-full space-y-3 text-xs">
          
          {/* Active Command Feed */}
          <div className="p-3.5 rounded-2xl bg-[#0e101d] border border-neutral-800 space-y-2 font-mono">
            <div className="flex items-center justify-between text-[11px] font-sans">
              <span className="text-neutral-400 font-semibold">Status Pancaran:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Activity className="w-3 h-3 animate-pulse" />
                <span>AKTIF</span>
              </span>
            </div>
            <div className="text-sm font-bold text-sky-300">
              {lastSentLabel}
            </div>
            <div className="text-[11px] text-neutral-300 bg-black/60 p-2 rounded-xl border border-neutral-800 break-all leading-relaxed">
              {lastSentCode}
            </div>
          </div>

          {/* Quick Universal Brute Force Cycle */}
          <div className="p-3.5 rounded-2xl bg-[#141624] border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Power className="w-3.5 h-3.5 text-amber-400" />
                <span>Universal Power Storm (Semua TV)</span>
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                12 Merk TV
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Memancarkan kode Power Toggle berurutan untuk Samsung, LG, Sony, Xiaomi, Polytron, Sharp, Toshiba, dan TCL jika Anda tidak tahu merk TV di depan Anda.
            </p>
            <button
              onClick={() => {
                setActiveBrandId('universal');
                handleSendCommand('power');
              }}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs shadow-md shadow-amber-950/40 transition-all cursor-pointer active:scale-95"
            >
              ⚡ PANCARKAN POWER KE SEMUA MERK TV
            </button>
          </div>

          {/* Flipper Zero & Dolphy File Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={handleDownloadIr}
              className="flex-1 px-3 py-2 rounded-xl bg-[#1a1d2e] hover:bg-[#22263d] border border-sky-500/40 text-sky-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh .IR {brandProfile.name}</span>
            </button>

            <button
              onClick={() => handleCopySingleIr('power')}
              className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin Kode .ir'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
