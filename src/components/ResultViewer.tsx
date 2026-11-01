import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  Download, 
  Volume2, 
  VolumeX, 
  BrainCircuit, 
  Code2, 
  Layout, 
  FileText, 
  Send, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Layers,
  Lock
} from 'lucide-react';
import { CreationItem, CodeBlock } from '../types';

interface ResultViewerProps {
  item: CreationItem;
  onIterate: (instruction: string) => void;
  isIterating: boolean;
  language: 'id' | 'en';
  isFree?: boolean;
  onRequireUpgrade?: (message: string) => void;
  onOpenProLauncher?: () => void;
  onDownloadComplete?: () => void;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({
  item,
  onIterate,
  isIterating,
  language,
  isFree = false,
  onRequireUpgrade,
  onOpenProLauncher,
  onDownloadComplete,
}) => {
  const isId = language !== 'en';
  
  // Default tab: if previewHtml exists, open 'preview'; otherwise 'content'
  const [activeTab, setActiveTab] = useState<'preview' | 'content' | 'code' | 'reasoning'>(
    item.previewHtml ? 'preview' : 'content'
  );
  
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sandboxKey, setSandboxKey] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showReasoning, setShowReasoning] = useState(true);
  const [refinePrompt, setRefinePrompt] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // If item changes, reset tab to preview if available
  useEffect(() => {
    if (item.previewHtml) {
      setActiveTab('preview');
    } else {
      setActiveTab('content');
    }
  }, [item.id]);

  // Copy handler
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Download handler
  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Trigger popup persyaratan after user finishes downloading!
    setTimeout(() => {
      onDownloadComplete?.();
    }, 400);
  };

  // Text-to-speech handler
  const handleToggleSpeech = () => {
    if (isFree) {
      onRequireUpgrade?.(isId ? 'Fitur Audio Reader (TTS) membutuhkan akun Premium.' : 'Audio Reader (TTS) requires a Premium account.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead = item.content.replace(/[#*`_\[\]()]/g, '').slice(0, 800);
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = isId ? 'id-ID' : 'en-US';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Format simple markdown into JSX
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-3 leading-relaxed text-slate-200">
        {lines.map((line, idx) => {
          // Headers
          if (line.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-xl sm:text-2xl font-bold text-white border-b border-slate-800 pb-2 mt-4 first:mt-0">
                {line.replace('# ', '')}
              </h1>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-lg sm:text-xl font-bold text-cyan-300 mt-4 mb-2">
                {line.replace('## ', '')}
              </h2>
            );
          }
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-base sm:text-lg font-semibold text-indigo-300 mt-3 mb-1">
                {line.replace('### ', '')}
              </h3>
            );
          }
          // Blockquotes
          if (line.startsWith('> ')) {
            return (
              <blockquote key={idx} className="pl-3 border-l-2 border-cyan-500/60 text-slate-400 italic my-2">
                {line.replace('> ', '')}
              </blockquote>
            );
          }
          // Bullet points
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 text-sm pl-2">
                <span className="text-cyan-400 mt-1">✦</span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(line.trim().replace(/^[-*]\s+/, '')) }} />
              </div>
            );
          }
          // Numbered list
          if (/^\d+\.\s/.test(line.trim())) {
            return (
              <div key={idx} className="flex items-start gap-2 text-sm pl-2">
                <span className="font-mono text-indigo-400 font-bold">{line.match(/^\d+\./)?.[0]}</span>
                <span dangerouslySetInnerHTML={{ __html: formatInline(line.replace(/^\d+\.\s+/, '')) }} />
              </div>
            );
          }
          // Empty line
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
          }
          // Standard Paragraph
          return (
            <p key={idx} className="text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
          );
        })}
      </div>
    );
  };

  const formatInline = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-slate-200">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 font-mono text-xs border border-slate-800">$1</code>');
  };

  return (
    <div className={`rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col transition-all ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-slate-950 p-4' : 'w-full'
    }`}>
      {/* 1. Header Toolbar */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 rounded-t-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{item.title}</span>
            </h2>
            <div className="flex items-center gap-1.5">
              {item.tags.map((t, idx) => (
                <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
            Prompt: "{item.prompt}"
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Pro File Launcher */}
          {onOpenProLauncher && (
            <button
              onClick={() => {
                if (isFree) {
                  onRequireUpgrade?.(isId ? 'Pro File Launcher membutuhkan akun Premium.' : 'Pro File Launcher requires a Premium account.');
                  return;
                }
                onOpenProLauncher();
              }}
              className="p-2 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/50 text-amber-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Pro File Launcher"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline font-semibold">Pro Launcher</span>
              {isFree && <Lock className="w-3 h-3 text-amber-400" />}
            </button>
          )}

          {/* TTS Audio */}
          <button
            onClick={handleToggleSpeech}
            className={`p-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors border ${
              isSpeaking
                ? 'bg-rose-950/70 border-rose-600 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Bacakan Ringkasan (Text-to-Speech)"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            <span className="hidden sm:inline">{isSpeaking ? 'Berhenti' : 'Dengar'}</span>
            {isFree && <Lock className="w-3 h-3 text-amber-400" />}
          </button>

          {/* Copy Artifact */}
          <button
            onClick={() => handleCopy(item.rawOutput || item.content, 'full')}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
            title="Salin Semua Konten"
          >
            {copiedId === 'full' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline">{copiedId === 'full' ? 'Tersalin' : 'Salin'}</span>
          </button>

          {/* Download Artifact */}
          <button
            onClick={() => {
              if (item.previewHtml) {
                handleDownload(item.previewHtml, `${item.title.toLowerCase().replace(/\s+/g, '-')}.html`);
              } else if (item.codeBlocks.length > 0) {
                const primary = item.codeBlocks[0];
                handleDownload(primary.code, primary.filename || 'solution.txt');
              } else {
                handleDownload(item.content, 'creation.md');
              }
            }}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
            title="Unduh Berkas Solusi"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">{isId ? 'Unduh' : 'Download'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
            title={isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Reasoning Accordion (o1 / Astro style Thinking Chain) */}
      {item.reasoning && (
        <div className="border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>{isId ? 'Rantai Penalaran Kognitif (Thinking Protocol · Astro/o1 Tier)' : 'Cognitive Reasoning Chain (Astro/o1 Protocol)'}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                VERIFIED
              </span>
            </div>
            {showReasoning ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showReasoning && (
            <div className="px-4 pb-4 pt-1">
              <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800/80 font-mono text-xs text-slate-400 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                {item.reasoning}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Navigation Tabs */}
      <div className="flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/20">
        <div className="flex items-center gap-1 py-2">
          {item.previewHtml && (
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'preview'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>{isId ? 'Live Sandbox (Interaktif)' : 'Live Sandbox (Interactive)'}</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'content'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isId ? 'Penjelasan & Dokumen' : 'Overview & Docs'}</span>
          </button>

          {item.codeBlocks.length > 0 && (
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'code'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{isId ? `Kode Sumber (${item.codeBlocks.length})` : `Source Code (${item.codeBlocks.length})`}</span>
            </button>
          )}

          {item.imageUrl && (
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Visual Art</span>
            </button>
          )}
        </div>

        {/* Sandbox controls when in Preview mode */}
        {activeTab === 'preview' && item.previewHtml && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSandboxKey((k) => k + 1)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs flex items-center gap-1 transition-colors"
              title="Mulai Ulang Sandbox"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Reset Sandbox</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Main Body Content Area */}
      <div className={`p-4 flex-1 overflow-y-auto ${isFullscreen ? 'h-[calc(100vh-220px)]' : 'min-h-[440px] max-h-[680px]'}`}>
        {/* Tab 1: Live Interactive Sandbox */}
        {activeTab === 'preview' && (
          <div className="w-full h-full flex flex-col gap-3">
            {item.imageUrl && (
              <div className="w-full flex justify-center py-4 bg-slate-950 rounded-xl border border-slate-800">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="max-h-[500px] rounded-lg shadow-2xl object-contain"
                />
              </div>
            )}

            {item.previewHtml && (
              <div className="w-full flex-1 rounded-xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950 relative min-h-[460px]">
                <iframe
                  ref={iframeRef}
                  key={sandboxKey}
                  srcDoc={item.previewHtml}
                  sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                  title="Interactive Sandbox"
                  className="w-full h-full min-h-[460px] border-none"
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Overview & Markdown Documentation */}
        {activeTab === 'content' && (
          <div className="space-y-4 max-w-4xl mx-auto py-2">
            {renderMarkdown(item.content)}
          </div>
        )}

        {/* Tab 3: Source Code Blocks */}
        {activeTab === 'code' && (
          <div className="space-y-6">
            {item.codeBlocks.map((block, idx) => (
              <div key={idx} className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-lg">
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono text-xs font-semibold text-slate-200">
                      {block.filename || `File ${idx + 1}`}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                      {block.language}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(block.code, `code_${idx}`)}
                      className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      {copiedId === `code_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === `code_${idx}` ? 'Tersalin' : 'Salin'}</span>
                    </button>
                    <button
                      onClick={() => handleDownload(block.code, block.filename || `snippet.${block.language}`)}
                      className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Unduh File Ini"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed bg-slate-950">
                  <code>{block.code}</code>
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Follow-Up Refinement / Iteration Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/70 rounded-b-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (refinePrompt.trim() && !isIterating) {
              onIterate(refinePrompt);
              setRefinePrompt('');
            }
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={refinePrompt}
              onChange={(e) => setRefinePrompt(e.target.value)}
              placeholder={isId ? 'Kembangkan ciptaan ini: "Tambahkan fitur X", "Ubah styling", "Optimalkan algoritma"...' : 'Iterate on this build: "Add feature X", "Optimize queries", "Polish UI"...'}
              disabled={isIterating}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors pr-8"
            />
          </div>
          <button
            type="submit"
            disabled={isIterating || !refinePrompt.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-indigo-900/30 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isId ? 'Kembangkan' : 'Refine'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
