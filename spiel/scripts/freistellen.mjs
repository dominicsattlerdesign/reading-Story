// Stellt eine Figur vor schwarzem Hintergrund frei: Schwarz, das mit dem Bildrand verbunden ist, wird durchsichtig,
// am Rand der Figur mit weichem Uebergang. Eingeschlossene schwarze Luecken (z. B. zwischen Locken) auch.
// Aufruf im Ordner spiel/: node scripts/freistellen.mjs <quelle.png> <ziel.png> [schwelle] [behalten]
// behalten: Punkte "x,y;x,y" im Original; schwarze Flaechen im Umkreis von 30 px bleiben (z. B. die Pupillen).
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
const sharp = require('sharp');
const [quelle, ziel, schwelleArg = '28', behaltenArg = ''] = process.argv.slice(2);
const behalten = behaltenArg.split(';').filter(Boolean).map((s) => s.split(',').map(Number));
const schwelle = +schwelleArg;
const { data, info } = await sharp(quelle).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
const hell = (i) => Math.max(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
// Flutfuellung vom Rand aus ueber alle fast schwarzen Pixel
const weg = new Uint8Array(w * h);
const stapel = [];
for (let x = 0; x < w; x++) stapel.push(x, (h - 1) * w + x);
for (let y = 0; y < h; y++) stapel.push(y * w, y * w + w - 1);
while (stapel.length) {
  const p = stapel.pop();
  if (weg[p] || hell(p) > schwelle) continue;
  weg[p] = 1;
  const x = p % w, y = (p / w) | 0;
  if (x > 0) stapel.push(p - 1);
  if (x < w - 1) stapel.push(p + 1);
  if (y > 0) stapel.push(p - w);
  if (y < h - 1) stapel.push(p + w);
}
// Eingeschlossene schwarze Flaechen (z. B. zwischen Locken) ebenfalls entfernen, wenn sie gross genug sind.
// Nur echtes Hintergrund-Schwarz (fast 0) zaehlt, damit gemalte dunkle Stellen wie Pupillen bleiben.
const tiefschwarz = 3;
const innenGrenze = 6;
const gesehen = new Uint8Array(w * h);
for (let s = 0; s < w * h; s++) {
  if (weg[s] || gesehen[s] || hell(s) > tiefschwarz) continue;
  const teil = [];
  const st = [s];
  gesehen[s] = 1;
  while (st.length) {
    const p = st.pop();
    teil.push(p);
    const x = p % w, y = (p / w) | 0;
    for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1]) {
      if (q >= 0 && !gesehen[q] && !weg[q] && hell(q) <= innenGrenze) { gesehen[q] = 1; st.push(q); }
    }
  }
  // geschuetzt, wenn ein Teil der Flaeche nah (30 px) an einem Behalten-Punkt liegt (Pupillen werden oft vom Lichtpunkt geteilt)
  const geschuetzt = behalten.some(([bx, by]) => teil.some((p) => Math.hypot((p % w) - bx, ((p / w) | 0) - by) <= 30));
  if (teil.length >= 40 && !geschuetzt) for (const p of teil) weg[p] = 1;
}
for (let p = 0; p < w * h; p++) {
  if (weg[p]) { data[p * 4 + 3] = 0; continue; }
  // Randpixel neben dem Hintergrund: je dunkler, desto durchsichtiger (weicher Uebergang statt schwarzem Saum)
  const x = p % w, y = (p / w) | 0;
  const nachbar = (x > 0 && weg[p - 1]) || (x < w - 1 && weg[p + 1]) || (y > 0 && weg[p - w]) || (y < h - 1 && weg[p + w]);
  if (nachbar) data[p * 4 + 3] = Math.min(255, Math.round((hell(p) / (schwelle * 3)) * 255));
}
await sharp(data, { raw: { width: w, height: h, channels: 4 } }).trim({ threshold: 1 }).png({ compressionLevel: 9 }).toFile(ziel);
const m = await sharp(ziel).metadata();
console.log('freigestellt', m.width, m.height);
