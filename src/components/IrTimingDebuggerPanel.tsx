import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  Sliders, 
  Clock, 
  Radio, 
  Info,
  Maximize2,
  Filter,
  Search
} from 'lucide-react';
import { 
  IrPulseItem, 
  IrTimingAnalysisReport, 
  executeLiveBrowserIrTimingProbe 
} from '../utils/irTimingDebugger';
import { IrPreset } from '../utils/dolphyEngine';

interface IrTimingDebuggerPanelProps {
  preset: IrPreset;
  onDownloadIr?: (preset: IrPreset) => void;
}

export const IrTimingDebuggerPanel: React.FC<IrTimingDebuggerPanelProps> = ({
  preset,
  onDownloadIr
}) => {
  const [report, setReport] = useState<IrTimingAnalysisReport | null>(null);
  const [isRunningProbe, setIsRunningProbe] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'MARK' | 'SPACE' | 'WARNING'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedPulse, setSelectedPulse] = useState<IrPulseItem | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize report on mount or when preset changes
  useEffect(() => {
    runProbeTest(false);
  }, [preset.id]);

  const runProbeTest = async (withAudioChirp: boolean = true) => {
    setIsRunningProbe(true);
    try {
      const result = await executeLiveBrowserIrTimingProbe(
        preset.protocol,
        preset.address,
        preset.command,
        preset.frequency || 38000
      );
      setReport(result);
      if (result.pulses.length > 0) {
        setSelectedPulse(result.pulses[0]);
      }
    } catch (err) {
      console.warn('Probe error:', err);
    } finally {
      setIsRunningProbe(false);
    }
  };

  // Draw Logic Analyzer Waveform on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !report || report.pulses.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = '#0b0c16';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#1a1c30';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < width; x += 40) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += 20) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Logic Analyzer Levels
    const highY = 24;
    const lowY = height - 24;
    const totalDuration = report.totalDurationUs || 67000;
    const effectiveWidth = width * zoomLevel;

    // Time to X coordinate mapper
    const timeToX = (us: number) => (us / totalDuration) * (effectiveWidth - 40) + 20;

    // Draw Pulse Train
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let currentX = 20;
    let currentY = lowY;
    ctx.moveTo(currentX, currentY);

    for (let i = 0; i < report.pulses.length; i++) {
      const p = report.pulses[i];
      const pulseStartX = timeToX(p.timestampOffsetUs);
      const pulseEndX = timeToX(p.timestampOffsetUs + p.measuredDurationUs);
      const targetY = p.level === 'HIGH' ? highY : lowY;

      // Vertical transition line
      ctx.lineTo(pulseStartX, targetY);
      // Horizontal duration line
      ctx.lineTo(pulseEndX, targetY);

      currentX = pulseEndX;
      currentY = targetY;
    }
    ctx.strokeStyle = '#f97316'; // Orange waveform
    ctx.stroke();

    // Fill under HIGH pulses with subtle glow
    for (let i = 0; i < report.pulses.length; i++) {
      const p = report.pulses[i];
      if (p.level === 'HIGH') {
        const x1 = timeToX(p.timestampOffsetUs);
        const x2 = timeToX(p.timestampOffsetUs + p.measuredDurationUs);
        const w = Math.max(1, x2 - x1);

        ctx.fillStyle = p.status === 'JITTER_WARNING' 
          ? 'rgba(239, 68, 68, 0.25)' 
          : p.status === 'ACCEPTABLE'
          ? 'rgba(234, 179, 8, 0.2)'
          : 'rgba(249, 115, 22, 0.18)';
        ctx.fillRect(x1, highY, w, lowY - highY);

        // Marker label on top of pulse
        if (w > 12) {
          ctx.fillStyle = '#f97316';
          ctx.font = '9px monospace';
          ctx.fillText(`${p.measuredDurationUs}µs`, x1 + 2, highY - 6);
        }
      }
    }

    // Microsecond Ruler on bottom
    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.fillText('0 ms', 20, height - 6);
    ctx.fillText(`${(totalDuration / 2000).toFixed(1)} ms`, effectiveWidth / 2, height - 6);
    ctx.fillText(`${(totalDuration / 1000).toFixed(1)} ms`, Math.min(width - 60, effectiveWidth - 40), height - 6);

  }, [report, zoomLevel]);

  const handleCopyText = (text: string, key: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const handleExportCsv = () => {
    if (!report) return;
    let csv = 'Index,Stage,Level,Bit,Expected_us,Measured_us,Deviation_us,Deviation_pct,CarrierCycles,Status,Notes\n';
    for (const p of report.pulses) {
      csv += `${p.index},"${p.stage}",${p.level},${p.bitIndex ?? ''},${p.expectedDurationUs},${p.measuredDurationUs},${p.deviationUs},${p.deviationPercent}%,${p.carrierCycles},${p.status},"${p.notes}"\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ir_timing_debug_${preset.id}_38khz.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ir_timing_report_${preset.id}_38khz.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered Pulses for Table
  const filteredPulses = (report?.pulses || []).filter(p => {
    if (filterType === 'MARK' && p.level !== 'HIGH') return false;
    if (filterType === 'SPACE' && p.level !== 'LOW') return false;
    if (filterType === 'WARNING' && p.status === 'EXACT') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.stage.toLowerCase().includes(q) ||
        p.notes.toLowerCase().includes(q) ||
        String(p.index).includes(q) ||
        String(p.measuredDurationUs).includes(q)
      );
    }
    return true;
  });

  return (
    <div className="rounded-2xl bg-[#0e0f1c] border border-orange-500/30 overflow-hidden shadow-2xl font-sans mt-4">
      {/* Header Bar */}
      <div className="p-4 bg-gradient-to-r from-[#17192b] via-[#131424] to-[#10111f] border-b border-orange-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-400">
              <Activity className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-black text-white tracking-wide flex items-center gap-2">
              <span>Debug Log Timing Pulsa IR (Mark / Space) & Analisis Noise 38kHz</span>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-[10px] font-mono text-orange-300">
                Dolphy Logic Probe v2.6
              </span>
            </h4>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Memonitor mikrosekon timing <strong>Mark (Burst ON)</strong> & <strong>Space (Idle OFF)</strong>, verifikasi clock AudioContext browser, serta deteksi jitter & artefak aliasing DAC hardware.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => runProbeTest(true)}
            disabled={isRunningProbe}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
              isRunningProbe
                ? 'bg-orange-400 text-black animate-pulse'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black shadow-orange-950/40'
            }`}
            title="Kirim burst audio & ukur microsecond timing"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span>{isRunningProbe ? 'Probing 38kHz...' : '⚡ Uji Presisi Timing 38kHz'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title="Ekspor CSV untuk Excel / PulseView"
          >
            <Download className="w-3 h-3 text-sky-400" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title="Ekspor JSON Telemetri"
          >
            <Download className="w-3 h-3 text-amber-400" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      {report && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 p-4 bg-[#111222] border-b border-neutral-800 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-black/40 border border-neutral-800">
            <span className="text-[10px] text-neutral-400 block">Frekuensi Pembawa</span>
            <span className="text-sm font-bold text-orange-400">
              {(report.targetFrequencyHz / 1000).toFixed(2)} kHz
            </span>
            <span className="text-[9px] text-neutral-500 block">T = {report.periodUs} µs</span>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-neutral-800">
            <span className="text-[10px] text-neutral-400 block">DAC Sample Rate</span>
            <span className="text-sm font-bold text-sky-400">
              {report.hardwareSampleRate.toLocaleString()} Hz
            </span>
            <span className="text-[9px] text-neutral-500 block">Nyquist: {(report.nyquistFrequencyHz / 1000).toFixed(1)} kHz</span>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-neutral-800">
            <span className="text-[10px] text-neutral-400 block">Presisi Timing Logika</span>
            <span className={`text-sm font-bold ${
              report.timingPrecisionScore >= 95 ? 'text-emerald-400' : report.timingPrecisionScore >= 85 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {report.timingPrecisionScore}%
            </span>
            <span className="text-[9px] text-neutral-500 block">RMS: ±{report.rmsJitterUs} µs</span>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-neutral-800">
            <span className="text-[10px] text-neutral-400 block">Total Pulsa / Durasi</span>
            <span className="text-sm font-bold text-white">
              {report.pulseCount} Pulsa
            </span>
            <span className="text-[9px] text-neutral-500 block">{(report.totalDurationUs / 1000).toFixed(2)} ms frame</span>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-neutral-800">
            <span className="text-[10px] text-neutral-400 block">Rata-rata Jitter</span>
            <span className="text-sm font-bold text-amber-400">
              {report.averageMarkJitterUs} µs (Mark)
            </span>
            <span className="text-[9px] text-neutral-500 block">Spasi: {report.averageSpaceJitterUs} µs</span>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-neutral-800">
            <span className="text-[10px] text-neutral-400 block">Status Noise Browser</span>
            <span className={`text-xs font-bold flex items-center gap-1 ${
              report.aliasingRisk === 'CRITICAL_ALIASING' ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {report.aliasingRisk === 'CRITICAL_ALIASING' ? '⚠️ Aliasing Audio' : '✅ Bersih'}
            </span>
            <span className="text-[9px] text-neutral-500 block">SNR: ~{report.noiseLevelEstimateDb} dB</span>
          </div>
        </div>
      )}

      {/* Aliasing & Browser Noise Notice Card */}
      {report && report.aliasingRisk === 'CRITICAL_ALIASING' && (
        <div className="mx-4 mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="text-amber-300">Hasil Analisis Noise Browser Web Audio API (38.0 kHz vs {report.hardwareSampleRate} Hz):</strong>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              {report.aliasingExplanation}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] border border-amber-500/40">
                Batas Nyquist: {report.nyquistFrequencyHz / 1000} kHz
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] border border-rose-500/40">
                Artefak Lipatan (Foldback): {report.aliasingArtifactHz} Hz
              </span>
              <span className="text-[11px] text-neutral-400">
                💡 <em>Rekomendasi:</em> Gunakan berkas <strong>.ir</strong> di aplikasi Dolphy v2.6 atau Mi Remote untuk kontrol hardware lampu LED IR tanpa batasan browser!
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Logic Analyzer Waveform Canvas */}
      <div className="p-4 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-orange-400" />
              <span>Logic Analyzer Digital Oscilloscope (CH1: IR PWM Mark/Space):</span>
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              Resolution: 10µs/div
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-400">Zoom:</span>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
              className="w-24 accent-orange-500 cursor-pointer"
            />
            <span className="font-mono text-[10px] text-orange-400">{zoomLevel}x</span>
            <button
              onClick={() => setZoomLevel(1)}
              className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-300 hover:text-white"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Oscilloscope Screen */}
        <div className="w-full rounded-xl border border-neutral-800 overflow-x-auto bg-[#0b0c16] relative shadow-inner">
          <canvas
            ref={canvasRef}
            width={780}
            height={130}
            className="w-full h-32 block cursor-crosshair"
          />
        </div>

        {/* Selected Pulse Detail Ribbon */}
        {selectedPulse && (
          <div className="p-2.5 rounded-xl bg-[#121323] border border-orange-500/20 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[10px] font-bold">
                Pulsa #{selectedPulse.index}
              </span>
              <span className="font-bold text-white">{selectedPulse.stage}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                selectedPulse.level === 'HIGH' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400'
              }`}>
                {selectedPulse.level}
              </span>
              {selectedPulse.bitIndex !== undefined && (
                <span className="text-neutral-400 text-[11px]">
                  Bit [{selectedPulse.bitIndex}] = {selectedPulse.bitValue}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <span>Target: <strong className="text-white">{selectedPulse.expectedDurationUs}µs</strong></span>
              <span>Terukur: <strong className="text-orange-400">{selectedPulse.measuredDurationUs}µs</strong></span>
              <span>Deviasi: <strong className={selectedPulse.deviationUs >= 0 ? 'text-amber-400' : 'text-sky-400'}>
                {selectedPulse.deviationUs > 0 ? `+${selectedPulse.deviationUs}` : selectedPulse.deviationUs}µs ({selectedPulse.deviationPercent}%)
              </strong></span>
              {selectedPulse.carrierCycles > 0 && (
                <span>Carrier: <strong className="text-emerald-400">{selectedPulse.carrierCycles} Siklus 38kHz</strong></span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pulse Table Section */}
      <div className="p-4 pt-0 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          {/* Table Filter Tabs */}
          <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-neutral-800 text-[10px]">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded font-bold transition-colors ${
                filterType === 'ALL' ? 'bg-orange-500 text-black' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Semua Pulsa ({report?.pulses.length || 0})
            </button>
            <button
              onClick={() => setFilterType('MARK')}
              className={`px-2 py-1 rounded font-semibold transition-colors ${
                filterType === 'MARK' ? 'bg-emerald-500 text-black font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Mark / Burst ON ({report?.markCount || 0})
            </button>
            <button
              onClick={() => setFilterType('SPACE')}
              className={`px-2 py-1 rounded font-semibold transition-colors ${
                filterType === 'SPACE' ? 'bg-sky-500 text-black font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Space / Idle OFF ({report?.spaceCount || 0})
            </button>
            <button
              onClick={() => setFilterType('WARNING')}
              className={`px-2 py-1 rounded font-semibold transition-colors ${
                filterType === 'WARNING' ? 'bg-amber-500 text-black font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Jitter & Anomali
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari bit / timing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 rounded-lg bg-black/50 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Scrollable Pulse Data Table */}
        <div className="rounded-xl border border-neutral-800 bg-[#0c0d18] overflow-hidden max-h-72 overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#141525] text-neutral-400 text-[10px] uppercase sticky top-0 z-10 border-b border-neutral-800">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Tahap & Tipe</th>
                <th className="px-3 py-2">Level</th>
                <th className="px-3 py-2">Ideal (µs)</th>
                <th className="px-3 py-2">Terukur (µs)</th>
                <th className="px-3 py-2">Jitter Δ</th>
                <th className="px-3 py-2">Siklus 38kHz</th>
                <th className="px-3 py-2">Status Toleransi</th>
                <th className="px-3 py-2">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-[11px]">
              {filteredPulses.map((p) => {
                const isSelected = selectedPulse?.index === p.index;
                return (
                  <tr
                    key={p.index}
                    onClick={() => setSelectedPulse(p)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-orange-500/15 text-white'
                        : 'hover:bg-neutral-800/40 text-neutral-300'
                    }`}
                  >
                    <td className="px-3 py-1.5 text-neutral-500">{p.index}</td>
                    <td className="px-3 py-1.5 font-bold">
                      <span className="text-white">{p.stage}</span>
                      {p.bitIndex !== undefined && (
                        <span className="text-[10px] text-neutral-400 ml-1">
                          [b{p.bitIndex}:{p.bitValue}]
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-1.5">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        p.level === 'HIGH' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {p.level}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-neutral-400">{p.expectedDurationUs}</td>
                    <td className="px-3 py-1.5 font-bold text-orange-400">{p.measuredDurationUs}</td>
                    <td className="px-3 py-1.5">
                      <span className={Math.abs(p.deviationUs) > 15 ? 'text-rose-400 font-bold' : Math.abs(p.deviationUs) > 6 ? 'text-amber-400' : 'text-emerald-400'}>
                        {p.deviationUs > 0 ? `+${p.deviationUs}` : p.deviationUs}µs ({p.deviationPercent}%)
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-neutral-400">
                      {p.carrierCycles > 0 ? `${p.carrierCycles} cyc` : '-'}
                    </td>
                    <td className="px-3 py-1.5">
                      {p.status === 'EXACT' && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Presisi Presisi (&lt;5%)</span>
                        </span>
                      )}
                      {p.status === 'ACCEPTABLE' && (
                        <span className="px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-300 text-[10px] flex items-center gap-1 w-max">
                          <Check className="w-3 h-3 text-yellow-400" />
                          <span>Toleransi TSOP (±15%)</span>
                        </span>
                      )}
                      {p.status === 'JITTER_WARNING' && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[10px] flex items-center gap-1 w-max">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          <span>Jitter &gt;15%</span>
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-1.5 text-neutral-400 text-[10px] truncate max-w-xs">{p.notes}</td>
                  </tr>
                );
              })}
              {filteredPulses.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-6 text-neutral-500">
                    Tidak ada pulsa yang cocok dengan filter atau kata kunci.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* RAW Pulses String Output */}
        <div className="p-3 rounded-xl bg-black/50 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-neutral-300">
              Raw Pulse Sequence Timing String (µs):
            </span>
            <button
              onClick={() => handleCopyText(report?.rawPulsesString || '', 'raw_pulses')}
              className="text-orange-400 hover:text-orange-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              {copiedKey === 'raw_pulses' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'raw_pulses' ? 'Tersalin' : 'Salin Raw'}</span>
            </button>
          </div>
          <div className="font-mono text-[10px] text-emerald-300 break-all bg-black/60 p-2 rounded-lg border border-neutral-900 max-h-16 overflow-y-auto">
            {report?.rawPulsesString}
          </div>
        </div>
      </div>
    </div>
  );
};
