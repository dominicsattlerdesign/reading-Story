// Entfernt aufgemalte Schachbrett-Reste (weisse und graue, farblose Pixel) aus einem Bild,
// das schon teilweise durchsichtig ist: in Haarluecken, zwischen Beinen usw.
// Aufruf im Ordner spiel/: node scripts/schachbrett_reste.mjs <quelle.png> <ziel.png> [behalten "x,y;x,y"]
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
const sharp = require('sharp');
const [quelle, ziel, behaltenArg = ''] = process.argv.slice(2);
const behalten = behaltenArg.split(';').filter(Boolean).map((s) => s.split(',').map(Number));
const { data, info } = await sharp(quelle).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
const durch = (p) => data[p * 4 + 3] < 20;
// Schachbrett-Farbe: farblos oder leicht blaeulich (nie warm wie Haarstraehne oder Glanzlichter) und entweder fast weiss oder mittelgrau
const kariert = (p) => {
  const r = data[p * 4], g = data[p * 4 + 1], b = data[p * 4 + 2];
  const lo = Math.min(r, g, b), hi = Math.max(r, g, b);
  return b >= r - 1 && hi - lo <= 12 && lo >= 160;
};
const nahAnAuge = (p) => behalten.some(([bx, by]) => Math.hypot((p % w) - bx, ((p / w) | 0) - by) <= 30);
const weg = new Uint8Array(w * h);
const gesehen = new Uint8Array(w * h);
for (let s = 0; s < w * h; s++) {
  if (gesehen[s] || durch(s) || !kariert(s)) continue;
  const teil = [], q = [s];
  gesehen[s] = 1;
  let amRand = false; // grenzt an schon durchsichtige Flaeche
  while (q.length) {
    const p = q.pop();
    teil.push(p);
    const x = p % w, y = (p / w) | 0;
    for (const n of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1]) {
      if (n < 0) continue;
      if (durch(n)) { amRand = true; continue; }
      if (!gesehen[n] && kariert(n)) { gesehen[n] = 1; q.push(n); }
    }
  }
  // grenzt an den Hintergrund oder ist eine eingeschlossene, nicht winzige Flaeche
  if ((amRand || teil.length >= 25) && !teil.some(nahAnAuge)) for (const p of teil) weg[p] = 1;
}
let n = 0;
for (let p = 0; p < w * h; p++) if (weg[p]) { data[p * 4 + 3] = 0; n++; }
await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 9 }).toFile(ziel);
console.log('entfernt', n, 'Pixel');
