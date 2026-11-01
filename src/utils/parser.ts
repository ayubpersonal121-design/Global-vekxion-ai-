import { CodeBlock, CreationItem, CreationMode, IntelligenceTier, PersonaType } from '../types';

export function parseCreationOutput(
  rawText: string,
  prompt: string,
  mode: CreationMode,
  intelligenceTier: IntelligenceTier,
  persona: PersonaType,
  existingId?: string,
  imageUrl?: string
): CreationItem {
  let reasoning = '';
  let content = rawText;

  // Extract <reasoning> ... </reasoning> if present
  const reasoningMatch = rawText.match(/<reasoning>([\s\S]*?)<\/reasoning>/i);
  if (reasoningMatch) {
    reasoning = reasoningMatch[1].trim();
    content = rawText.replace(/<reasoning>[\s\S]*?<\/reasoning>/i, '').trim();
  }

  // Extract all code blocks: ```lang ... ```
  const codeBlocks: CodeBlock[] = [];
  const codeRegex = /```([a-zA-Z0-9_\-+]*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = codeRegex.exec(content)) !== null) {
    const lang = (match[1] || 'plaintext').toLowerCase().trim();
    const code = match[2].trim();
    codeBlocks.push({
      language: lang,
      code,
      filename: getDefaultFilename(lang)
    });
  }

  // Extract or build preview HTML
  let previewHtml: string | undefined = undefined;

  // Look for HTML code block
  const htmlBlock = codeBlocks.find(b => b.language === 'html' || b.language === 'htm');
  if (htmlBlock) {
    previewHtml = prepareSandboxHtml(htmlBlock.code);
  } else if (mode === 'web_app' && codeBlocks.length > 0) {
    // If user asked for web app and provided JS/HTML
    const jsBlock = codeBlocks.find(b => ['javascript', 'js'].includes(b.language));
    if (jsBlock) {
      previewHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-white p-6 font-sans">
  <div id="app"></div>
  <script>
    ${jsBlock.code}
  </script>
</body>
</html>`;
    }
  }

  // Derive a smart title
  const title = deriveTitleFromPrompt(prompt, content);

  return {
    id: existingId || `create_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title,
    prompt,
    mode,
    intelligenceTier,
    persona,
    reasoning: reasoning || undefined,
    content,
    rawOutput: rawText,
    codeBlocks,
    previewHtml,
    imageUrl,
    createdAt: Date.now(),
    tags: deriveTags(mode, codeBlocks)
  };
}

function getDefaultFilename(lang: string): string {
  switch (lang) {
    case 'html': return 'index.html';
    case 'typescript':
    case 'ts': return 'main.ts';
    case 'javascript':
    case 'js': return 'app.js';
    case 'tsx': return 'App.tsx';
    case 'jsx': return 'App.jsx';
    case 'python':
    case 'py': return 'script.py';
    case 'css': return 'style.css';
    case 'sql': return 'schema.sql';
    case 'rust':
    case 'rs': return 'main.rs';
    case 'go': return 'main.go';
    case 'json': return 'data.json';
    case 'mermaid': return 'diagram.mmd';
    case 'markdown':
    case 'md': return 'document.md';
    default: return `snippet.${lang || 'txt'}`;
  }
}

function prepareSandboxHtml(rawHtml: string): string {
  // If the html lacks basic doctype or body, wrap it nicely
  if (!rawHtml.includes('<html') && !rawHtml.includes('<!DOCTYPE')) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  ${rawHtml}
</body>
</html>`;
  }
  return rawHtml;
}

function deriveTitleFromPrompt(prompt: string, content: string): string {
  // Try to find a heading in content
  const headingMatch = content.match(/^#+\s+(.+)$/m);
  if (headingMatch && headingMatch[1].length < 50) {
    return headingMatch[1].replace(/[*_#]/g, '').trim();
  }

  const cleanPrompt = prompt.trim().replace(/^buatlah|^buatkan|^bikin|^create|^generate/i, '').trim();
  if (cleanPrompt.length <= 45) {
    return cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1);
  }
  return cleanPrompt.substring(0, 42) + '...';
}

function deriveTags(mode: CreationMode, codeBlocks: CodeBlock[]): string[] {
  const tags: string[] = [];
  tags.push(mode.replace('_', ' ').toUpperCase());

  for (const block of codeBlocks) {
    if (block.language && !tags.includes(block.language.toUpperCase())) {
      tags.push(block.language.toUpperCase());
    }
  }

  return tags.slice(0, 4);
}

export function formatFriendlyErrorMessage(errStringOrObj: any): string {
  if (!errStringOrObj) return 'Terjadi kendala pada server AI.';
  const rawString = typeof errStringOrObj === 'string' ? errStringOrObj : errStringOrObj?.message || String(errStringOrObj);
  let msg = rawString.replace(/^Error:\s*/i, '').trim();

  // Try parsing nested JSON string
  try {
    const jsonMatch = msg.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed?.error?.message) {
        msg = parsed.error.message;
        try {
          const inner = JSON.parse(msg);
          if (inner?.error?.message) {
            msg = inner.error.message;
          }
        } catch {}
      }
    }
  } catch {}

  const fullContext = (msg + ' ' + rawString + ' ' + (typeof errStringOrObj === 'object' ? JSON.stringify(errStringOrObj) : '')).toLowerCase();

  if (
    fullContext.includes('429') ||
    fullContext.includes('resource_exhausted') ||
    fullContext.includes('quota') ||
    fullContext.includes('rate limit') ||
    fullContext.includes('rate-limit') ||
    fullContext.includes('free tier') ||
    fullContext.includes('limit: 0') ||
    fullContext.includes('exceeded your current quota') ||
    fullContext.includes('quota exceeded') ||
    fullContext.includes('retry in')
  ) {
    return 'Batas kuota trafik model AI sedang padat (429 Rate Limit / Quota Exceeded). Sistem auto-fallback adaptif telah dialihkan secara aman.';
  }

  if (
    fullContext.includes('503') ||
    fullContext.includes('high demand') ||
    fullContext.includes('unavailable') ||
    fullContext.includes('service unavailable')
  ) {
    return 'Server AI Google saat ini sedang mengalami lonjakan antrean tinggi sementara (503 Service Unavailable). Sistem auto-fallback telah diaktifkan, silakan klik tombol "Coba Kirim Ulang" untuk melanjutkan.';
  }

  if (fullContext.includes('404') || fullContext.includes('not found')) {
    return 'Model AI sedang beralih ke rilis stabil terbaru.';
  }

  return msg;
}
