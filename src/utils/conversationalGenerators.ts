// Conversational Application, Game, and Website Simulation Engine for Vexion AI
// Generates fully functional, responsive HTML5 + Tailwind CSS + Vanilla JS/Canvas applications,
// playable games, and styled mock website layouts.
// Protected with strict try-catch handlers.

import { InteractiveSandboxItem, SandboxType } from '../types';

export function detectConversationalGenerationIntent(text: string): {
  isGenerationIntent: boolean;
  type: SandboxType;
  title: string;
  category: string;
} {
  try {
    const lower = text.toLowerCase().trim();

    // 1. GAME DETECTION
    const isGame = 
      lower.includes('game') ||
      lower.includes('permainan') ||
      lower.includes('playable') ||
      lower.includes('mini-game') ||
      lower.includes('minigame') ||
      lower.includes('snake') ||
      lower.includes('pong') ||
      lower.includes('flappy') ||
      lower.includes('tic tac toe') ||
      lower.includes('tictactoe') ||
      lower.includes('tetris') ||
      lower.includes('puzzle');

    if (isGame) {
      let title = 'Interactive Canvas Game';
      if (lower.includes('snake')) title = 'Retro Cyber Snake 2D';
      else if (lower.includes('flappy')) title = 'Flappy Cyber Jet';
      else if (lower.includes('pong')) title = 'Cyber Pong Arcade';
      else if (lower.includes('tic tac toe') || lower.includes('tictactoe')) title = 'Neon Tic-Tac-Toe';
      else title = 'Playable Canvas Arcade Game';

      return {
        isGenerationIntent: true,
        type: 'game',
        title,
        category: 'HTML5 Canvas Mini-Game'
      };
    }

    // 2. WEBSITE DETECTION
    const isWebsite = 
      lower.includes('landing page') ||
      lower.includes('website') ||
      lower.includes('web page') ||
      lower.includes('webpage') ||
      lower.includes('halaman web') ||
      lower.includes('portfolio') ||
      lower.includes('portofolio') ||
      lower.includes('e-commerce') ||
      lower.includes('ecommerce') ||
      lower.includes('toko online') ||
      lower.includes('saas page');

    if (isWebsite) {
      let title = 'Modern Responsive Website';
      if (lower.includes('landing page')) title = 'Apex SaaS Landing Page';
      else if (lower.includes('portfolio') || lower.includes('portofolio')) title = 'Creative Developer Portfolio';
      else if (lower.includes('e-commerce') || lower.includes('toko')) title = 'Luxe Store E-Commerce Showcase';
      else title = 'Interactive Web Showcase';

      return {
        isGenerationIntent: true,
        type: 'website',
        title,
        category: 'Responsive Web Layout'
      };
    }

    // 3. APPLICATION DETECTION
    const isApp = 
      lower.includes('aplikasi') ||
      lower.includes('application') ||
      lower.includes('software') ||
      lower.includes('kalkulator') ||
      lower.includes('calculator') ||
      lower.includes('to-do') ||
      lower.includes('todo') ||
      lower.includes('catatan') ||
      lower.includes('notes') ||
      lower.includes('stopwatch') ||
      lower.includes('kasir') ||
      lower.includes('pos system') ||
      lower.includes('inventaris') ||
      lower.includes('inventory') ||
      lower.includes('crm') ||
      lower.includes('tool');

    if (isApp) {
      let title = 'Interactive Web Application';
      if (lower.includes('kalkulator') || lower.includes('calculator')) title = 'Smart Scientific & Financial Calculator';
      else if (lower.includes('to-do') || lower.includes('todo') || lower.includes('catatan')) title = 'TaskFlow Productivity Hub';
      else if (lower.includes('stopwatch') || lower.includes('timer')) title = 'Precision Digital Stopwatch & Lap Timer';
      else if (lower.includes('kasir') || lower.includes('pos')) title = 'Retail Point of Sale (POS) Cashier';
      else title = 'Productivity Application Utility';

      return {
        isGenerationIntent: true,
        type: 'app',
        title,
        category: 'Interactive Web Application'
      };
    }

    return {
      isGenerationIntent: false,
      type: 'app',
      title: '',
      category: ''
    };
  } catch (err) {
    console.error('Error detecting generation intent:', err);
    return {
      isGenerationIntent: false,
      type: 'app',
      title: '',
      category: ''
    };
  }
}

