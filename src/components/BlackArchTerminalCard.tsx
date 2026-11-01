import React, { useState } from 'react';
import { 
  Terminal, 
  ShieldCheck, 
  ShieldAlert, 
  Wifi, 
  Key, 
  Search, 
  Network, 
  Copy, 
  Check, 
  ExternalLink,
  Zap,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { BlackArchSimulation, BlackArchToolType } from '../types';

interface BlackArchTerminalCardProps {
  simulation: BlackArchSimulation;
}

export const BlackArchTerminalCard: React.FC<BlackArchTerminalCardProps> = ({ simulation }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'terminal' | 'report'>('terminal');

  const handleCopyLogs = () => {
    try {
      navigator.clipboard.writeText(simulation.logs.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const toolIcon = 
    simulation.tool === 'aircrack' ? <Wifi className="w-4 h-4 text-cyan-400" /> :
    simulation.tool === 'hydra' ? <Key className="w-4 h-4 text-amber-400" /> :
    simulation.tool === 'nmap' ? <Network className="w-4 h-4 text-emerald-400" /> :
    <Search className="w-4 h-4 text-purple-400" />;

  const toolName = 
    simulation.tool === 'aircrack' ? 'Aircrack-ng v1.7 (Wireless Security)' :
    simulation.tool === 'hydra' ? 'THC-Hydra v9.5 (Network Logon Brute)' :
    simulation.tool === 'nmap' ? 'BlackArch Network Mapper v7.93' :
    'Sherlock OSINT v0.14.3 (Profile Hunter)';

  return (
    <div className="my-3.5 rounded-2xl border border-cyan-500/30 bg-[#0c0d14] overflow-hidden shadow-2xl font-mono">
      {/* Top Bar Header */}
      <div className="px-4 py-2.5 bg-[#141520] border-b border-neutral-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500 inline-block"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500 inline-block"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></div>
          <span className="text-[11px] text-cyan-400 font-bold ml-2 flex items-center gap-1.5">
            {toolIcon}
            <span>{toolName}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#1a1b28] rounded-lg p-0.5 border border-neutral-800 text-[10px]">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-2 py-0.5 rounded-md transition-colors ${activeTab === 'terminal' ? 'bg-cyan-500 text-black font-bold' : 'text-neutral-400 hover:text-white'}`}
            >
              Terminal
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`px-2 py-0.5 rounded-md transition-colors ${activeTab === 'report' ? 'bg-cyan-500 text-black font-bold' : 'text-neutral-400 hover:text-white'}`}
            >
              Intelligence
            </button>
          </div>

          <button
            onClick={handleCopyLogs}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Salin Log Terminal"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Target Specifier */}
      <div className="px-4 py-1.5 bg-[#10111a] border-b border-neutral-800/80 text-[11px] text-neutral-400 flex items-center justify-between">
        <div>
          TARGET: <span className="text-white font-bold">{simulation.target}</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-400 text-[10px]">
          <Activity className="w-3 h-3 animate-pulse" />
          <span>CYBER-ACTIVE</span>
        </div>
      </div>

      {/* Terminal View */}
      {activeTab === 'terminal' && (
        <div className="p-4 bg-[#08080d] max-h-64 overflow-y-auto text-xs text-neutral-300 space-y-1 scrollbar-thin scrollbar-thumb-neutral-800 leading-relaxed">
          {simulation.logs.map((log, index) => {
            const isError = log.includes('[!]') || log.includes('CRITICAL') || log.includes('ERROR');
            const isSuccess = log.includes('[+]') || log.includes('FOUND') || log.includes('SUCCESS');
            const isPrompt = log.startsWith('$') || log.startsWith('#');

            return (
              <div 
                key={index} 
                className={`${
                  isError ? 'text-rose-400' :
                  isSuccess ? 'text-emerald-400 font-bold' :
                  isPrompt ? 'text-cyan-300 font-bold' :
                  'text-neutral-300'
                }`}
              >
                {log}
              </div>
            );
          })}
        </div>
      )}

      {/* Report / Intelligence View */}
      {activeTab === 'report' && (
        <div className="p-4 bg-[#0a0b12] space-y-3 text-xs">
          {simulation.findings && simulation.findings.length > 0 && (
            <div>
              <h5 className="text-[11px] text-neutral-400 uppercase font-bold mb-2">Audit Telemetry & Risk Matrix:</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {simulation.findings.map((f, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-[#13141f] border border-neutral-800 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400">{f.label}:</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      f.status === 'safe' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      f.status === 'warning' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      f.status === 'critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}>
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {simulation.osintProfiles && simulation.osintProfiles.length > 0 && (
            <div>
              <h5 className="text-[11px] text-neutral-400 uppercase font-bold mb-2">Public OSINT Profiles Discovered:</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {simulation.osintProfiles.map((p, i) => (
                  <a 
                    key={i} 
                    href={p.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-[#13141f] border border-neutral-800 hover:border-cyan-500/50 flex items-center justify-between group transition-colors"
                  >
                    <span className="font-bold text-white text-[11px] group-hover:text-cyan-400">{p.platform}</span>
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <span>HTTP {p.status}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div className="px-4 py-2 bg-[#10111a] border-t border-neutral-800/80 text-[10px] text-neutral-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-neutral-400">
          <ShieldCheck className="w-3 h-3 text-cyan-400" />
          <span>BlackArch Linux Cyber Assessment Suite</span>
        </span>
        <span className="text-cyan-500/80 font-mono">
          VEXION CYBER ENGINE
        </span>
      </div>
    </div>
  );
};
