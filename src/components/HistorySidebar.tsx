import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Search, 
  Clock, 
  Code2, 
  Layout, 
  Sparkles, 
  ArrowRight,
  FolderOpen
} from 'lucide-react';
import { CreationItem } from '../types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CreationItem[];
  onSelectItem: (item: CreationItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  activeItemId?: string;
  language: 'id' | 'en';
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  items,
  onSelectItem,
  onDeleteItem,
  onClearAll,
  activeItemId,
  language,
}) => {
  const isId = language !== 'en';
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.prompt.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md h-full bg-slate-950 border-l border-slate-800 p-5 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">
              {isId ? 'Galeri & Riwayat Ciptaan' : 'Creation History Vault'}
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
              {items.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="my-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isId ? 'Cari ciptaan, tag, atau kata kunci...' : 'Search creations...'}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2 py-1 pr-1">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              {isId ? 'Belum ada riwayat kreasi yang cocok.' : 'No creation history found.'}
            </div>
          ) : (
            filteredItems.map((item) => {
              const isActive = activeItemId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectItem(item);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all group flex flex-col justify-between ${
                    isActive
                      ? 'bg-indigo-950/60 border-indigo-500/60 text-white'
                      : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="font-semibold text-xs text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {item.title}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteItem(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                      title="Hapus ciptaan ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                    {item.prompt}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <div className="flex items-center gap-1">
                      {item.previewHtml ? (
                        <span className="flex items-center gap-1 text-cyan-400">
                          <Layout className="w-3 h-3" /> Sandbox
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Code2 className="w-3 h-3" /> {item.mode}
                        </span>
                      )}
                    </div>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
            <button
              onClick={onClearAll}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>{isId ? 'Kosongkan Semua' : 'Clear All'}</span>
            </button>
            <span className="text-[11px] text-slate-500">
              Tersimpan di browser lokal
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
