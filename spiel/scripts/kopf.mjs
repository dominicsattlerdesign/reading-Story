// Setzt einen Gesichts-Kopf auf Idas Koerper (ida_vorne_2), z. B. fuer einen anderen Gesichtsausdruck.
// Aufruf im Ordner spiel/: node scripts/kopf.mjs <gesicht> <ausgabe.png> [skala dx dy hals]
// ida_vorne_neugierig: node scripts/kopf.mjs ida_gesicht_neugierig_2 ../bilder/figuren/einzeln/ida/ida_vorne_neugierig.png 0.68 10 -1
import { createRequire } from 'node:module';
const require = createRequire(process.cwd() + '/package.json');
const sharp = require('sharp');
const [gesicht, aus, skalaArg = '0.64', dxArg = '13', dyArg = '2', halsArg = '90'] = process.argv.slice(2);
const F = 4; // Arbeitsaufloesung
const dir = '../bilder/figuren/einzeln/ida/';
const koerper = await sharp(dir + 'ida_vorne_2.png').resize({ width: 150 * F, kernel: 'lanczos3' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = koerper.info;
const k = koerper.data;
// alten Kopf entfernen: alles oberhalb des Halses, mit weichem Uebergang
const hals = +halsArg * F;
for (let y = 0; y < hals + 6 * F; y++) for (let x = 0; x < w; x++) {
  const i = (y * w + x) * 4 + 3;
  if (y < hals) k[i] = 0; else k[i] = Math.round(k[i] * Math.min(1, (y - hals) / (6 * F)));
}
// neuen Kopf skalieren, Unterkante weich auslaufen lassen
const skala = +skalaArg * F;
const gm = await sharp(dir + gesicht + '.png').metadata();
const gw = Math.round(gm.width * skala), gh = Math.round(gm.height * skala);
const g = await sharp(dir + gesicht + '.png').resize({ width: gw, height: gh, kernel: 'lanczos3' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const auslauf = Math.round(gh * 0.16);
for (let y = gh - auslauf; y < gh; y++) for (let x = 0; x < gw; x++) {
  const i = (y * gw + x) * 4 + 3;
  g.data[i] = Math.round(g.data[i] * (gh - y) / auslauf);
}
const kopf = await sharp(g.data, { raw: { width: gw, height: gh, channels: 4 } }).png().toBuffer();
const koerperPng = await sharp(k, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
// erst Koerper, dann Kopf darueber
await sharp({ create: { width: w, height: h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: koerperPng, left: 0, top: 0 }, { input: kopf, left: Math.round(+dxArg * F), top: Math.round(+dyArg * F) }])
  .png().toBuffer().then((b) => sharp(b).trim({ threshold: 1 }).png({ compressionLevel: 9 }).toFile(aus));
console.log('ok', gw, gh);
