import React, { useState } from 'react';
import { 
  Gamepad2, 
  Layout, 
  Globe, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  Smartphone, 
  Monitor,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { InteractiveSandboxItem } from '../types';

interface LivePreviewSandboxProps {
  item: InteractiveSandboxItem;
}

export const LivePreviewSandbox: React.FC<LivePreviewSandboxProps> = ({ item }) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(item.html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  const badgeIcon = 
    item.type === 'game' ? <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" /> :
    item.type === 'website' ? <Globe className="w-3.5 h-3.5 text-indigo-400" /> :
    <Layout className="w-3.5 h-3.5 text-emerald-400" />;

  const badgeColor =
    item.type === 'game' ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300' :
    item.type === 'website' ? 'bg-indigo-950/80 border-indigo-500/40 text-indigo-300' :
    'bg-emerald-950/80 border-emerald-500/40 text-emerald-300';

  const containerHeight = item.type === 'game' ? 'h-[440px]' : item.type === 'website' ? 'h-[520px]' : 'h-[460px]';

  return (
    <div 
      className={`my-3 rounded-2xl border border-neutral-800 bg-[#121319] overflow-hidden shadow-2xl transition-all duration-300 ${
        isFullscreen ? 'fixed inset-3 z-50 flex flex-col bg-[#0b0c10] border-cyan-500/50' : 'w-full'
      }`}
    >
      {/* Sandbox Header Bar */}
      <div className="px-3.5 py-2.5 bg-[#171822] border-b border-neutral-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`px-2 py-0.5 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1.5 shrink-0 ${badgeColor}`}>
            {badgeIcon}
            <span className="uppercase">{item.type === 'game' ? 'Playable Game' : item.type === 'website' ? 'Live Website' : 'Live App'}</span>
          </div>
          <h4 className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs">
            {item.title}
          </h4>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Responsive Device Toggle */}
          <div className="hidden sm:flex items-center bg-[#1f202e] rounded-lg p-0.5 border border-neutral-800">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1 rounded-md text-xs transition-colors ${device === 'desktop' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-neutral-400 hover:text-white'}`}
              title="Desktop Viewport"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1 rounded-md text-xs transition-colors ${device === 'mobile' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-neutral-400 hover:text-white'}`}
              title="Mobile Viewport"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Restart / Reload Sandbox */}
          <button
            onClick={() => setIframeKey(k => k + 1)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-cyan-400 hover:bg-neutral-800 transition-colors"
            title="Restart / Reload Sandbox"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Copy Source Code */}
          <button
            onClick={handleCopy}
            className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-medium transition-colors flex items-center gap-1"
            title="Salin Kode HTML Sandbox"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Live Interactive Viewport */}
      <div className={`bg-[#0a0a0f] p-2 flex items-center justify-center overflow-auto ${isFullscreen ? 'flex-1' : containerHeight}`}>
        <div 
          className={`h-full bg-white rounded-xl overflow-hidden shadow-2xl transition-all duration-300 border border-neutral-700/60 ${
            device === 'mobile' ? 'w-[360px] max-w-full' : 'w-full'
          }`}
        >
          <iframe
            key={iframeKey}
            srcDoc={item.html}
            title={item.title}
            sandbox="allow-scripts allow-forms allow-modals allow-same-origin"
            className="w-full h-full border-0"
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-3 py-1.5 bg-[#14151e] border-t border-neutral-800/80 text-[10px] text-neutral-400 flex items-center justify-between">
        <span className="flex items-center gap-1 text-cyan-400 font-mono">
          <Sparkles className="w-3 h-3" />
          <span>Vexion AI Core Simulation Engine</span>
        </span>
        <span className="text-neutral-500 hidden sm:inline">
          Interactive Client-Side Sandbox · Zero External Dependencies
        </span>
      </div>
    </div>
  );
};
