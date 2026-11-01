import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

interface ParticleLogoProps {
  className?: string;
}

export const ParticleLogo: React.FC<ParticleLogoProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = 44);
    let height = (canvas.height = 44);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      color: string;
    }

    const colors = ['#38bdf8', '#818cf8', '#ec4899', '#f43f5e', '#a855f7'];
    const particles: Particle[] = [];

    for (let i = 0; i < 16; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 20,
        y: height / 2 + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 1.8 + 0.8,
        alpha: Math.random() * 0.7 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce within boundaries
        if (p.x < 2 || p.x > width - 2) p.vx *= -1;
        if (p.y < 2 || p.y > height - 2) p.vy *= -1;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Glowing Particle Emblem */}
      <div className="relative w-10 h-10 rounded-xl bg-[#171717] border border-white/10 flex items-center justify-center overflow-hidden shadow-lg shadow-sky-500/10 group">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
        <div className="relative z-10 w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500/20 via-indigo-500/20 to-pink-500/20 flex items-center justify-center border border-white/15 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-sky-400 group-hover:rotate-12 transition-transform duration-300" />
        </div>
      </div>

      {/* Brand Identity */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-base tracking-tight text-white group-hover:text-sky-300 transition-colors">
            Global Pixel AI
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-neutral-400">
            v3.8
          </span>
        </div>
        <span className="text-[11px] text-neutral-400 font-medium">
          Conversational &amp; High-ROI Ads Engine
        </span>
      </div>
    </div>
  );
};
