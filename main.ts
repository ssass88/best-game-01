/**
 * CYBER BLADE: NEON OVERDRIVE - Entrypoint for make.fun best-game-01
 * 
 * Hands in the game submission:
 * 1. Copies game/ (offline HTML5 canvas and ES module retro arcade shooter) to /output/game.
 * 2. Copies screenshots/ (cover and gameplay captures) to /output/screenshots.
 * 3. Builds and writes dossier.json summary for multimodal AI judging.
 */

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

console.log(`[best-game-01] Exporting CYBER BLADE: NEON OVERDRIVE to ${outDir}...`);

// Ensure output directories exist
mkdirSync(outDir, { recursive: true });

// Copy offline game sources
const gameSrc = join(here, 'game');
const gameDst = join(outDir, 'game');
cpSync(gameSrc, gameDst, { recursive: true });

// Copy visual screenshots
const ssSrc = join(here, 'screenshots');
const ssDst = join(outDir, 'screenshots');
mkdirSync(ssDst, { recursive: true });
if (existsSync(ssSrc)) {
  cpSync(ssSrc, ssDst, { recursive: true });
}

// Build dossier for the AI judge
const dossierContent = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});

writeFileSync(join(outDir, 'dossier.json'), dossierContent);
console.log(`[best-game-01] Dossier successfully generated (${dossierContent.length} bytes).`);