// Generate self-contained playable sandbox application, game, or website
export function generateInteractiveSandboxItem(userPrompt: string): InteractiveSandboxItem {
  try {
    const { type, title, category } = detectConversationalGenerationIntent(userPrompt);
    const lower = userPrompt.toLowerCase();

    // 1. GAME GENERATION
    if (type === 'game') {
      if (lower.includes('pong')) {
        return {
          id: `game_${Date.now()}`,
          type: 'game',
          title: 'Cyber Pong Arcade',
          description: 'Game arkade pong klasik bernuansa cyberpunk dengan AI paddle dan kontrol sentuh/keyboard.',
          category: 'Canvas Game',
          html: getPongGameHtml()
        };
      } else if (lower.includes('tic tac toe') || lower.includes('tictactoe')) {
        return {
          id: `game_${Date.now()}`,
          type: 'game',
          title: 'Neon Tic-Tac-Toe Cyber',
          description: 'Game Tic-Tac-Toe neon futuristik dengan AI lawan tak terkalahkan dan visual skor real-time.',
          category: 'Turn-Based Game',
          html: getTicTacToeGameHtml()
        };
      } else {
        // Default: Retro Cyber Snake (User prompt example: "Buatkan saya game snake")
        return {
          id: `game_${Date.now()}`,
          type: 'game',
          title: 'Retro Cyber Snake 2D',
          description: 'Game Snake 2D interaktif dengan efek partikel neon, pelacakan skor tertinggi, dan kontrol sentuh/keyboard.',
          category: 'Canvas Mini-Game',
          html: getSnakeGameHtml()
        };
      }
    }

    // 2. WEBSITE GENERATION (User prompt example: "Create a landing page website")
    if (type === 'website') {
      return {
        id: `web_${Date.now()}`,
        type: 'website',
        title: title || 'Apex SaaS Landing Page',
        description: 'Landing page website responsif bergaya Glassmorphism dengan navigasi dinamis, tabel harga, dan toggle mode.',
        category: 'Responsive Website',
        html: getLandingPageWebsiteHtml()
      };
    }

    // 3. APPLICATION GENERATION (User prompt example: "Buatkan aplikasi kalkulator")
    if (lower.includes('kalkulator') || lower.includes('calculator')) {
      return {
        id: `app_${Date.now()}`,
        type: 'app',
        title: 'Smart Neo-Brutalist Calculator',
        description: 'Aplikasi kalkulator interaktif dengan riwayat kalkulasi, operasi persentase, dan umpan balik tombol responsif.',
        category: 'Web Application',
        html: getCalculatorAppHtml()
      };
    }

    // Default App: Task & Notes / POS
    return {
      id: `app_${Date.now()}`,
      type: 'app',
      title: title || 'TaskFlow Business Workspace',
      description: 'Aplikasi manajemen alur kerja interaktif dengan status Kanban, filter prioritas, dan statistik tugas real-time.',
      category: 'Web Application',
      html: getTodoAppHtml()
    };
  } catch (err) {
    console.error('Error generating interactive sandbox item:', err);
    return {
      id: `err_${Date.now()}`,
      type: 'app',
      title: 'Generated Interactive Application',
      description: 'Aplikasi web interaktif sintetis.',
      category: 'Application',
      html: getCalculatorAppHtml()
    };
  }
}

// ----------------- TEMPLATE HTML GENERATORS -----------------

function getSnakeGameHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cyber Snake</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #0a0a0f; color: #e0e0e0; font-family: ui-monospace, SFMono-Regular, monospace; }
    canvas { background: radial-gradient(circle at center, #111122 0%, #06060c 100%); border: 2px solid #00f0ff; box-shadow: 0 0 25px rgba(0, 240, 255, 0.25); }
  </style>
</head>
<body class="flex flex-col items-center justify-center min-h-screen p-4 select-none">
  <div class="w-full max-w-md flex flex-col items-center">
    <div class="flex items-center justify-between w-full mb-3 px-2">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
        <h1 class="text-lg font-black tracking-widest text-cyan-400">CYBER SNAKE 2D</h1>
      </div>
      <div class="text-xs font-bold text-neutral-300">
        SCORE: <span id="score" class="text-cyan-300 font-mono text-sm">0</span> | BEST: <span id="high" class="text-emerald-400 font-mono text-sm">0</span>
      </div>
    </div>

    <div class="relative">
      <canvas id="game" width="360" height="360" class="rounded-xl"></canvas>
      <div id="overlay" class="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-6 text-center">
        <h2 id="overTitle" class="text-xl font-black text-cyan-400 mb-2">SIAP BERMAIN?</h2>
        <p class="text-xs text-neutral-400 mb-4">Gunakan Tombol Panah, Tombol Layar, atau Geser Jari</p>
        <button id="startBtn" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-extrabold text-sm shadow-lg shadow-cyan-500/30 hover:brightness-110 active:scale-95 transition-all">
          MULAI GAME
        </button>
      </div>
    </div>

    <!-- Mobile Virtual D-Pad -->
    <div class="grid grid-cols-3 gap-2 mt-4 w-48">
      <div></div>
      <button onclick="changeDir('UP')" class="p-3 bg-neutral-900 border border-neutral-700 active:bg-cyan-500 active:text-black rounded-xl text-center text-sm font-bold shadow">▲</button>
      <div></div>
      <button onclick="changeDir('LEFT')" class="p-3 bg-neutral-900 border border-neutral-700 active:bg-cyan-500 active:text-black rounded-xl text-center text-sm font-bold shadow">◀</button>
      <button onclick="changeDir('DOWN')" class="p-3 bg-neutral-900 border border-neutral-700 active:bg-cyan-500 active:text-black rounded-xl text-center text-sm font-bold shadow">▼</button>
      <button onclick="changeDir('RIGHT')" class="p-3 bg-neutral-900 border border-neutral-700 active:bg-cyan-500 active:text-black rounded-xl text-center text-sm font-bold shadow">▶</button>
    </div>
  </div>

  <script>
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const highEl = document.getElementById('high');
    const overlay = document.getElementById('overlay');
    const overTitle = document.getElementById('overTitle');
    const startBtn = document.getElementById('startBtn');

    const gridSize = 18;
    const tileCount = canvas.width / gridSize;
    let snake = [{x: 10, y: 10}];
    let food = {x: 5, y: 5};
    let dx = 1;
    let dy = 0;
    let score = 0;
    let highScore = 0;
    let gameLoop = null;
    let isRunning = false;

    function spawnFood() {
      food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
      };
      if (snake.some(seg => seg.x === food.x && seg.y === food.y)) {
        spawnFood();
      }
    }

    function draw() {
      ctx.fillStyle = '#0b0b14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid Lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
      for (let i = 0; i < canvas.width; i += gridSize) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      // Draw Food
      ctx.fillStyle = '#ff0077';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#ff0077';
      ctx.beginPath();
      ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2.3, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Snake
      snake.forEach((seg, index) => {
        ctx.fillStyle = index === 0 ? '#00f0ff' : '#00b4d8';
        ctx.shadowBlur = index === 0 ? 15 : 4;
        ctx.shadowColor = '#00f0ff';
        ctx.fillRect(seg.x * gridSize + 1, seg.y * gridSize + 1, gridSize - 2, gridSize - 2);
      });
      ctx.shadowBlur = 0;
    }

    function update() {
      const head = { x: snake[0].x + dx, y: snake[0].y + dy };

      // Wall collision (Wrap around or die - Wrap around feels cyber)
      if (head.x < 0) head.x = tileCount - 1;
      if (head.x >= tileCount) head.x = 0;
      if (head.y < 0) head.y = tileCount - 1;
      if (head.y >= tileCount) head.y = 0;

      // Self collision
      if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        gameOver();
        return;
      }

      snake.unshift(head);

      // Food Eaten
      if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.innerText = score;
        if (score > highScore) {
          highScore = score;
          highEl.innerText = highScore;
        }
        spawnFood();
      } else {
        snake.pop();
      }

      draw();
    }

    function gameOver() {
      clearInterval(gameLoop);
      isRunning = false;
      overTitle.innerText = 'GAME OVER!';
      overTitle.className = 'text-xl font-black text-rose-500 mb-2';
      startBtn.innerText = 'MAIN LAGI';
      overlay.style.display = 'flex';
    }

    function startGame() {
      snake = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
      dx = 1; dy = 0;
      score = 0;
      scoreEl.innerText = 0;
      spawnFood();
      overlay.style.display = 'none';
      isRunning = true;
      clearInterval(gameLoop);
      gameLoop = setInterval(update, 100);
      draw();
    }

    function changeDir(dir) {
      if (!isRunning) return;
      if (dir === 'UP' && dy === 0) { dx = 0; dy = -1; }
      if (dir === 'DOWN' && dy === 0) { dx = 0; dy = 1; }
      if (dir === 'LEFT' && dx === 0) { dx = -1; dy = 0; }
      if (dir === 'RIGHT' && dx === 0) { dx = 1; dy = 0; }
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w') changeDir('UP');
      if (e.key === 'ArrowDown' || e.key === 's') changeDir('DOWN');
      if (e.key === 'ArrowLeft' || e.key === 'a') changeDir('LEFT');
      if (e.key === 'ArrowRight' || e.key === 'd') changeDir('RIGHT');
    });

    startBtn.addEventListener('click', startGame);
    draw();
  </script>
