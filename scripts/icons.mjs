// Renders Aiio's Android launcher icons and splash logo: an answer-book page (white, with the
// red margin rule and ruled lines) and a blue-ink tick, on blue ink. Output is committed under
// native/android/res, so the APK build needs no image tools. Re-run after changing the mark:
//   node scripts/icons.mjs
// Uses sharp (installed globally here: npm root -g).
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let sharp;
try {
  sharp = require('sharp');
} catch {
  sharp = require(join(execSync('npm root -g').toString().trim(), 'sharp'));
}
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const res = join(root, 'native/android/res');

const INK = '#2747C9';
const RED = '#C23B33';
const RULE = '#C9D1DE';

/** The page mark, drawn in a 108 × 108 box, centred, at scale s (1 = fits the 66-unit safe zone). */
const page = (s = 1, tick = INK) => `<g transform="translate(54 54) scale(${s}) translate(-54 -54)">
  <rect x="31" y="24" width="46" height="60" rx="6" fill="#FFFFFF"/>
  <line x1="41" y1="24" x2="41" y2="84" stroke="${RED}" stroke-width="2"/>
  <line x1="45" y1="38" x2="70" y2="38" stroke="${RULE}" stroke-width="2" stroke-linecap="round"/>
  <line x1="45" y1="48" x2="70" y2="48" stroke="${RULE}" stroke-width="2" stroke-linecap="round"/>
  <line x1="45" y1="58" x2="62" y2="58" stroke="${RULE}" stroke-width="2" stroke-linecap="round"/>
  <path d="M47 66 L54 73 L70 55" fill="none" stroke="${tick}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</g>`;

const background = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108"><rect width="108" height="108" fill="${INK}"/></svg>`;
const foreground = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108">${page(1)}</svg>`;
// Themed icon: the page silhouette with the tick cut out (Android uses only the alpha).
const monochrome = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108"><defs><mask id="m"><rect x="31" y="24" width="46" height="60" rx="6" fill="#fff"/><path d="M47 66 L54 73 L70 55" fill="none" stroke="#000" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></mask></defs><rect width="108" height="108" fill="#fff" mask="url(#m)"/></svg>`;
function legacy(shape) {
  const clip = shape === 'round' ? '<clipPath id="c"><circle cx="54" cy="54" r="54"/></clipPath>' : '<clipPath id="c"><rect width="108" height="108" rx="24"/></clipPath>';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108"><defs>${clip}</defs><g clip-path="url(#c)"><rect width="108" height="108" fill="${INK}"/>${page(1.3)}</g></svg>`;
}
const splash = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="20 18 68 72"><g>${page(1).replace('fill="#FFFFFF"', `fill="#FFFFFF" stroke="${RULE}" stroke-width="1.2"`)}</g></svg>`;

async function png(svg, w, h, file) {
  const out = join(res, file);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, await sharp(Buffer.from(svg)).resize(w, h).png().toBuffer());
}

const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [name, scale] of Object.entries(DENSITIES)) {
  const legacySize = Math.round(48 * scale);
  const layer = Math.round(108 * scale);
  await png(legacy('square'), legacySize, legacySize, `mipmap-${name}/ic_launcher.png`);
  await png(legacy('round'), legacySize, legacySize, `mipmap-${name}/ic_launcher_round.png`);
  await png(foreground(), layer, layer, `mipmap-${name}/ic_launcher_foreground.png`);
  await png(background(), layer, layer, `mipmap-${name}/ic_launcher_background.png`);
  await png(monochrome(), layer, layer, `mipmap-${name}/ic_launcher_monochrome.png`);
}
await png(splash(), 480, 508, 'drawable-nodpi/splash_logo.png');
mkdirSync(join(root, 'docs/assets'), { recursive: true });
writeFileSync(join(root, 'docs/assets/icon-512.png'), await sharp(Buffer.from(legacy('square'))).resize(512, 512).png().toBuffer());
console.log('icons written');
