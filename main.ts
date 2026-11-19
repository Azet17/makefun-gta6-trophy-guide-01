// Leonida Legend — GTA 6 trophy guide entry (Node 22, standard library only).
//
// The entry is the static app in ./app (index.html, app.js, style.css and
// app/data/trophies.json) plus the screenshots in ./screenshots. This program
// is the hand-in step: it stages those two folders into the output directory
// the grader provides and writes the dossier the judge reads, using the
// vendored make.fun library. It never deletes the output directory — the
// grader mounts it — and it writes the same bytes on every run, so the two
// grading runs agree.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root is the directory this file lives in; the output
// directory comes from the environment, falling back to the grader's /output.
const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)));
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

const appSource = join(repoRoot, 'app');
const shotsSource = join(repoRoot, 'screenshots');

function stageFolder(name) {
  const from = join(repoRoot, name);
  const to = join(outputDir, name);
  mkdirSync(to, { recursive: true });
  if (existsSync(from)) cpSync(from, to, { recursive: true });
  return readdirSync(to).length;
}

function assertOutputReady() {
  // The scorer refuses an entry whose app/ or screenshots/ break its caps, so
  // refuse early with a plain error instead of handing in a broken dossier.
  const appStat = statSync(appSource);
  if (!appStat.isDirectory()) throw new Error('app/ is missing from the repository');
  const indexStat = statSync(join(appSource, 'index.html'));
  if (!indexStat.isFile()) throw new Error('app/index.html is missing');
}

mkdirSync(outputDir, { recursive: true });
assertOutputReady();
const appEntries = stageFolder('app');
const shotEntries = stageFolder('screenshots');
if (shotEntries < 3 || shotEntries > 4) {
  throw new Error(`expected 3 or 4 screenshots, found ${shotEntries}`);
}

// The scorer's own caps (from the kit's gate): only text_max_bytes shapes the
// dossier's bytes; the other caps refuse an entry the scorer would refuse.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`staged ${appEntries} app entries and ${shotEntries} screenshots into ${outputDir}`);