</body>
</html>`;
}

function getPongGameHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cyber Pong</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>body { background: #07070b; color: #fff; font-family: monospace; }</style>
</head>
<body class="flex flex-col items-center justify-center min-h-screen p-4 select-none">
  <div class="w-full max-w-md flex flex-col items-center">
    <div class="flex justify-between w-full mb-2 text-cyan-400 font-bold text-sm">
      <span>PLAYER: <b id="pScore" class="text-white">0</b></span>
      <span>CYBER PONG</span>
      <span>AI BOT: <b id="bScore" class="text-white">0</b></span>
    </div>
    <canvas id="pong" width="360" height="280" class="border border-cyan-500/40 rounded-xl bg-black shadow-lg"></canvas>
    <div class="flex gap-4 mt-3 w-full">
      <button id="moveUp" class="flex-1 py-3 bg-neutral-900 border border-neutral-700 active:bg-cyan-500 rounded-xl text-center font-bold">▲ ATAS</button>
      <button id="moveDown" class="flex-1 py-3 bg-neutral-900 border border-neutral-700 active:bg-cyan-500 rounded-xl text-center font-bold">▼ BAWAH</button>
    </div>
  </div>
  <script>
    const cvs = document.getElementById('pong');
    const ctx = cvs.getContext('2d');
    let pY = 100, bY = 100, pScore = 0, bScore = 0;
    let bX = 180, bY_pos = 140, bSpeedX = 4, bSpeedY = 3;
    const pW = 10, pH = 60, bSize = 8;

    function resetBall() {
      bX = cvs.width/2; bY_pos = cvs.height/2;
      bSpeedX = -bSpeedX;
    }

    function loop() {
      ctx.fillStyle = '#080811';
      ctx.fillRect(0,0,cvs.width,cvs.height);

      // Player
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(10, pY, pW, pH);

      // Bot
      ctx.fillStyle = '#ff0077';
      ctx.fillRect(cvs.width - 20, bY, pW, pH);

      // Bot AI tracking
      if (bY + pH/2 < bY_pos) bY += 2.8;
      else bY -= 2.8;

      // Ball
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bX, bY_pos, bSize, bSize);

      bX += bSpeedX;
      bY_pos += bSpeedY;

      if (bY_pos <= 0 || bY_pos >= cvs.height - bSize) bSpeedY = -bSpeedY;

      // Collision player
      if (bX <= 20 && bY_pos + bSize >= pY && bY_pos <= pY + pH) {
        bSpeedX = -bSpeedX * 1.05;
      }
      // Collision bot
      if (bX >= cvs.width - 30 && bY_pos + bSize >= bY && bY_pos <= bY + pH) {
        bSpeedX = -bSpeedX * 1.05;
      }

      if (bX < 0) { bScore++; document.getElementById('bScore').innerText = bScore; resetBall(); }
      if (bX > cvs.width) { pScore++; document.getElementById('pScore').innerText = pScore; resetBall(); }

      requestAnimationFrame(loop);
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' && pY > 0) pY -= 20;
      if (e.key === 'ArrowDown' && pY < cvs.height - pH) pY += 20;
    });
    document.getElementById('moveUp').onclick = () => { if (pY > 0) pY -= 30; };
    document.getElementById('moveDown').onclick = () => { if (pY < cvs.height - pH) pY += 30; };
    loop();
  </script>
</body>
</html>`;
}

function getTicTacToeGameHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Neon Tic Tac Toe</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0b0c10] text-white flex flex-col items-center justify-center min-h-screen p-4 font-mono select-none">
  <div class="max-w-xs w-full text-center">
    <h1 class="text-xl font-bold text-cyan-400 mb-2">NEON TIC-TAC-TOE</h1>
    <div id="status" class="text-xs text-neutral-400 mb-4">Giliran Anda (X)</div>
    <div class="grid grid-cols-3 gap-2 bg-neutral-900 p-3 rounded-2xl border border-neutral-800 shadow-xl">
      ${[0,1,2,3,4,5,6,7,8].map(i => `<button onclick="play(${i})" id="c${i}" class="h-20 bg-black/60 border border-neutral-800 rounded-xl text-3xl font-bold flex items-center justify-center hover:bg-neutral-800 active:scale-95 transition-all text-cyan-400"></button>`).join('')}
    </div>
    <button onclick="reset()" class="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs text-white rounded-xl border border-neutral-700 font-bold transition-all">Reset Board</button>
  </div>
  <script>
    let board = Array(9).fill('');
    let active = true;
    function play(i) {
      if (board[i] || !active) return;
      board[i] = 'X';
      document.getElementById('c'+i).innerText = 'X';
      if (checkWin('X')) { end('Selamat! Anda Menang (X)!'); return; }
      if (board.every(b => b)) { end('Permainan Seri!'); return; }
      botTurn();
    }
    function botTurn() {
      const avail = board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
      if (avail.length === 0) return;
      const pick = avail[Math.floor(Math.random() * avail.length)];
      board[pick] = 'O';
      const cell = document.getElementById('c'+pick);
      cell.innerText = 'O';
      cell.className += ' text-rose-400';
      if (checkWin('O')) { end('AI Bot (O) Menang!'); }
    }
    function checkWin(p) {
      const w = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      return w.some(comb => comb.every(i => board[i] === p));
    }
    function end(msg) {
      active = false;
      document.getElementById('status').innerText = msg;
    }
    function reset() {
      board = Array(9).fill('');
      active = true;
      document.getElementById('status').innerText = 'Giliran Anda (X)';
      for (let i=0; i<9; i++) {
        const c = document.getElementById('c'+i);
        c.innerText = '';
        c.className = 'h-20 bg-black/60 border border-neutral-800 rounded-xl text-3xl font-bold flex items-center justify-center hover:bg-neutral-800 active:scale-95 transition-all text-cyan-400';
      }
    }
  </script>
