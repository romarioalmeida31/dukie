import { copyFile, mkdir } from 'node:fs/promises';
import { build } from 'esbuild';

await build({
  entryPoints: ['dist/server/entry.js'],
  outfile: 'dist/server/index.js',
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'es2022',
  minify: true,
  sourcemap: false,
});
await mkdir('dist/.openai', { recursive: true });
await copyFile('.openai/hosting.json', 'dist/.openai/hosting.json');
