import React, { useState } from 'react';
import { 
  X, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Copy, 
  Check, 
  ExternalLink,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { BusinessAppOutput } from '../types';

interface BusinessAppPreviewDrawerProps {
  app: BusinessAppOutput | null;
  onClose: () => void;
  onRunInSandbox?: (html: string, title?: string) => void;
}

export const BusinessAppPreviewDrawer: React.FC<BusinessAppPreviewDrawerProps> = ({
  app,
  onClose,
  onRunInSandbox,
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isCopied, setIsCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  if (!app) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(app.html);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const deviceWidthClass = 
    device === 'mobile' 
      ? 'w-[375px]' 
      : device === 'tablet' 
      ? 'w-[768px]' 
      : 'w-full';

  return (
    <div 
      className={`fixed top-0 right-0 z-50 h-full bg-[#111111] border-l border-neutral-800 shadow-2xl flex flex-col transition-all duration-300 animate-in slide-in-from-right ${
        isFullscreen ? 'w-full' : 'w-full md:w-[620px] lg:w-[720px] xl:w-[820px]'
      }`}
    >
      {/* Top Header Bar */}
      <div className="h-14 px-4 border-b border-neutral-800/90 bg-[#161616] flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
            <Sparkles className="w-4 h-4 text-sky-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800 uppercase">
                AI Argon Builder
              </span>
              <h3 className="text-xs font-bold text-white truncate max-w-[180px] sm:max-w-[260px]">
                {app.title}
              </h3>
            </div>
            <p className="text-[10px] text-neutral-400 truncate">
              {app.summary || 'Purwarupa Aplikasi Bisnis Terisolasi'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Responsive Switchers */}
          <div className="hidden sm:flex items-center bg-[#1f1f1f] rounded-lg p-0.5 border border-neutral-800">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-md transition-colors ${device === 'desktop' ? 'bg-sky-600 text-white' : 'text-neutral-400 hover:text-white'}`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded-md transition-colors ${device === 'tablet' ? 'bg-sky-600 text-white' : 'text-neutral-400 hover:text-white'}`}
              title="Tablet View"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-md transition-colors ${device === 'mobile' ? 'bg-sky-600 text-white' : 'text-neutral-400 hover:text-white'}`}
              title="Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Refresh iframe */}
          <button
            onClick={() => setIframeKey(k => k + 1)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Reload App"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Copy code */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-medium transition-colors"
            title="Salin Kode HTML"
          >
            {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{isCopied ? 'Tersalin' : 'Salin'}</span>
          </button>

          {/* Toggle Fullscreen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors hidden md:block"
            title={isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close drawer */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
            title="Tutup Jendela Pratinjau"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 bg-[#0a0a0a] p-2 sm:p-4 overflow-auto flex justify-center items-start">
        <div className={`h-full min-h-[480px] bg-white rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 border border-neutral-700 ${deviceWidthClass}`}>
          <iframe
            key={iframeKey}
            srcDoc={app.html}
            title={app.title}
            sandbox="allow-scripts allow-forms allow-modals allow-same-origin"
            className="w-full h-full border-0"
          />
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div className="h-10 px-4 bg-[#141414] border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Interactive Sandbox · Client-Authoritative Runtime</span>
        </div>
        {onRunInSandbox && (
          <button
            onClick={() => onRunInSandbox(app.html, app.title)}
            className="text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            <span>Buka di Studio Penuh</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
