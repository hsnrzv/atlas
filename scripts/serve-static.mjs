// Serves a built app with an SPA fallback and gzip, like the production nginx image, for the performance budget
// tests (playwright.performance.config.ts). Development tool only; never deployed.
//   node scripts/serve-static.mjs <dir> <port>
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { createGzip } from 'node:zlib';

const root = resolve(process.argv[2] ?? 'dist/atlas-performance/browser');
const port = Number(process.argv[3] ?? 4300);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};
const COMPRESSED = new Set(['.html', '.js', '.css', '.json', '.svg', '.webmanifest', '.txt']);

function fileFor(url) {
  const path = normalize(decodeURIComponent(new URL(url, 'http://localhost').pathname));
  const candidate = join(root, path);
  if (candidate.startsWith(root + sep) || candidate === root) {
    try {
      if (statSync(candidate).isFile()) {
        return candidate;
      }
    } catch {
      // Not a file: fall back to the app shell.
    }
  }
  return join(root, 'index.html');
}

createServer((request, response) => {
  const file = fileFor(request.url ?? '/');
  const extension = extname(file);
  const hashed = /-[A-Z0-9]{8}\.(?:js|css)$/.test(file);
  response.setHeader('Content-Type', TYPES[extension] ?? 'application/octet-stream');
  response.setHeader('Cache-Control', hashed ? 'public, max-age=31536000, immutable' : 'no-cache');
  if (COMPRESSED.has(extension) && /\bgzip\b/.test(request.headers['accept-encoding'] ?? '')) {
    response.setHeader('Content-Encoding', 'gzip');
    createReadStream(file).pipe(createGzip()).pipe(response);
  } else {
    createReadStream(file).pipe(response);
  }
}).listen(port, '127.0.0.1', () => console.log(`Serving ${root} on http://127.0.0.1:${port}/`));
