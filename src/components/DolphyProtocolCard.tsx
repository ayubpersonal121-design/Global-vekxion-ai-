import React, { useState } from 'react';
import { 
  Radio, 
  Wifi, 
  Cpu, 
  Tv, 
  Copy, 
  Check, 
  ExternalLink, 
  Activity, 
  ShieldCheck, 
  Terminal,
  Zap,
  Sliders,
  Maximize2,
  Download
} from 'lucide-react';
import { DolphyProtocolSimulation } from '../types';
import { transmitRfSignalChirp } from '../utils/dolphyEngine';

interface DolphyProtocolCardProps {
  simulation: DolphyProtocolSimulation;
  onOpenDolphyLab?: (initialTab?: string) => void;
}

export const DolphyProtocolCard: React.FC<DolphyProtocolCardProps> = ({ 
  simulation,
  onOpenDolphyLab 
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedFrequency, setCopiedFrequency] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'matrix' | 'raw' | 'file'>('matrix');

  const handleCopy = () => {
    try {
      const textToCopy = activeTab === 'file' 
        ? simulation.payloadData 
        : activeTab === 'raw' 
          ? (simulation.rawHexOrTimings || simulation.payloadData)
          : simulation.decodedInfo?.map(i => `${i.label}: ${i.value}`).join('\n') || simulation.payloadData;
      
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const handleDownloadFile = () => {
    try {
      const content = simulation.payloadData;
      const ext = simulation.type === 'subghz_frequency' ? 'sub' : simulation.type === 'infrared' ? 'ir' : 'txt';
      const cleanName = simulation.protocolName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
      const filename = `${cleanName}_${Date.now()}.${ext}`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Download failed:', e);
    }
  };

  const getIcon = () => {
    switch (simulation.type) {
      case 'subghz_frequency':
        return <Radio className="w-4 h-4 text-amber-400" />;
      case 'infrared':
        return <Tv className="w-4 h-4 text-orange-400" />;
      case 'bluetooth':
        return <Radio className="w-4 h-4 text-sky-400" />;
      case 'nfc':
        return <Cpu className="w-4 h-4 text-emerald-400" />;
      case 'wifi_spectrum':
        return <Wifi className="w-4 h-4 text-cyan-400" />;
      default:
        return <Zap className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="my-3.5 rounded-2xl border border-orange-500/40 bg-[#0d0e15] overflow-hidden shadow-2xl font-mono">
      {/* Top Bar Header with Dolphy Branding */}
      <div className="px-4 py-3 bg-[#161724] border-b border-orange-500/30 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {/* Dolphy Pixel Logo Indicator */}
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-400 p-[1px] flex items-center justify-center shadow-md shadow-orange-500/20">
            <span className="text-black font-black text-[10px] leading-none">🐬</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-white tracking-wide">
                Dolphy Protocol Lab
              </span>
              <span className="px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[9px] font-bold uppercase">
                v2.6 Suite
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-sans truncate">
              {simulation.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex bg-[#0f101b] rounded-lg p-0.5 border border-neutral-800 text-[10px]">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                activeTab === 'matrix' ? 'bg-orange-500 text-black font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Matrix
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                activeTab === 'raw' ? 'bg-orange-500 text-black font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Raw Frame
            </button>
            <button
              onClick={() => setActiveTab('file')}
              className={`px-2 py-0.5 rounded-md transition-colors ${
                activeTab === 'file' ? 'bg-orange-500 text-black font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {simulation.type === 'infrared' ? '.IR File' : 'Payload'}
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Salin Data Protokol"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Target & Frequency Sub-header */}
      <div className="px-4 py-2 bg-[#11121d] border-b border-neutral-800/80 text-[11px] text-neutral-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-neutral-300 font-bold">{simulation.protocolName}</span>
          {simulation.frequencyOrBand && (
            <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-orange-400 text-[10px]">
              {simulation.frequencyOrBand}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-emerald-400 text-[10px]">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>SIMULATION READY</span>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="p-4 bg-[#0a0b12] text-xs">
        {activeTab === 'matrix' && (
          <div className="space-y-2">
            {simulation.decodedInfo && simulation.decodedInfo.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {simulation.decodedInfo.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#141524] border border-neutral-800/80 space-y-1">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-sans">
                      {item.label}
                    </span>
                    <span className="text-xs text-orange-200 font-bold block truncate">
                      {item.value}
                    </span>
                    {item.detail && (
                      <span className="text-[10px] text-neutral-500 font-mono block">
                        HEX: {item.detail}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <pre className="p-3 rounded-xl bg-[#131422] border border-neutral-800 text-orange-300 text-xs overflow-x-auto whitespace-pre-wrap">
                {simulation.payloadData}
              </pre>
            )}
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="space-y-2">
            <div className="text-[11px] text-neutral-400 font-sans mb-1">
              Raw Pulse / Hex Stream Frame:
            </div>
            <pre className="p-3 rounded-xl bg-[#131422] border border-orange-500/20 text-sky-300 text-xs overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
              {simulation.rawHexOrTimings || simulation.payloadData}
            </pre>
          </div>
        )}

        {activeTab === 'file' && (
          <div className="space-y-2">
            <div className="text-[11px] text-neutral-400 font-sans flex items-center justify-between">
              <span>Format Kompatibel Dolphy / Flipper Zero:</span>
              <span className="text-orange-400 text-[10px] font-mono">Flipper Zero Ready</span>
            </div>
            <pre className="p-3 rounded-xl bg-[#131422] border border-neutral-800 text-emerald-300 text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-52 font-mono">
              {simulation.payloadData}
            </pre>
          </div>
        )}

        {/* Flipper Frequency Quick Copy & Action Ribbon */}
        <div className="mt-3 pt-3 border-t border-neutral-800/80 flex flex-wrap items-center gap-2">
          {simulation.frequencyOrBand && (
            <button
              onClick={() => {
                const freqStr = simulation.frequencyOrBand?.split(' ')[0] || simulation.frequencyOrBand || '';
                navigator.clipboard.writeText(freqStr);
                setCopiedFrequency(true);
                setTimeout(() => setCopiedFrequency(false), 2000);
              }}
              className="px-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 text-orange-300 font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title="Salin Angka Frekuensi"
            >
              {copiedFrequency ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFrequency ? 'Frekuensi Tersalin!' : `Salin Frekuensi (${simulation.frequencyOrBand.split(' ')[0]})`}</span>
            </button>
          )}

          <button
            onClick={() => {
              const is38k = simulation.frequencyOrBand?.includes('38') || simulation.type === 'infrared';
              transmitRfSignalChirp(is38k ? 38000 : 433920000);
              setIsReplaying(true);
              setTimeout(() => setIsReplaying(false), 600);
            }}
            disabled={isReplaying}
            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
              isReplaying 
                ? 'bg-amber-400 text-black animate-pulse'
                : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
            }`}
            title="Pancarkan ulang modulasi frekuensi"
          >
            <Zap className={`w-3.5 h-3.5 ${isReplaying ? 'text-black' : 'text-amber-400'}`} />
            <span>{isReplaying ? 'Pancaran Aktif...' : 'Pancar Ulang Sinyal'}</span>
          </button>

          <button
            onClick={handleDownloadFile}
            className="px-3 py-1.5 rounded-xl bg-[#161828] hover:bg-[#1e2036] border border-sky-500/40 text-sky-300 font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ml-auto"
            title="Unduh Berkas untuk Flipper Zero / Dolphy"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Berkas {simulation.type === 'subghz_frequency' ? '.sub' : simulation.type === 'infrared' ? '.ir' : 'File'}</span>
          </button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-2.5 bg-[#121320] border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[10px] text-neutral-400 font-sans flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
          <span>Kompatibel 100% dengan Flipper Zero & Dolphy App Android</span>
        </div>

        {onOpenDolphyLab && (
          <button
            onClick={() => onOpenDolphyLab(simulation.type === 'subghz_frequency' ? 'subghz' : simulation.type)}
            className="px-3 py-1 rounded-lg bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-black font-extrabold text-[11px] flex items-center gap-1.5 transition-all shadow-md shadow-orange-950/40 active:scale-95 cursor-pointer"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Buka di Flipper & Dolphy Lab Penuh</span>
          </button>
        )}
      </div>
    </div>
  );
};
