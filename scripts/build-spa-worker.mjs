import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const clientDir = 'dist/client';
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    files.push(...(entry.isDirectory() ? await filesIn(path) : [path]));
  }
  return files;
}

const assets = {};
for (const file of await filesIn(clientDir)) {
  const pathname = `/${relative(clientDir, file).replaceAll('\\', '/')}`;
  assets[pathname] = {
    body: (await readFile(file)).toString('base64'),
    type: mimeTypes[extname(file)] || 'application/octet-stream',
  };
}

const worker = `
const assets = ${JSON.stringify(assets)};
const decode = (value) => Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const asset = assets[url.pathname] || assets['/index.html'];
    if (!asset) return new Response('Dukie indisponível', { status: 503 });
    return new Response(decode(asset.body), {
      headers: {
        'Content-Type': asset.type,
        'Cache-Control': url.pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  },
};
`;

await mkdir('dist/server', { recursive: true });
await writeFile('dist/server/index.js', worker);
await mkdir('dist/.openai', { recursive: true });
await writeFile('dist/.openai/hosting.json', await readFile('.openai/hosting.json'));
