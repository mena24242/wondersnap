// Build a self-contained static bundle in dist/ for hosting (GitHub Pages, Netlify, any static server).
// The only transformation: the MediaPipe runtime is copied out of node_modules into dist/vendor so the
// deployed app has no dependency on npm. Everything else is plain copies.
//   node build.mjs
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const DIST = join(ROOT, 'dist');

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });

// app shell
for (const f of ['index.html', 'styles.css', 'manifest.webmanifest', 'sw.js']) await cp(join(ROOT, f), join(DIST, f));
for (const d of ['src', 'models', 'icons']) await cp(join(ROOT, d), join(DIST, d), { recursive: true });

// MediaPipe runtime -> dist/vendor/tasks-vision
const MP = join(ROOT, 'node_modules', '@mediapipe', 'tasks-vision');
await cp(join(MP, 'vision_bundle.mjs'), join(DIST, 'vendor', 'tasks-vision', 'vision_bundle.mjs'));
await cp(join(MP, 'wasm'), join(DIST, 'vendor', 'tasks-vision', 'wasm'), { recursive: true });

// point hands.js at the vendored runtime
const handsPath = join(DIST, 'src', 'hands.js');
const hands = await readFile(handsPath, 'utf8');
await writeFile(handsPath, hands
  .replace("'../node_modules/@mediapipe/tasks-vision/vision_bundle.mjs'", "'../vendor/tasks-vision/vision_bundle.mjs'")
  .replace("'node_modules/@mediapipe/tasks-vision/wasm'", "'vendor/tasks-vision/wasm'"));

console.log('Built dist/ — serve it with any static web server (https or localhost for the camera).');