</body>
</html>`;
}

function getCalculatorAppHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Smart Neo-Brutalist Calculator</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0e0f14] text-white flex flex-col items-center justify-center min-h-screen p-4 font-sans select-none">
  <div class="w-full max-w-xs bg-[#161720] border border-neutral-800 rounded-3xl p-5 shadow-2xl space-y-4">
    <div class="flex items-center justify-between text-xs text-neutral-400 font-mono">
      <span>VEXION ENGINE</span>
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
    </div>

    <!-- Display Screen -->
    <div class="bg-[#0a0a0f] p-4 rounded-2xl border border-neutral-800/80 text-right min-h-[85px] flex flex-col justify-end">
      <div id="prev" class="text-xs text-neutral-500 font-mono overflow-x-auto whitespace-nowrap"></div>
      <div id="curr" class="text-3xl font-mono font-black text-cyan-300 tracking-tight overflow-x-auto whitespace-nowrap">0</div>
    </div>

    <!-- Button Matrix -->
    <div class="grid grid-cols-4 gap-2.5">
      <button onclick="clearAll()" class="p-3.5 bg-neutral-800 text-rose-400 rounded-2xl font-bold text-sm hover:bg-neutral-700 active:scale-95 transition-all">AC</button>
      <button onclick="del()" class="p-3.5 bg-neutral-800 text-amber-400 rounded-2xl font-bold text-sm hover:bg-neutral-700 active:scale-95 transition-all">⌫</button>
      <button onclick="append('%')" class="p-3.5 bg-neutral-800 text-neutral-300 rounded-2xl font-bold text-sm hover:bg-neutral-700 active:scale-95 transition-all">%</button>
      <button onclick="append('/')" class="p-3.5 bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 rounded-2xl font-bold text-lg hover:bg-cyan-900 active:scale-95 transition-all">÷</button>

      <button onclick="append('7')" class="p-3.5 bg-neutral-900 rounded-2xl font-bold text-sm hover:bg-neutral-800 active:scale-95 transition-all">7</button>
      <button onclick="append('8')" class="p-3.5 bg-neutral-900 rounded-2xl font-bold text-sm hover:bg-neutral-800 active:scale-95 transition-all">8</button>
      <button onclick="append('9')" class="p-3.5 bg-neutral-900 rounded-2xl font-bold text-sm hover:bg-neutral-800 active:scale-95 transition-all">9</button>
      <button onclick="append('*')" class="p-3.5 bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 rounded-2xl font-bold text-lg hover:bg-cyan-900 active:scale-95 transition-all">×</button>

      <button onclick="append('4')" class="p-3.5 bg-neutral-900 rounded-2xl font-bold text-sm hover:bg-neutral-800 active:scale-95 transition-all">4</button>
      <button onclick="append('5')" class="p-3.5 bg-neutral-900 rounded-2xl font-bold text-sm hover:bg-neutral-800 active:scale-95 transition-all">5</button>
      <button onclick="append('6')" class="p-3.5 bg-neutral-900 rounded-2xl font-bold text-sm hover:bg-neutral-800 active:scale-95 transition-all">6</button>
      <button onclick="append('-')" class="p-3.5 bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 rounded-2xl font-bold text-lg hover:bg-cyan-900 active:scale-95 transition-all">−</button>

      <button onclick="append('1')" class="p-3.5 bg-neutral-900 rounded-2xl font-bold text-sm hover:bg-neutral-800 active:scale-95 transition-all">1</button>
      <button onclick="append('2')" class="p-3.5 bg-neutral-900 rounded-2xl font-bold text-sm hover:bg-neutral-800 active:scale-95 transition-all">2</button>
      <button onclick="append('3')" class="p-3.5 bg-neutral-900 rounded-2xl font-bold text-sm hover:bg-neutral-800 active:scale-95 transition-all">3</button>
      <button onclick="append('+')" class="p-3.5 bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 rounded-2xl font-bold text-lg hover:bg-cyan-900 active:scale-95 transition-all">+</button>

      <button onclick="append('0')" class="col-span-2 p-3.5 bg-neutral-900 rounded-2xl font-bold text-sm hover:bg-neutral-800 active:scale-95 transition-all">0</button>
      <button onclick="append('.')" class="p-3.5 bg-neutral-900 rounded-2xl font-bold text-sm hover:bg-neutral-800 active:scale-95 transition-all">.</button>
      <button onclick="calc()" class="p-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-extrabold text-xl rounded-2xl shadow-lg shadow-cyan-500/30 hover:brightness-110 active:scale-95 transition-all">=</button>
    </div>
  </div>

  <script>
    let expr = '';
    const currEl = document.getElementById('curr');
    const prevEl = document.getElementById('prev');

    function append(val) {
      if (expr === '0' && val !== '.') expr = '';
      expr += val;
      currEl.innerText = expr || '0';
    }
    function clearAll() {
      expr = '';
      currEl.innerText = '0';
      prevEl.innerText = '';
    }
    function del() {
      expr = expr.slice(0, -1);
      currEl.innerText = expr || '0';
    }
    function calc() {
      try {
        const clean = expr.replace(/×/g, '*').replace(/÷/g, '/');
        const res = Function('"use strict"; return (' + clean + ')')();
        prevEl.innerText = expr + ' =';
        expr = String(res);
        currEl.innerText = expr;
      } catch (e) {
        currEl.innerText = 'Error';
        expr = '';
      }
    }
  </script>
</body>
</html>`;
}

function getLandingPageWebsiteHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Apex SaaS Landing Page</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0b0c10] text-slate-100 font-sans selection:bg-cyan-500/30">
  <!-- Navbar -->
  <nav class="border-b border-neutral-800/80 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0b0c10]/90 backdrop-blur-md z-30">
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-black font-black text-sm">V</div>
      <span class="font-bold text-lg tracking-tight text-white">Vexion<span class="text-cyan-400">Cloud</span></span>
    </div>
    <div class="hidden sm:flex items-center gap-6 text-sm text-neutral-400">
      <a href="#features" class="hover:text-cyan-400 transition-colors">Features</a>
      <a href="#metrics" class="hover:text-cyan-400 transition-colors">Metrics</a>
      <a href="#pricing" class="hover:text-cyan-400 transition-colors">Pricing</a>
    </div>
    <button class="px-4 py-2 rounded-xl bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 active:scale-95 transition-all">Start Free</button>
  </nav>

  <!-- Hero Section -->
  <section class="max-w-5xl mx-auto px-6 py-16 text-center space-y-6">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-400 text-xs font-semibold">
      <span>✨ Next-Gen AI Generation Architecture</span>
    </div>
    <h1 class="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
      Build, Deploy & Scale <br>
      <span class="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 bg-clip-text text-transparent">Apps in Seconds</span>
    </h1>
    <p class="max-w-2xl mx-auto text-sm sm:text-base text-neutral-400 leading-relaxed">
      Empower your engineering workflow with hyper-speed neural compilers, autonomous full-stack synthesis, and real-time sandbox execution.
    </p>
    <div class="flex items-center justify-center gap-3 pt-2">
      <button class="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-bold text-sm shadow-xl shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all">Launch Sandbox</button>
      <button class="px-6 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-300 font-bold text-sm hover:bg-neutral-800 active:scale-95 transition-all">Explore Docs</button>
    </div>
  </section>

  <!-- Metric Badges -->
  <section id="metrics" class="max-w-4xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
    <div class="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800">
      <div class="text-2xl font-black text-cyan-400">99.99%</div>
      <div class="text-xs text-neutral-500 mt-1">Uptime SLA</div>
    </div>
    <div class="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800">
      <div class="text-2xl font-black text-indigo-400">&lt; 12ms</div>
      <div class="text-xs text-neutral-500 mt-1">Global Latency</div>
    </div>
    <div class="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800">
      <div class="text-2xl font-black text-emerald-400">10M+</div>
      <div class="text-xs text-neutral-500 mt-1">Requests/Day</div>
    </div>
    <div class="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800">
      <div class="text-2xl font-black text-pink-400">Zero</div>
      <div class="text-xs text-neutral-500 mt-1">Cold Starts</div>
    </div>
  </section>

  <!-- Feature Grid -->
  <section id="features" class="max-w-5xl mx-auto px-6 py-16">
    <div class="text-center mb-10">
      <h2 class="text-2xl font-bold text-white">Engineered for Sovereign Velocity</h2>
      <p class="text-xs text-neutral-400 mt-2">Everything you need to launch world-class software.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="p-6 rounded-2xl bg-[#12131c] border border-neutral-800 hover:border-cyan-500/50 transition-all space-y-3">
        <div class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-lg">⚡</div>
        <h3 class="text-base font-bold text-white">Instant Compilers</h3>
        <p class="text-xs text-neutral-400 leading-relaxed">Synthesize zero-dependency React, HTML5, and full-stack assets in milliseconds.</p>
      </div>
      <div class="p-6 rounded-2xl bg-[#12131c] border border-neutral-800 hover:border-cyan-500/50 transition-all space-y-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-lg">🛡️</div>
        <h3 class="text-base font-bold text-white">Cyber Hardening</h3>
        <p class="text-xs text-neutral-400 leading-relaxed">Built-in vulnerability inspection, automated CSP headers, and protected runtimes.</p>
      </div>
      <div class="p-6 rounded-2xl bg-[#12131c] border border-neutral-800 hover:border-cyan-500/50 transition-all space-y-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg">🌐</div>
        <h3 class="text-base font-bold text-white">Edge Live Sandbox</h3>
        <p class="text-xs text-neutral-400 leading-relaxed">Test interactive canvases, reactive widgets, and games in isolated sandboxes.</p>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t border-neutral-800/80 px-6 py-8 text-center text-xs text-neutral-500">
    &copy; 2026 Vexion AI Architecture. Developed by Ayyub Kenda Pratama.
  </footer>
