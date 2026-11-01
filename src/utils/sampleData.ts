import { CreationItem } from '../types';

export const INITIAL_CREATIONS: CreationItem[] = [
  {
    id: 'sample-nebula-game',
    title: 'Neon Orbit: Gravitational Physics Canvas Game',
    prompt: 'Buatkan game simulasi fisika gravitasi interaktif 2D di canvas HTML5 dengan grafis neon futuristik, efek partikel, orbit realistis, dan sistem skor dinamis.',
    mode: 'web_app',
    intelligenceTier: 'astro_supreme',
    persona: 'fullstack_engineer',
    tags: ['WEB APP', 'HTML', 'CANVAS', 'PHYSICS'],
    createdAt: Date.now() - 3600000,
    reasoning: `1. DEKOMPOSISI OBJEKTIF:
- Membangun simulasi fisika n-body gravitasi dengan HTML5 Canvas standalone.
- Mekanik gameplay: Pemain meluncurkan satelit dari orbit planet bumi menuju stasiun orbital tujuan sambil menghindari gravitasi black hole yang bergeser.
- Visual: Palet cyberpunk neon (cyan #06b6d4, violet #8b5cf6, amber #f59e0b) dengan trail partikel glowing dan animasi 60 FPS requestAnimationFrame.

2. PENANGANAN BOUNDARY & FISIKA:
- Hukum gravitasi Newton: F = G * (m1 * m2) / r^2 dengan softening factor epsilon untuk mencegah singularity pembagian nol saat jarak mendekati nol.
- Pemantulan dinding dengan elastisitas koefisien e = 0.82.
- UI overlay dibuat dengan Tailwind CSS responsif dan interaktif langsung.`,
    previewHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; overflow: hidden; background: #030712; font-family: system-ui, sans-serif; }
    canvas { display: block; }
  </style>
</head>
<body class="relative w-screen h-screen select-none">
  <!-- Top Bar -->
  <div class="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none z-10">
    <div class="bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 px-4 py-2 rounded-xl text-white shadow-lg pointer-events-auto">
      <div class="text-xs uppercase tracking-wider text-cyan-400 font-semibold">Neon Orbit Simulator</div>
      <div class="text-xl font-bold flex items-center gap-3">
        <span>Skor: <span id="scoreEl" class="text-emerald-400">0</span></span>
        <span class="text-slate-600">|</span>
        <span class="text-xs text-slate-300">Level: <span id="levelEl" class="text-cyan-300">1</span></span>
      </div>
    </div>
    <div class="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 px-4 py-2 rounded-xl text-white pointer-events-auto flex items-center gap-2">
      <button id="resetBtn" class="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold rounded-lg transition-colors">Reset Partikel</button>
      <button id="gravityToggle" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-600 rounded-lg">Black Hole: ON</button>
    </div>
  </div>

  <div class="absolute bottom-4 left-4 text-xs text-slate-400 pointer-events-none bg-slate-900/60 p-2 rounded-lg border border-slate-800">
    💡 Klik & seret mouse untuk meluncurkan probe energi berkecepatan tinggi!
  </div>

  <canvas id="gameCanvas"></canvas>

  <script>
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('scoreEl');
    const resetBtn = document.getElementById('resetBtn');
    const gravityToggle = document.getElementById('gravityToggle');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    let score = 0;
    let blackHoleActive = true;
    let blackHole = { x: width / 2, y: height / 2, mass: 900, radius: 24 };

    // Particles
    const particles = [];
    const targets = [];
    let dragStart = null;
    let currentDrag = null;

    function spawnTargets() {
      targets.length = 0;
      for (let i = 0; i < 5; i++) {
        targets.push({
          x: 80 + Math.random() * (width - 160),
          y: 80 + Math.random() * (height - 160),
          radius: 14 + Math.random() * 8,
          pulse: Math.random() * Math.PI,
          hue: 140 + Math.random() * 40
        });
      }
    }
    spawnTargets();

    class Particle {
      constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = 4;
        this.trail = [];
        this.dead = false;
        this.color = '#38bdf8';
      }

      update() {
        if (blackHoleActive) {
          const dx = blackHole.x - this.x;
          const dy = blackHole.y - this.y;
          const distSq = dx * dx + dy * dy + 400;
          const dist = Math.sqrt(distSq);
          const force = (blackHole.mass / distSq) * 1.8;
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;

          if (dist < blackHole.radius + this.radius) {
            this.dead = true;
          }
        }

        this.x += this.vx;
        this.y += this.vy;

        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 25) this.trail.shift();

        // Bounce borders
        if (this.x < 0 || this.x > width) this.vx *= -0.85;
        if (this.y < 0 || this.y > height) this.vy *= -0.85;

        // Check target hits
        for (let i = targets.length - 1; i >= 0; i--) {
          const t = targets[i];
          const tdx = t.x - this.x;
          const tdy = t.y - this.y;
          if (Math.hypot(tdx, tdy) < t.radius + this.radius) {
            targets.splice(i, 1);
            score += 100;
            scoreEl.textContent = score;
            if (targets.length === 0) spawnTargets();
          }
        }
      }

      draw() {
        // Trail
        ctx.beginPath();
        for (let i = 0; i < this.trail.length; i++) {
          const p = this.trail[i];
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Glow
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#06b6d4';
        ctx.fillStyle = '#bae6fd';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Input handlers
    window.addEventListener('mousedown', (e) => {
      dragStart = { x: e.clientX, y: e.clientY };
      currentDrag = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (dragStart) currentDrag = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      if (dragStart && currentDrag) {
        const vx = (dragStart.x - currentDrag.x) * 0.08;
        const vy = (dragStart.y - currentDrag.y) * 0.08;
        particles.push(new Particle(dragStart.x, dragStart.y, vx, vy));
      }
      dragStart = null;
      currentDrag = null;
    });

    resetBtn.addEventListener('click', () => {
      particles.length = 0;
      score = 0;
      scoreEl.textContent = '0';
      spawnTargets();
    });

    gravityToggle.addEventListener('click', () => {
      blackHoleActive = !blackHoleActive;
      gravityToggle.textContent = 'Black Hole: ' + (blackHoleActive ? 'ON' : 'OFF');
      gravityToggle.className = blackHoleActive 
        ? 'px-3 py-1 bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 text-xs rounded-lg'
        : 'px-3 py-1 bg-slate-800 text-slate-400 text-xs rounded-lg';
    });

    // Render loop
    function loop() {
      ctx.fillStyle = 'rgba(3, 7, 18, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Black Hole
      if (blackHoleActive) {
        const time = Date.now() * 0.003;
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#a855f7';
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(blackHole.x, blackHole.y, blackHole.radius + Math.sin(time) * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Targets
      for (const t of targets) {
        t.pulse += 0.05;
        const r = t.radius + Math.sin(t.pulse) * 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = \`hsl(\${t.hue}, 80%, 50%)\`;
        ctx.fillStyle = \`hsl(\${t.hue}, 70%, 55%)\`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.dead) particles.splice(i, 1);
      }

      // Drag line indicator
      if (dragStart && currentDrag) {
        ctx.beginPath();
        ctx.moveTo(dragStart.x, dragStart.y);
        ctx.lineTo(currentDrag.x, currentDrag.y);
        ctx.strokeStyle = '#38bdf8';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`,
    content: `# Neon Orbit: Gravitational Physics Simulation & Game

Aplikasi web interaktif ini dibuat dengan HTML5 Canvas bertenaga komputasi fisika gravitasi real-time.

### Fitur Utama:
1. **Fisika Gravitasi N-Body**: Kalkulasi vektor gaya gravitasi $F = \\frac{G \\cdot M}{r^2}$ dengan peredaman singularitas orbit.
2. **Neon Vector Aesthetics**: Trail partikel bercahaya tinggi (bloom neon) dengan buffer transparansi progresif.
3. **Gameplay Interaktif**: Tarik dan lepas mouse untuk meluncurkan probe energi kinetik menuju target kosmik.
4. **Toggling Gaya Gravitasi**: Aktifkan atau matikan medan tarikan lubang hitam sentral secara real-time.`,
    codeBlocks: [
      {
        language: 'html',
        filename: 'index.html',
        code: `<!-- Lihat tab Live Sandbox untuk menjalankan game interaktif ini -->`
      }
    ],
    rawOutput: ''
  }
];
