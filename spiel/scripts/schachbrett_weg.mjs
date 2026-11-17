// Entfernt einen aufgemalten hellgrauen "Transparenz-Schachbrett"-Hintergrund und speichert jede Figur einzeln.
// Hintergrund = fast farblos und sehr hell (Weiss/Hellgrau). Aufruf im Ordner spiel/:
// node scripts/schachbrett_weg.mjs <quelle.png> <ziel_ohne_endung> [min_luecke] [behalten] -> ziel_1.png, ziel_2.png, ... (von links nach rechts)
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
const sharp = require('sharp');
const [quelle, ziel, minArg = "4", behaltenArg = ""] = process.argv.slice(2);
// behalten: Punkte "x,y;x,y" im Original (z. B. Augen); helle Flaechen im Umkreis von 30 px bleiben
const behalten = behaltenArg.split(';').filter(Boolean).map((s) => s.split(',').map(Number));
// auch kleine Luecken zwischen Locken entfernen (ab so vielen Pixeln)
const MIN_LUECKE = +minArg;
const { data, info } = await sharp(quelle).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
const hg = (p, min = 238, bunt = 6) => {
  const r = data[p * 4], g = data[p * 4 + 1], b = data[p * 4 + 2];
  return Math.min(r, g, b) >= min && Math.max(r, g, b) - Math.min(r, g, b) <= bunt;
};
const weg = new Uint8Array(w * h);
const st = [];
for (let x = 0; x < w; x++) st.push(x, (h - 1) * w + x);
for (let y = 0; y < h; y++) st.push(y * w, y * w + w - 1);
while (st.length) {
  const p = st.pop();
  if (weg[p] || !hg(p)) continue;
  weg[p] = 1;
  const x = p % w, y = (p / w) | 0;
  if (x > 0) st.push(p - 1); if (x < w - 1) st.push(p + 1); if (y > 0) st.push(p - w); if (y < h - 1) st.push(p + w);
}
// eingeschlossene Schachbrett-Flaechen (z. B. zwischen Arm und Koerper)
const gesehen = new Uint8Array(w * h);
for (let s = 0; s < w * h; s++) {
  if (weg[s] || gesehen[s] || !hg(s)) continue;
  const teil = [], q = [s]; gesehen[s] = 1;
  while (q.length) { const p = q.pop(); teil.push(p); const x = p % w, y = (p / w) | 0;
    for (const n of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1]) if (n >= 0 && !gesehen[n] && !weg[n] && hg(n)) { gesehen[n] = 1; q.push(n); } }
  const geschuetzt = behalten.some(([bx, by]) => teil.some((p) => Math.hypot((p % w) - bx, ((p / w) | 0) - by) <= 30));
  // kleine Luecken nur, wenn sie wirklich reines Weiss/Grau sind (Augenweiss und weisse Straehne haben einen leichten Farbton)
  const rein = teil.length >= 300 || teil.every((p) => hg(p, 244, 3));
  if (teil.length >= MIN_LUECKE && rein && !geschuetzt) for (const p of teil) weg[p] = 1;
}
// heller, farbloser Saum direkt am Rand ebenfalls entfernen
for (let p = 0; p < w * h; p++) {
  if (weg[p]) { data[p * 4 + 3] = 0; continue; }
  const x = p % w, y = (p / w) | 0;
  const rand = (x > 0 && weg[p - 1]) || (x < w - 1 && weg[p + 1]) || (y > 0 && weg[p - w]) || (y < h - 1 && weg[p + w]);
  if (rand && hg(p, 215, 16)) data[p * 4 + 3] = 0;
}
// Figuren nach freien Spalten trennen
const spalte = new Array(w).fill(0);
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 20) spalte[x]++;
const teile = []; let an = false, s0 = 0;
spalte.forEach((v, i) => { if (v > 0 && !an) { s0 = i; an = true; } if (v === 0 && an) { teile.push([s0, i - 1]); an = false; } });
if (an) teile.push([s0, w - 1]);
const gross = teile.filter(([a, b]) => b - a > 40);
let n = 0;
for (const [a, b] of gross) {
  n++;
  const bild = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).extract({ left: a, top: 0, width: b - a + 1, height: h }).png().toBuffer();
  const aus = await sharp(bild).trim({ threshold: 1 }).png({ compressionLevel: 9 }).toFile(`${ziel}_${n}.png`);
  console.log(`${ziel}_${n}.png`, aus.width, aus.height);
}