</body>
</html>`;
}

function getTodoAppHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TaskFlow Hub</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0f1016] text-white p-4 font-sans select-none flex justify-center">
  <div class="w-full max-w-md bg-[#161722] border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4">
    <div class="flex justify-between items-center pb-2 border-b border-neutral-800">
      <div>
        <h1 class="text-base font-bold text-white">TaskFlow Hub</h1>
        <p class="text-[11px] text-neutral-400">Kelola prioritas alur kerja harian</p>
      </div>
      <span id="counter" class="text-xs px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono font-bold">0 Pending</span>
    </div>

    <!-- Add Input -->
    <div class="flex gap-2">
      <input id="taskInput" type="text" placeholder="Tambah tugas baru..." class="flex-1 bg-black/50 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400" />
      <button onclick="addTask()" class="px-4 py-2 bg-cyan-500 text-black font-bold text-xs rounded-xl hover:bg-cyan-400 active:scale-95 transition-all">Tambah</button>
    </div>

    <!-- Task List -->
    <ul id="taskList" class="space-y-2 max-h-60 overflow-y-auto pr-1"></ul>
  </div>

  <script>
    let tasks = [
      { id: 1, text: 'Audit infrastruktur server Vexion AI', done: true },
      { id: 2, text: 'Review performa neural reasoning', done: false },
      { id: 3, text: 'Konfigurasi Cyber Mode sandbox', done: false }
    ];

    function render() {
      const list = document.getElementById('taskList');
      list.innerHTML = '';
      tasks.forEach(t => {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between p-3 rounded-xl bg-black/40 border border-neutral-800/80 text-xs';
        li.innerHTML = \`
          <div class="flex items-center gap-2 cursor-pointer flex-1 \${t.done ? 'line-through text-neutral-500' : 'text-neutral-200'}" onclick="toggle(\${t.id})">
            <span class="w-4 h-4 rounded-md border \${t.done ? 'bg-cyan-500 border-cyan-500 text-black' : 'border-neutral-600'} flex items-center justify-center text-[10px] font-bold">\${t.done ? '✓' : ''}</span>
            <span>\${t.text}</span>
          </div>
          <button onclick="del(\${t.id})" class="text-neutral-500 hover:text-rose-400 text-xs px-1">✕</button>
        \`;
        list.appendChild(li);
      });
      const pending = tasks.filter(t => !t.done).length;
      document.getElementById('counter').innerText = pending + ' Pending';
    }

    function addTask() {
      const inp = document.getElementById('taskInput');
      if (!inp.value.trim()) return;
      tasks.unshift({ id: Date.now(), text: inp.value.trim(), done: false });
      inp.value = '';
      render();
    }

    function toggle(id) {
      tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
      render();
    }

    function del(id) {
      tasks = tasks.filter(t => t.id !== id);
      render();
    }

    render();
  </script>
</body>
</html>`;
}
