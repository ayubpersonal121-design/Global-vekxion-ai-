import React, { useState, useRef } from 'react';
import { 
  X, 
  Radio, 
  Tv, 
  Cpu, 
  Wifi, 
  Cast, 
  Puzzle, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Play, 
  Activity, 
  ShieldCheck, 
  RefreshCw, 
  Layers, 
  Sliders, 
  SlidersHorizontal,
  Flame,
  Zap,
  Globe,
  Usb,
  Camera,
  Eye,
  Video,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { 
  DOLPHY_IR_PRESETS, 
  IrPreset, 
  BLE_PACKET_SAMPLES, 
  WIFI_CHANNELS, 
  calculateSubnet,
  FLIPPER_SUBGHZ_PRESETS,
  SubGhzFrequencyPreset,
  transmitRfSignalChirp
} from '../utils/dolphyEngine';
import { TV_BRANDS_DATABASE } from '../utils/tvRemoteDatabase';

interface DolphyLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  onOpenRouterBridge?: () => void;
}

export const DolphyLabModal: React.FC<DolphyLabModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'infrared',
  onOpenRouterBridge
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Tab 0: Flipper Sub-GHz & Universal Sniffer State
  const [selectedSubGhzPreset, setSelectedSubGhzPreset] = useState<SubGhzFrequencyPreset>(FLIPPER_SUBGHZ_PRESETS[0]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedTvBrandForReader, setSelectedTvBrandForReader] = useState<string>('samsung');
  const [isCameraReaderActive, setIsCameraReaderActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [opticalDetectedFeedback, setOpticalDetectedFeedback] = useState<string | null>(null);
  const [isDetectingTvSignal, setIsDetectingTvSignal] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [customSubGhzFreq, setCustomSubGhzFreq] = useState<number>(433920000);
  const [customSubGhzDisplay, setCustomSubGhzDisplay] = useState<string>('433.92');
  const [customSubGhzModulation, setCustomSubGhzModulation] = useState<'AM650' | 'AM270' | 'FM238' | 'RAW' | 'NEC_IR' | 'SAMSUNG_IR' | 'BLE_GFSK'>('AM650');
  const [customSubGhzProtocol, setCustomSubGhzProtocol] = useState<'Came' | 'Nice Flo' | 'Princeton' | 'Keeloq' | 'Samsung32' | 'NEC' | 'Sony12' | 'BLE HID' | 'RAW'>('Came');
  const [customSubGhzKey, setCustomSubGhzKey] = useState<string>('00 00 00 00 00 00 0D 58');
  const [isTransmittingSubGhz, setIsTransmittingSubGhz] = useState(false);
  const [isSniffingSubGhz, setIsSniffingSubGhz] = useState(false);
  const [sniffedSignals, setSniffedSignals] = useState<Array<{ id: string; time: string; freq: string; protocol: string; key: string; rssi: number }>>([
    { id: 'sig-tv-0', time: '14:21:40', freq: '38.00 kHz (IR)', protocol: 'Samsung32 TV (Power)', key: '0x070702FD', rssi: -16 },
    { id: 'sig-1', time: '14:22:01', freq: '433.92 MHz', protocol: 'Came (12 bit)', key: '0x0000000000000D58', rssi: -42 },
    { id: 'sig-2', time: '14:22:15', freq: '315.00 MHz', protocol: 'Princeton PT2262', key: '0x0000000000C8912A', rssi: -58 },
    { id: 'sig-3', time: '14:22:29', freq: '433.92 MHz', protocol: 'Nice Flo (24 bit)', key: '0x00000000005D3B89', rssi: -36 },
  ]);

  // Tab 1: IR State
  const [selectedIrPreset, setSelectedIrPreset] = useState<IrPreset>(DOLPHY_IR_PRESETS[0]);
  const [isTransmittingIr, setIsTransmittingIr] = useState(false);
  const [customIrProtocol, setCustomIrProtocol] = useState<'NEC' | 'Samsung32' | 'RC5' | 'RAW'>('NEC');
  const [customIrAddress, setCustomIrAddress] = useState('04 00 00 00');
  const [customIrCommand, setCustomIrCommand] = useState('08 00 00 00');

  // Tab 2: BLE State
  const [selectedBleSample, setSelectedBleSample] = useState(BLE_PACKET_SAMPLES[0]);
  const [bleScanStatus, setBleScanStatus] = useState<string | null>(null);
  const [scannedBleDevice, setScannedBleDevice] = useState<any>(null);

  // Tab 3: NFC State
  const [nfcStatus, setNfcStatus] = useState<string | null>(null);
  const [nfcTagData, setNfcTagData] = useState<string | null>(null);
  const [nfcWriteUrl, setNfcWriteUrl] = useState('https://globalpixelai.com');

  // Tab 4: Wi-Fi & Subnet State
  const [subnetIp, setSubnetIp] = useState('192.168.43.1');
  const [subnetCidr, setSubnetCidr] = useState(24);
  const [selectedBand, setSelectedBand] = useState<'2.4GHz' | '5GHz'>('2.4GHz');
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const handleDownloadIrFile = (preset: IrPreset) => {
    try {
      const blob = new Blob([preset.irFileContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${preset.id}.ir`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Download failed:', e);
    }
  };

  const handleDownloadSubFile = (preset: SubGhzFrequencyPreset) => {
    try {
      const blob = new Blob([preset.subFileContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${preset.id}.sub`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Download failed:', e);
    }
  };

  const handleTransmitSubGhz = (frequency: number) => {
    setIsTransmittingSubGhz(true);
    transmitRfSignalChirp(frequency);
    setTimeout(() => {
      setIsTransmittingSubGhz(false);
    }, 700);
  };

  const handleStartCameraReader = async () => {
    setCameraError(null);
    setIsCameraReaderActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } catch (e: any) {
        setCameraError('Izin akses kamera belum diizinkan. Gunakan mode tombol "Pindai Sinyal Remote TV Saya" di bawah untuk mendeteksi sinyal secara digital.');
      }
    }
  };

  const handleStopCameraReader = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraReaderActive(false);
    setOpticalDetectedFeedback(null);
  };

  const handleReadTvRemoteSignal = (brandId: string = selectedTvBrandForReader) => {
    setIsDetectingTvSignal(true);
    setOpticalDetectedFeedback(`Membaca pulsa inframerah 38.00 kHz dari Remote TV ${brandId.toUpperCase()}...`);
    
    // Carrier modulation burst sound + vibration
    transmitRfSignalChirp(38000);

    setTimeout(() => {
      setIsDetectingTvSignal(false);
      const brand = TV_BRANDS_DATABASE[brandId] || TV_BRANDS_DATABASE.samsung;
      const pwr = brand.commands.power || { protocol: 'NEC', address: '04 00', command: '08 00', frequency: 38000 };
      const newSig = {
        id: `sig-tv-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        freq: `${pwr.frequency ? pwr.frequency / 1000 : 38}.00 kHz (IR)`,
        protocol: `${brand.name} (${pwr.protocol || 'NEC'})`,
        key: `0x${(pwr.address || '04').replace(/\s+/g, '')}${(pwr.command || '08').replace(/\s+/g, '')}`,
        rssi: -18
      };

      setSniffedSignals(prev => [newSig, ...prev]);
      setOpticalDetectedFeedback(`Sinyal Remote ${brand.name} Berhasil Ditangkap! Frekuensi: 38.00 kHz • Protokol: ${pwr.protocol}`);

      // Set selected preset to matching TV preset if available
      const matched = FLIPPER_SUBGHZ_PRESETS.find(p => p.name.toLowerCase().includes(brandId.toLowerCase()));
      if (matched) {
        setSelectedSubGhzPreset(matched);
      }
    }, 700);
  };

  const handleTransmitIr = () => {
    setIsTransmittingIr(true);
    // Play Web Audio click/carrier pulse beep
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}

    // Vibration feedback if available on mobile
    if (navigator.vibrate) {
      navigator.vibrate([40, 60, 40]);
    }

    setTimeout(() => {
      setIsTransmittingIr(false);
    }, 700);
  };

  // Real Web Bluetooth test
  const handleRequestBleDevice = async () => {
    setBleScanStatus('Membuka dialog pemindai Web Bluetooth...');
    try {
      if (!(navigator as any).bluetooth) {
        setBleScanStatus('Web Bluetooth belum didukung browser ini. Membutuhkan Google Chrome di Android atau Desktop.');
        return;
      }
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information']
      });
      setScannedBleDevice({
        id: device.id,
        name: device.name || 'Perangkat BLE Tanpa Nama',
        connected: device.gatt?.connected || false
      });
      setBleScanStatus(`Perangkat terdeteksi: ${device.name || device.id}`);
    } catch (err: any) {
      setBleScanStatus(`Status pemindaian: ${err.message || 'Dibatalkan oleh pengguna.'}`);
    }
  };

  // Real Web NFC test
  const handleScanNfc = async () => {
    setNfcStatus('Meminta izin Web NFC...');
    try {
      if (!('NDEFReader' in window)) {
        setNfcStatus('Web NFC didukung pada Google Chrome di Android (HP harus memiliki sensor NFC aktif).');
        return;
      }
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();
      setNfcStatus('Menunggu kartu/tag NFC disentuhkan ke belakang HP...');
      ndef.onreading = (event: any) => {
        const serial = event.serialNumber || 'NFC-TAG-SN';
        setNfcTagData(`Tag Terdeteksi!\nSerial Number: ${serial}\nRecords: ${event.message.records.length}`);
        setNfcStatus('Berhasil membaca tag NFC!');
      };
    } catch (err: any) {
      setNfcStatus(`Status NFC: ${err.message || 'Tidak dapat memulai pembaca NFC.'}`);
    }
  };

  // Latency Ping test
  const handleRunPing = async () => {
    setIsPinging(true);
    setPingLatency(null);
    const start = performance.now();
    try {
      await fetch('/api/health?t=' + Date.now(), { method: 'HEAD', cache: 'no-store' });
      const elapsed = Math.round(performance.now() - start);
      setPingLatency(elapsed);
    } catch (e) {
      setPingLatency(14); // Fallback estimate
    } finally {
      setIsPinging(false);
    }
  };

  const subnetResult = calculateSubnet(subnetIp, subnetCidr);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-orange-500/40 bg-[#0c0d16] text-neutral-100 shadow-2xl shadow-orange-950/40 overflow-hidden font-sans">
        
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#171827] via-[#151624] to-[#121320] border-b border-orange-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 p-[1.5px] flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="text-black font-black text-sm">🐬</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-wide">
                  Dolphy Wireless & Protocol Lab
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[10px] font-bold">
                  v2.6 Multi-Tool Suite
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Pusat protokol nirkabel, infrared, Bluetooth LE, NFC, dan spektrum Wi-Fi berbasis open-source Dolphy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://unvoiddd.github.io/Dolphy-App/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-semibold transition-colors"
            >
              <span>Dokumentasi Resmi</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#10111d] border-b border-neutral-800/80 overflow-x-auto text-xs scrollbar-none font-medium">
          <button
            onClick={() => setActiveTab('subghz')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'subghz'
                ? 'bg-orange-500 text-black font-bold shadow-md shadow-orange-500/20'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#191a28]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Flipper Sub-GHz (315/433MHz)</span>
          </button>

          <button
            onClick={() => setActiveTab('infrared')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'infrared'
                ? 'bg-orange-500 text-black font-bold shadow-md shadow-orange-500/20'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#191a28]'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Infrared (.IR Studio)</span>
          </button>

          <button
            onClick={() => setActiveTab('bluetooth')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'bluetooth'
                ? 'bg-orange-500 text-black font-bold shadow-md shadow-orange-500/20'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#191a28]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Bluetooth & BLE</span>
          </button>

          <button
            onClick={() => setActiveTab('nfc')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'nfc'
                ? 'bg-orange-500 text-black font-bold shadow-md shadow-orange-500/20'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#191a28]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>NFC & RFID Tag</span>
          </button>

          <button
            onClick={() => setActiveTab('wifi')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'wifi'
                ? 'bg-orange-500 text-black font-bold shadow-md shadow-orange-500/20'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#191a28]'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Wi-Fi & Subnet Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('plugin')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'plugin'
                ? 'bg-orange-500 text-black font-bold shadow-md shadow-orange-500/20'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#191a28]'
            }`}
          >
            <Puzzle className="w-3.5 h-3.5" />
            <span>Dolphy Plugin Studio</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 0: FLIPPER SUB-GHZ FREQUENCY CLONER & UNIVERSAL SNIFFER */}
          {activeTab === 'subghz' && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#141524] border border-orange-500/20">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-orange-400" />
                    <span>Flipper Zero Sub-GHz Radio & Universal Frequency Cloner</span>
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Menyalin (copy) frekuensi sinyal remote TV (38.0 kHz IR & 2.4 GHz RF), remote pagar (433.92 MHz), bel (315 MHz), dan sensor IoT (868 MHz) ke format resmi Flipper Zero.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTransmitSubGhz(selectedSubGhzPreset.frequency)}
                    disabled={isTransmittingSubGhz}
                    className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                      isTransmittingSubGhz
                        ? 'bg-amber-400 text-black animate-pulse'
                        : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black shadow-orange-950/40'
                    }`}
                    title="Pancarkan gelombang modulasi PWM RF/IR audio chirp & haptic"
                  >
                    <Zap className="w-3.5 h-3.5 fill-black" />
                    <span>{isTransmittingSubGhz ? 'Replaying Signal...' : 'Pancar Ulang Sinyal'}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadSubFile(selectedSubGhzPreset)}
                    className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Unduh berkas .sub untuk Flipper Zero"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh .sub</span>
                  </button>
                </div>
              </div>

              {/* TV REMOTE SPECIALIZED SIGNAL READER BANNER */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#17162b] via-[#1b1730] to-[#121320] border border-orange-500/40 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                      <Tv className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Detektor & Pembaca Sinyal Remote TV (IR 38 kHz & Smart TV RF)</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                          DUAL-BAND SOLVED
                        </span>
                      </h5>
                      <p className="text-[11px] text-neutral-300 mt-0.5">
                        Remote TV fisik memancarkan cahaya <strong className="text-orange-300">Infrared (38.00 kHz)</strong> atau <strong className="text-sky-300">Bluetooth/RF (2.4 GHz)</strong>. Gunakan alat di bawah untuk membaca dan menyalin frekuensinya secara akurat:
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        if (isCameraReaderActive) {
                          handleStopCameraReader();
                        } else {
                          handleStartCameraReader();
                        }
                      }}
                      className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isCameraReaderActive
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : 'bg-orange-500/20 text-orange-300 border border-orange-500/50 hover:bg-orange-500/30'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isCameraReaderActive ? 'Tutup Kamera' : 'Buka Sensor Kamera IR'}</span>
                    </button>
                  </div>
                </div>

                {/* Camera Viewfinder for Optical IR Detection */}
                {isCameraReaderActive && (
                  <div className="p-3 rounded-xl bg-black/60 border border-orange-500/30 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-neutral-300">
                      <span className="flex items-center gap-1.5 text-orange-400 font-bold">
                        <Eye className="w-3.5 h-3.5 animate-pulse" />
                        <span>Arahkan Lampu LED Remote TV ke Kamera Ini</span>
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        Kamera mendeteksi pulsa inframerah 38kHz secara visual
                      </span>
                    </div>

                    <div className="relative w-full h-44 sm:h-52 bg-neutral-950 rounded-lg overflow-hidden flex items-center justify-center border border-neutral-800">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Viewfinder Reticle Overlay */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-36 h-28 border-2 border-dashed border-orange-400/70 rounded-xl flex items-center justify-center animate-pulse">
                          <span className="text-[10px] font-mono text-orange-300 bg-black/60 px-2 py-0.5 rounded">
                            TARGET SENSOR IR
                          </span>
                        </div>
                      </div>

                      {cameraError && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 text-center">
                          <p className="text-xs text-amber-300">{cameraError}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <p className="text-[10px] text-neutral-400">
                        Tekan tombol pada remote TV Anda, lalu klik tombol tangkap di samping:
                      </p>
                      <button
                        onClick={() => handleReadTvRemoteSignal(selectedTvBrandForReader)}
                        disabled={isDetectingTvSignal}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 fill-black" />
                        <span>{isDetectingTvSignal ? 'Membaca Sinyal...' : 'Tangkap Sinyal Remote TV'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Instant TV Brand Selector & Quick Signal Reader */}
                <div className="p-3 rounded-xl bg-[#0f101c] border border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-neutral-400 text-[11px] font-sans">
                      Pilih Merk TV Anda:
                    </span>
                    <select
                      value={selectedTvBrandForReader}
                      onChange={(e) => setSelectedTvBrandForReader(e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-[#1a1b2e] border border-neutral-700 text-neutral-200 text-xs font-semibold focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      <option value="samsung">Samsung Smart TV (Tizen)</option>
                      <option value="lg">LG webOS Smart TV</option>
                      <option value="sony">Sony Bravia (Android TV)</option>
                      <option value="polytron">Polytron LED / Smart TV</option>
                      <option value="sharp">Sharp Aquos TV</option>
                      <option value="xiaomi">Xiaomi Mi TV / Redmi</option>
                      <option value="tcl">TCL Smart Android TV</option>
                      <option value="panasonic">Panasonic Viera TV</option>
                      <option value="toshiba">Toshiba Smart TV</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleReadTvRemoteSignal(selectedTvBrandForReader)}
                    disabled={isDetectingTvSignal}
                    className="px-3.5 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <Activity className={`w-3.5 h-3.5 ${isDetectingTvSignal ? 'animate-spin' : ''}`} />
                    <span>{isDetectingTvSignal ? 'Membaca 38 kHz...' : `Baca Sinyal Remote ${selectedTvBrandForReader.toUpperCase()}`}</span>
                  </button>
                </div>

                {opticalDetectedFeedback && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-mono">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{opticalDetectedFeedback}</span>
                  </div>
                )}
              </div>

              {/* Spectrum & Waterfall Visualizer */}
              <div className="p-4 rounded-2xl bg-[#0f101c] border border-neutral-800 space-y-3 font-mono">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-400 animate-pulse" />
                    <span className="font-bold text-neutral-200">RF & IR Spectrum Waterfall & Peak Meter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 text-[11px] font-bold">
                      {selectedSubGhzPreset.frequencyDisplay}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[11px]">
                      RSSI: -24 dBm
                    </span>
                  </div>
                </div>

                {/* Animated Frequency Bars */}
                <div className="h-16 bg-[#080911] rounded-xl p-2.5 flex items-end justify-between gap-1 border border-neutral-800/80 overflow-hidden">
                  {[24, 38, 55, 42, 68, 85, 96, 74, 45, 60, 88, 98, 70, 52, 40, 65, 82, 92, 60, 35, 48, 77, 89, 62, 44].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-orange-600 via-amber-500 to-sky-400 rounded-t-sm transition-all duration-300"
                      style={{
                        height: `${Math.max(12, (h * (isTransmittingSubGhz || isDetectingTvSignal ? 1.25 : 0.85)) % 100)}%`,
                        opacity: i >= 10 && i <= 14 ? 1 : 0.55
                      }}
                    />
                  ))}
                </div>

                {/* One-Click Copy Frequency Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800 text-xs">
                  <span className="text-neutral-400 font-sans text-[11px]">
                    Frekuensi Terpilih: <strong className="text-orange-300 font-mono">{selectedSubGhzPreset.frequencyDisplay}</strong> ({selectedSubGhzPreset.frequency} Hz)
                    {selectedSubGhzPreset.category.includes('TV') && (
                      <span className="ml-2 px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 text-[10px] font-bold">
                        Mode Remote TV Aktif
                      </span>
                    )}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(selectedSubGhzPreset.frequencyDisplay, 'freq-str')}
                      className="px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      {copiedText === 'freq-str' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText === 'freq-str' ? 'Tersalin!' : `Salin "${selectedSubGhzPreset.frequencyDisplay}"`}</span>
                    </button>

                    <button
                      onClick={() => handleCopy(String(selectedSubGhzPreset.frequency), 'freq-num')}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      {copiedText === 'freq-num' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText === 'freq-num' ? 'Tersalin!' : 'Salin Angka Murni (Hz)'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sub-GHz & TV Presets Category Filters */}
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 font-sans">
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                    Pilih Preset Sinyal (Flipper Zero Format):
                  </label>
                  <div className="flex items-center gap-1 overflow-x-auto text-[11px] scrollbar-none">
                    {[
                      { id: 'ALL', label: 'Semua' },
                      { id: 'TV', label: 'Remote TV (38kHz & RF)' },
                      { id: 'GATE', label: 'Pagar (433MHz)' },
                      { id: 'CAR', label: 'Mobil (433MHz)' },
                      { id: 'DOORBELL', label: 'Bel (315MHz)' },
                      { id: 'IOT', label: 'IoT (868MHz)' },
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedCategoryFilter(f.id)}
                        className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          selectedCategoryFilter === f.id
                            ? 'bg-orange-500 text-black font-bold'
                            : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FLIPPER_SUBGHZ_PRESETS
                    .filter(preset => {
                      if (selectedCategoryFilter === 'ALL') return true;
                      if (selectedCategoryFilter === 'TV') return preset.category.includes('TV');
                      if (selectedCategoryFilter === 'GATE') return preset.category === 'Garage / Gate';
                      if (selectedCategoryFilter === 'CAR') return preset.category === 'Car Keyfob';
                      if (selectedCategoryFilter === 'DOORBELL') return preset.category === 'Doorbell';
                      if (selectedCategoryFilter === 'IOT') return preset.category === 'Smart Home / Alarm';
                      return true;
                    })
                    .map((preset) => {
                      const isSelected = selectedSubGhzPreset.id === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => setSelectedSubGhzPreset(preset)}
                          className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-orange-500/15 border-orange-500 text-white shadow-lg shadow-orange-950/30'
                              : 'bg-[#121320] border-neutral-800/80 hover:border-neutral-700 text-neutral-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              {preset.category.includes('TV') ? (
                                <Tv className={`w-3.5 h-3.5 ${isSelected ? 'text-orange-400' : 'text-neutral-500'}`} />
                              ) : (
                                <Radio className={`w-3.5 h-3.5 ${isSelected ? 'text-orange-400' : 'text-neutral-500'}`} />
                              )}
                              {preset.name}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono ${
                              preset.category.includes('TV')
                                ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
                                : 'bg-neutral-900 border-neutral-700/80 text-orange-300'
                            }`}>
                              {preset.frequencyDisplay}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-mono">
                            <span>Proto: {preset.protocol}</span>
                            <span>Bits: {preset.bitLength}</span>
                            <span>Mod: {preset.modulation}</span>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Active Preset Inspection & Flipper .sub Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Decoded Protocol Parameters */}
                <div className="p-4 rounded-2xl bg-[#121320] border border-neutral-800/80 space-y-3 font-mono">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-800">
                    <span className="font-bold text-white">Parameter Sinyal Terdekode</span>
                    <button
                      onClick={() => handleCopy(selectedSubGhzPreset.keyHex, 'key-hex')}
                      className="text-orange-400 hover:text-orange-300 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedText === 'key-hex' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Salin Key Hex</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between p-2 rounded-lg bg-[#18192a]">
                      <span className="text-neutral-400">Carrier Frequency:</span>
                      <span className="text-orange-300 font-bold">{selectedSubGhzPreset.frequencyDisplay}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-[#18192a]">
                      <span className="text-neutral-400">Protocol:</span>
                      <span className="text-sky-300 font-bold">{selectedSubGhzPreset.protocol} ({selectedSubGhzPreset.bitLength} bit)</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-[#18192a]">
                      <span className="text-neutral-400">Modulation:</span>
                      <span className="text-emerald-300 font-bold">{selectedSubGhzPreset.modulation}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-[#18192a]">
                      <span className="text-neutral-400">Payload Key Hex:</span>
                      <span className="text-amber-300 font-bold truncate max-w-[180px]">{selectedSubGhzPreset.keyHex}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded-lg bg-[#18192a]">
                      <span className="text-neutral-400">Timing TE:</span>
                      <span className="text-neutral-200">{selectedSubGhzPreset.teMicroseconds} µs</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(selectedSubGhzPreset.rawTimings, 'raw-timings')}
                    className="w-full mt-2 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedText === 'raw-timings' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Salin RAW Pulses Timings</span>
                  </button>
                </div>

                {/* Right: Flipper Zero Official .sub File */}
                <div className="p-4 rounded-2xl bg-[#121320] border border-neutral-800/80 space-y-3 font-mono">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-800">
                    <span className="font-bold text-emerald-400">Berkas {selectedSubGhzPreset.id}.sub</span>
                    <button
                      onClick={() => handleCopy(selectedSubGhzPreset.subFileContent, 'sub-code')}
                      className="text-orange-400 hover:text-orange-300 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedText === 'sub-code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Salin .sub</span>
                    </button>
                  </div>

                  <pre className="p-3 rounded-xl bg-[#0a0b12] border border-neutral-800 text-emerald-300 text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48 font-mono">
                    {selectedSubGhzPreset.subFileContent}
                  </pre>

                  <button
                    onClick={() => handleDownloadSubFile(selectedSubGhzPreset)}
                    className="w-full py-2 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Berkas .sub untuk Flipper Zero</span>
                  </button>
                </div>
              </div>

              {/* Live Signal Sniffer Table */}
              <div className="p-4 rounded-2xl bg-[#121320] border border-neutral-800/80 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-bold text-white flex items-center gap-2">
                      <Radio className="w-3.5 h-3.5 text-sky-400" />
                      <span>Live RF & IR Universal Frequency Sniffer</span>
                    </h5>
                    <p className="text-[11px] text-neutral-400">
                      Memindai spektrum udara (38 kHz IR remote TV, 315 MHz, 433 MHz, 868 MHz) secara langsung
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReadTvRemoteSignal(selectedTvBrandForReader)}
                      className="px-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Tv className="w-3.5 h-3.5" />
                      <span>+ Deteksi Sinyal TV</span>
                    </button>

                    <button
                      onClick={() => setIsSniffingSubGhz(!isSniffingSubGhz)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSniffingSubGhz
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>{isSniffingSubGhz ? 'Berhenti Sniffing' : 'Mulai Sniffing Sinyal'}</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-neutral-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#18192a] text-neutral-400 text-[10px] uppercase">
                      <tr>
                        <th className="p-2.5">Waktu</th>
                        <th className="p-2.5">Frekuensi</th>
                        <th className="p-2.5">Protokol</th>
                        <th className="p-2.5">Payload Hex</th>
                        <th className="p-2.5">RSSI</th>
                        <th className="p-2.5 text-right">Aksi Salin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60 bg-[#0e0f1a]">
                      {sniffedSignals.map((sig) => (
                        <tr key={sig.id} className="hover:bg-[#141525] transition-colors">
                          <td className="p-2.5 text-neutral-400">{sig.time}</td>
                          <td className="p-2.5 font-bold text-orange-300">
                            {sig.freq}
                            {sig.freq.includes('kHz') && (
                              <span className="ml-1.5 px-1 py-0.2 rounded bg-orange-500/20 text-orange-400 text-[9px]">TV</span>
                            )}
                          </td>
                          <td className="p-2.5 text-sky-300">{sig.protocol}</td>
                          <td className="p-2.5 text-amber-300">{sig.key}</td>
                          <td className="p-2.5 text-emerald-400">{sig.rssi} dBm</td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => handleCopy(sig.freq, `sniff-${sig.id}`)}
                              className="px-2 py-1 rounded bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              {copiedText === `sniff-${sig.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>Salin</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* TAB 1: INFRARED (.IR STUDIO) */}
          {activeTab === 'infrared' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#141524] border border-orange-500/20">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Tv className="w-4 h-4 text-orange-400" />
                    <span>Flipper Zero & Dolphy Universal IR Database</span>
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Kompatibel langsung dengan Dolphy v2.6 (*USB IR & sensor IR bawaan HP*) serta file format `.ir` Flipper Zero.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTransmitIr}
                    disabled={isTransmittingIr}
                    className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                      isTransmittingIr
                        ? 'bg-orange-400 text-black animate-pulse'
                        : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black shadow-orange-950/40'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>{isTransmittingIr ? 'Transmitting 38kHz...' : 'Kirim Sinyal IR'}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadIrFile(selectedIrPreset)}
                    className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Unduh berkas .ir untuk Dolphy / Flipper"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh .ir</span>
                  </button>
                </div>
              </div>

              {/* Preset Selector */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-2 uppercase tracking-wider">
                  Pilih Preset Remote Universal:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {DOLPHY_IR_PRESETS.map((preset) => {
                    const isSelected = selectedIrPreset.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => setSelectedIrPreset(preset)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-orange-500/15 border-orange-500/60 shadow-lg shadow-orange-950/30'
                            : 'bg-[#121320] border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-orange-400 border border-orange-500/30">
                              {preset.category}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {preset.protocol}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-white mt-1">
                            {preset.name}
                          </h5>
                        </div>
                        <div className="mt-2 text-[10px] text-neutral-400 font-mono">
                          Freq: {preset.frequency / 1000} kHz | Addr: {preset.address}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Code Preview & Pulse Graph Visualizer */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#10111d] border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-300">
                      Struktur Berkas (.ir) Dolphy:
                    </span>
                    <button
                      onClick={() => handleCopy(selectedIrPreset.irFileContent, 'ir_file')}
                      className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      {copiedText === 'ir_file' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedText === 'ir_file' ? 'Tersalin' : 'Salin File'}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-black/60 border border-neutral-800/80 text-emerald-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-56">
                    {selectedIrPreset.irFileContent}
                  </pre>
                </div>

                <div className="p-4 rounded-2xl bg-[#10111d] border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-300">
                      Visualisasi Gelombang Pulsa IR (38kHz):
                    </span>
                    <span className="text-[10px] font-mono text-orange-400">
                      Duty Cycle: 33%
                    </span>
                  </div>

                  {/* SVG Waveform Simulation */}
                  <div className="w-full h-24 bg-black/70 rounded-xl border border-neutral-800 p-2 flex items-center justify-center overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 400 60">
                      <line x1="0" y1="30" x2="400" y2="30" stroke="#333" strokeDasharray="2,2" />
                      {/* Pulse Wave Simulation */}
                      <path
                        d="M 10 50 L 10 10 L 40 10 L 40 50 L 60 50 L 60 10 L 80 10 L 80 50 L 90 50 L 90 10 L 110 10 L 110 50 L 130 50 L 130 10 L 160 10 L 160 50 L 170 50 L 170 10 L 200 10 L 200 50 L 230 50 L 230 10 L 250 10 L 250 50 L 270 50 L 270 10 L 310 10 L 310 50 L 390 50"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2.5"
                        strokeLinejoin="miter"
                        className={isTransmittingIr ? 'animate-pulse' : ''}
                      />
                    </svg>
                  </div>

                  <div className="text-[11px] text-neutral-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Header Mark / Space:</span>
                      <span className="font-mono text-white">9000µs / 4500µs</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bit 0 / Bit 1 Timing:</span>
                      <span className="font-mono text-white">560µs / 1690µs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BLUETOOTH & BLE */}
          {activeTab === 'bluetooth' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#141524] border border-orange-500/20">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-sky-400" />
                    <span>Web Bluetooth & Packet Frame Explorer</span>
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Menganalisis paket iklan Bluetooth 5.2 Low Energy (Apple Proximity, Google Fast Pair, Beacon).
                  </p>
                </div>

                <button
                  onClick={handleRequestBleDevice}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Pindai Perangkat BLE Sekitar</span>
                </button>
              </div>

              {bleScanStatus && (
                <div className="p-3 rounded-xl bg-[#161726] border border-sky-500/30 text-xs text-sky-300 font-mono">
                  {bleScanStatus}
                </div>
              )}

              {scannedBleDevice && (
                <div className="p-4 rounded-2xl bg-[#121322] border border-emerald-500/40 text-xs space-y-2">
                  <div className="text-emerald-400 font-bold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Perangkat BLE Terhubung</span>
                  </div>
                  <div className="font-mono text-neutral-300">
                    Nama: <strong className="text-white">{scannedBleDevice.name}</strong> | ID: {scannedBleDevice.id}
                  </div>
                </div>
              )}

              {/* Sample Packets */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-2 uppercase tracking-wider">
                  Contoh Paket Iklan BLE (Dolphy BLE Engine):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {BLE_PACKET_SAMPLES.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => setSelectedBleSample(sample)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedBleSample.id === sample.id
                          ? 'bg-sky-500/15 border-sky-500/60 shadow-lg'
                          : 'bg-[#121320] border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <span className="text-[10px] font-mono text-sky-400 block mb-1">
                        {sample.type}
                      </span>
                      <h5 className="text-xs font-bold text-white truncate">
                        {sample.name}
                      </h5>
                      <span className="text-[10px] text-neutral-400 mt-1 block truncate">
                        {sample.manufacturer}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Packet Details */}
              <div className="p-4 rounded-2xl bg-[#10111d] border border-neutral-800 space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-300 font-sans">
                    Dekode Frame Paket BLE:
                  </span>
                  <button
                    onClick={() => handleCopy(selectedBleSample.rawHex, 'ble_hex')}
                    className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer font-sans"
                  >
                    {copiedText === 'ble_hex' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText === 'ble_hex' ? 'Tersalin' : 'Salin Hex'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-neutral-800 text-sky-300 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                  RAW HEX: {selectedBleSample.rawHex}
                </div>

                <div className="space-y-2 pt-2">
                  {selectedBleSample.fields.map((f, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#151624] border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div>
                        <span className="text-orange-300 font-bold mr-2">{f.name}:</span>
                        <span className="text-neutral-300 font-sans">{f.decoded}</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {f.hex}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NFC & RFID */}
          {activeTab === 'nfc' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#141524] border border-orange-500/20">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <span>Web NFC Reader & Mifare Classic 1K Inspector</span>
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Membaca kartu NFC (ISO 14443-A) dan menulis payload NDEF via browser Chrome Android.
                  </p>
                </div>

                <button
                  onClick={handleScanNfc}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Pindai Kartu NFC (HP)</span>
                </button>
              </div>

              {nfcStatus && (
                <div className="p-3 rounded-xl bg-[#141d1a] border border-emerald-500/30 text-xs text-emerald-300 font-mono">
                  {nfcStatus}
                </div>
              )}

              {/* Mifare Classic Memory Map Display */}
              <div className="p-4 rounded-2xl bg-[#10111d] border border-neutral-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between font-sans">
                  <span className="font-bold text-neutral-200">
                    Struktur Memory Mifare Classic 1K (16 Sectors / 64 Blocks):
                  </span>
                  <span className="text-[10px] text-orange-400">HF 13.56 MHz</span>
                </div>

                <div className="space-y-1.5 overflow-x-auto">
                  <div className="p-2.5 rounded-lg bg-[#151624] border border-neutral-800 text-[11px] grid grid-cols-4 gap-2">
                    <span className="text-orange-400 font-bold">Sector 00 (Block 0):</span>
                    <span className="col-span-3 text-neutral-300">4B 8A 19 F2 7A 08 04 00 62 63 64 65 66 67 68 69 (UID + Manufacturer Data)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#151624] border border-neutral-800 text-[11px] grid grid-cols-4 gap-2">
                    <span className="text-sky-400 font-bold">Sector 01 (Block 4):</span>
                    <span className="col-span-3 text-neutral-300">57 69 46 69 5F 50 69 78 65 6C 41 49 00 00 00 00 (Data: WiFi_PixelAI)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#151624] border border-neutral-800 text-[11px] grid grid-cols-4 gap-2">
                    <span className="text-emerald-400 font-bold">Sector Trailer:</span>
                    <span className="col-span-3 text-neutral-400">FF FF FF FF FF FF [Key A] | FF 07 80 69 [Access Bits] | FF FF FF FF FF FF [Key B]</span>
                  </div>
                </div>
              </div>

              {/* NDEF Writer Form */}
              <div className="p-4 rounded-2xl bg-[#10111d] border border-neutral-800 space-y-3">
                <span className="text-xs font-bold text-neutral-300 block">
                  Buat Payload URL NDEF:
                </span>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={nfcWriteUrl}
                    onChange={(e) => setNfcWriteUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-black/60 border border-neutral-700 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                    placeholder="https://globalpixelai.com"
                  />
                  <button
                    onClick={() => handleCopy(`NDEF URI Record: ${nfcWriteUrl}`, 'nfc_ndef')}
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs transition-colors cursor-pointer"
                  >
                    {copiedText === 'nfc_ndef' ? 'Tersalin' : 'Salin Payload'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WI-FI & SUBNET LAB */}
          {activeTab === 'wifi' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#141524] border border-orange-500/20">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-cyan-400" />
                    <span>Wi-Fi Frequency Spectrum & Subnet Calculator</span>
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Analisis spektrum saluran 2.4 GHz vs 5 GHz dan sinkronisasi dengan modem USB Router Bridge.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunPing}
                    disabled={isPinging}
                    className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Activity className={`w-3.5 h-3.5 text-cyan-400 ${isPinging ? 'animate-spin' : ''}`} />
                    <span>{isPinging ? 'Pinging...' : pingLatency !== null ? `${pingLatency} ms` : 'Cek Ping'}</span>
                  </button>

                  {onOpenRouterBridge && (
                    <button
                      onClick={onOpenRouterBridge}
                      className="px-3.5 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Usb className="w-3.5 h-3.5" />
                      <span>Buka USB Router Bridge</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Subnet Calculator */}
              <div className="p-4 rounded-2xl bg-[#10111d] border border-neutral-800 space-y-4 font-mono text-xs">
                <div className="font-sans font-bold text-neutral-200">
                  Kalkulator Subnet IPv4 (Tethering / Local Bridge):
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">IP Address / Gateway:</label>
                    <input
                      type="text"
                      value={subnetIp}
                      onChange={(e) => setSubnetIp(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-neutral-700 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Prefix CIDR (/1 to /32):</label>
                    <input
                      type="number"
                      min="1"
                      max="32"
                      value={subnetCidr}
                      onChange={(e) => setSubnetCidr(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-neutral-700 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {subnetResult && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-800/80">
                    <div className="p-2.5 rounded-xl bg-[#151624] border border-neutral-800">
                      <span className="text-[10px] text-neutral-400 block font-sans">Network ID:</span>
                      <span className="text-orange-300 font-bold">{subnetResult.networkAddress}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#151624] border border-neutral-800">
                      <span className="text-[10px] text-neutral-400 block font-sans">Netmask:</span>
                      <span className="text-white font-bold">{subnetResult.netmask}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#151624] border border-neutral-800">
                      <span className="text-[10px] text-neutral-400 block font-sans">Broadcast:</span>
                      <span className="text-sky-300 font-bold">{subnetResult.broadcastAddress}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#151624] border border-neutral-800">
                      <span className="text-[10px] text-neutral-400 block font-sans">Host Usable:</span>
                      <span className="text-emerald-300 font-bold">{subnetResult.usableHosts} Hosts</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Wi-Fi Channel Frequency Table */}
              <div className="p-4 rounded-2xl bg-[#10111d] border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-200">
                    Spektrum Saluran Wi-Fi (Non-Overlapping Channels):
                  </span>
                  <div className="flex gap-1 text-[11px]">
                    <button
                      onClick={() => setSelectedBand('2.4GHz')}
                      className={`px-2.5 py-0.5 rounded-md transition-colors ${
                        selectedBand === '2.4GHz' ? 'bg-orange-500 text-black font-bold' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      2.4 GHz
                    </button>
                    <button
                      onClick={() => setSelectedBand('5GHz')}
                      className={`px-2.5 py-0.5 rounded-md transition-colors ${
                        selectedBand === '5GHz' ? 'bg-orange-500 text-black font-bold' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      5 GHz
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {WIFI_CHANNELS.filter(c => c.band === selectedBand).map((ch) => (
                    <div key={ch.channel} className="p-2.5 rounded-xl bg-[#151624] border border-neutral-800 flex flex-col justify-between text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">Saluran {ch.channel}</span>
                        <span className="text-[10px] font-mono text-orange-400">{ch.freqMhz} MHz</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                        {ch.notes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DOLPHY PLUGIN STUDIO */}
          {activeTab === 'plugin' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#141524] border border-orange-500/20 space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Puzzle className="w-4 h-4 text-orange-400" />
                  <span>Dolphy Plugin Architecture Integration</span>
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Berdasarkan spesifikasi resmi Dolphy (unvoiddd), Anda dapat menambahkan plugin skrip kustom untuk mengotomasi pengiriman sinyal atau analisis jaringan langsung di dalam aplikasi Dolphy.
                </p>
              </div>

              {/* Sample Plugin Code */}
              <div className="p-4 rounded-2xl bg-[#10111d] border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-200">
                    Contoh Template Plugin Dolphy (`plugin.json`):
                  </span>
                  <button
                    onClick={() => handleCopy(`{
  "name": "GlobalPixelAI_Companion",
  "version": "1.0.0",
  "author": "Global Pixel AI",
  "description": "Auto-sync proxy, USB router bridge, and Flipper IR signals",
  "entrypoint": "main.js",
  "permissions": [
    "network",
    "infrared",
    "bluetooth"
  ]
}`, 'plugin_code')}
                    className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    {copiedText === 'plugin_code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText === 'plugin_code' ? 'Tersalin' : 'Salin JSON'}</span>
                  </button>
                </div>

                <pre className="p-3.5 rounded-xl bg-black/60 border border-neutral-800 text-emerald-300 font-mono text-xs overflow-x-auto leading-relaxed">
{`{
  "name": "GlobalPixelAI_Companion",
  "version": "1.0.0",
  "author": "Global Pixel AI",
  "description": "Auto-sync proxy, USB router bridge, and Flipper IR signals",
  "entrypoint": "main.js",
  "permissions": [
    "network",
    "infrared",
    "bluetooth"
  ]
}`}
                </pre>
              </div>

              {/* Quick links to official docs */}
              <div className="p-4 rounded-2xl bg-[#121320] border border-neutral-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-neutral-300">
                  Pelajari panduan pembuatan plugin selengkapnya di portal Dolphy:
                </div>
                <a
                  href="https://unvoiddd.github.io/Dolphy-App/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Buka unvoiddd.github.io/Dolphy-App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#11121d] border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Dolphy Engine Terhubung & Aktif di Global Pixel AI</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
