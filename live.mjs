// live.mjs — zero-dependency static dev server with live reload.
// Serves the project root at http://localhost:4321 and reloads
// connected browsers whenever a file changes.
//
//   node live.mjs            → serves on port 4321
//   PORT=3000 node live.mjs  → override the port
//
// Requires only Node's built-in modules (no npm install).

import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { watch } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4321;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

// --- Live-reload plumbing ---------------------------------------------------
const clients = new Set();

const RELOAD_SNIPPET = `
<script>
(() => {
  let es;
  const connect = () => {
    es = new EventSource('/__livereload');
    es.onmessage = (e) => { if (e.data === 'reload') location.reload(); };
    es.onerror = () => { es.close(); setTimeout(connect, 1000); };
  };
  connect();
})();
</script>`;

let reloadTimer = null;
const triggerReload = () => {
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    for (const res of clients) res.write('data: reload\n\n');
  }, 80); // debounce bursts of file events
};

// Recursively watch the project (skip .git and node_modules).
watch(ROOT, { recursive: true }, (_event, filename) => {
  if (!filename) return triggerReload();
  const f = filename.replaceAll(sep, '/');
  if (f.startsWith('.git/') || f.includes('node_modules/')) return;
  triggerReload();
});

// --- Request handling -------------------------------------------------------
const resolvePath = async (urlPath) => {
  // Prevent path traversal outside ROOT.
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0]))
    .replace(/^(\.\.[/\\])+/, '');
  let target = join(ROOT, clean);
  if (!target.startsWith(ROOT)) return null;

  const tryFiles = [];
  if (urlPath.endsWith('/') || urlPath === '') {
    tryFiles.push(join(target, 'index.html'));
  } else {
    tryFiles.push(target);
    if (!extname(target)) tryFiles.push(target + '.html'); // /about → /about.html
    tryFiles.push(join(target, 'index.html'));
  }

  for (const candidate of tryFiles) {
    try {
      const s = await stat(candidate);
      if (s.isFile()) return candidate;
    } catch { /* keep trying */ }
  }
  return null;
};

const server = http.createServer(async (req, res) => {
  // Live-reload event stream.
  if (req.url === '/__livereload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write('retry: 1000\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  const file = await resolvePath(req.url);
  if (!file) {
    // Fall back to a custom 404 page if present.
    try {
      const body = await readFile(join(ROOT, '404.html'));
      res.writeHead(404, { 'Content-Type': MIME['.html'] });
      return res.end(injectReload(body));
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found');
    }
  }

  try {
    const ext = extname(file).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    let body = await readFile(file);
    if (ext === '.html') body = injectReload(body);
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    res.end(body);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 Internal Server Error\n' + err.message);
  }
});

function injectReload(buf) {
  const html = buf.toString('utf8');
  if (html.includes('</body>')) {
    return html.replace('</body>', RELOAD_SNIPPET + '\n</body>');
  }
  return html + RELOAD_SNIPPET;
}

server.listen(PORT, () => {
  console.log(`\n  VISUAILS live server running`);
  console.log(`  → http://localhost:${PORT}\n`);
  console.log(`  Watching ${ROOT} for changes (live reload on).`);
  console.log(`  Press Ctrl+C to stop.\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  Port ${PORT} is already in use.`);
    console.error(`  Try: PORT=4322 node live.mjs\n`);
    process.exit(1);
  }
  throw err;
});
