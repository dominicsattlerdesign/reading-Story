// Trennt einen Bogen mit durchsichtigem Hintergrund in einzelne Figuren (von links nach rechts) und schneidet sie knapp zu.
// Aufruf im Ordner spiel/: node scripts/figuren_trennen.mjs <quelle.png> <ziel_ohne_endung> -> ziel_1.png, ziel_2.png, ...
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
const sharp = require('sharp');
const [quelle, ziel] = process.argv.slice(2);
const { data, info } = await sharp(quelle).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
// sehr schwache Reste (fast unsichtbar) ganz entfernen, damit nichts zwischen den Figuren haengen bleibt
for (let i = 3; i < data.length; i += 4) if (data[i] < 12) data[i] = 0;
const spalte = new Array(w).fill(0);
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 20) spalte[x]++;
const teile = []; let an = false, s0 = 0;
spalte.forEach((v, i) => { if (v > 0 && !an) { s0 = i; an = true; } if (v === 0 && an) { teile.push([s0, i - 1]); an = false; } });
if (an) teile.push([s0, w - 1]);
let n = 0;
for (const [a, b] of teile.filter(([a, b]) => b - a > 40)) {
  n++;
  const stueck = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).extract({ left: a, top: 0, width: b - a + 1, height: h }).png().toBuffer();
  const aus = await sharp(stueck).trim({ threshold: 1 }).png({ compressionLevel: 9 }).toFile(`${ziel}_${n}.png`);
  console.log(`${ziel}_${n}.png`, aus.width, aus.height);
}
