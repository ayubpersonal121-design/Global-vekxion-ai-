import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  ShieldCheck, 
  Download, 
  Crown, 
  KeyRound, 
  FileText, 
  PanelLeftClose, 
  PanelLeft, 
  Search,
  Sparkles,
  ExternalLink,
  Share2,
  Check,
  Globe
} from 'lucide-react';
import { ChatSession, PlanId } from '../types';

interface ChatGptSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  currentPlanId: PlanId;
  onOpenPricing: () => void;
  onOpenAdmin: () => void;
  onOpenInstall: () => void;
  onOpenLegal: (tab: 'privacy' | 'terms') => void;
  onOpenPersyaratan?: () => void;
  freeMessagesUsed: number;
  freeMessageLimit: number;
}

export const ChatGptSidebar: React.FC<ChatGptSidebarProps> = ({
  isOpen,
  onToggle,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  currentPlanId,
  onOpenPricing,
  onOpenAdmin,
  onOpenInstall,
  onOpenLegal,
  onOpenPersyaratan,
  freeMessagesUsed,
  freeMessageLimit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);
  const isFree = currentPlanId === 'free';

  const handleShare = async () => {
    try {
      const shareData = {
        title: 'VEXION AI',
        text: 'Aplikasi VEXION AI – Gemini 4 Argon & ChatGPT generasi apex untuk simulasi aplikasi, game, website, dan strategi iklan bisnis.',
        url: window.location.href,
      };
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      }
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onToggle}
          className="fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity"
        />
      )}

      {/* Collapsible Sidebar Container (#171717 panel) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 bg-[#171717] border-r border-neutral-800/80 flex flex-col transition-all duration-200 select-none ${
          isOpen ? 'w-64 sm:w-72 translate-x-0' : 'w-0 -translate-x-full md:w-0 md:translate-x-0 overflow-hidden'
        }`}
      >
        {/* Top: New Chat & Toggle */}
        <div className="p-3 border-b border-neutral-800/80 flex items-center justify-between gap-2">
          <button
            onClick={onNewChat}
            className="flex-1 flex items-center justify-between px-3 py-2 rounded-xl bg-[#202020] hover:bg-[#282828] border border-neutral-700/60 text-white text-xs font-semibold transition-all shadow-sm group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-sky-400 group-hover:rotate-90 transition-transform" />
              <span>New Chat</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">Ctrl+O</span>
          </button>

          <button
            onClick={onToggle}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Close Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Search Chat History */}
        <div className="px-3 pt-3 pb-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chat history..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#111111] border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-sky-500/50"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          <div className="px-2 py-1 text-[11px] font-medium text-neutral-500">
            Recent Chats
          </div>

          {filteredSessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-neutral-500">
              No chats found.
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-[#262626] text-white font-medium'
                      : 'text-neutral-400 hover:bg-[#202020] hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-6">
                    <MessageSquare className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span className="truncate">{session.title || 'New Conversation'}</span>
                  </div>

                  {/* Delete button on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-rose-400 transition-opacity rounded"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Developer Attribution Card: Ayyub Kenda Pratama */}
        <div className="mx-2 mb-2 p-2.5 rounded-xl bg-gradient-to-r from-sky-950/50 via-indigo-950/40 to-[#181818] border border-sky-500/30 text-neutral-300 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500/30 to-indigo-500/30 border border-sky-400/50 flex items-center justify-center text-sky-300 font-bold text-xs shrink-0 shadow-inner">
              AKP
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400 font-semibold">
                  Lead Developer
                </span>
                <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Author
                </span>
              </div>
              <div className="text-xs font-bold text-white truncate">
                Ayyub Kenda Pratama
              </div>
            </div>
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-sky-500/20 text-[10px] text-neutral-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-400 shrink-0" />
            <span className="truncate">Pencipta & Pengembang Resmi</span>
          </div>
        </div>

        {/* Sidebar Base: User Status, Install App, Admin Backdoor & Legal Links */}
        <div className="p-3 border-t border-neutral-800/80 bg-[#141414] space-y-2">
          {/* Plan Status Banner */}
          <div 
            onClick={onOpenPricing}
            className="p-2.5 rounded-xl bg-[#1d1d1d] hover:bg-[#232323] border border-neutral-700/60 cursor-pointer transition-colors group flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="leading-tight">
                <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                  {isFree ? 'Free Tier' : 'Premium Pro Active'}
                </div>
                <div className="text-[10px] text-neutral-400">
                  {isFree ? `${freeMessagesUsed}/${freeMessageLimit} msgs used` : 'Unlimited Messages'}
                </div>
              </div>
            </div>
            {isFree && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Upgrade
              </span>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={onOpenInstall}
              className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-[11px] text-emerald-300 font-bold transition-all border border-emerald-500/40 cursor-pointer shadow-sm shadow-emerald-950/40"
              title="Download & Pasang VEXION AI (PWA)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download App</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl bg-sky-950/40 hover:bg-sky-900/50 text-[11px] text-sky-300 font-bold transition-all border border-sky-500/40 cursor-pointer shadow-sm shadow-sky-950/40"
              title="Bagikan Tautan Web Publik & Aplikasi"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>Bagikan Web</span>
                </>
              )}
            </button>
          </div>

          {/* Embedded Legal Links (Specification 4: fully written links) */}
          {onOpenPersyaratan && (
            <div className="pt-2 border-t border-neutral-800/60 pb-1 text-center">
              <button
                onClick={onOpenPersyaratan}
                className="w-full py-1 text-[11px] text-sky-400 hover:text-sky-300 hover:underline transition-colors cursor-pointer flex items-center justify-center gap-1 font-semibold"
              >
                <ShieldCheck className="w-3 h-3 text-sky-400" />
                <span>Persyaratan & Privasi Pembuat</span>
              </button>
            </div>
          )}

          <div className="pt-1 border-t border-neutral-800/40 flex items-center justify-between text-[11px] text-neutral-400 px-1">
            <button
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-sky-400 hover:underline transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <button
              onClick={() => onOpenLegal('terms')}
              className="hover:text-sky-400 hover:underline transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
