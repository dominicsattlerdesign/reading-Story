// Wandelt die Bilder aus ../bilder in schlanke WebP-Dateien fuer das Spiel um (public/assets).
// Es wird nur neu gerechnet, wenn die Quelle neuer ist als das Ergebnis.
import sharp from 'sharp';
import { readdir, stat, mkdir } from 'node:fs/promises';
import { join, dirname, relative, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const spiel = join(dirname(fileURLToPath(import.meta.url)), '..');
const quelle = join(spiel, '..', 'bilder');
const ziel = join(spiel, 'public', 'assets');

// Ordner -> maximale Kantenlaenge (px) und Qualitaet
const regeln = [
  { ordner: 'hintergruende', breite: 1600, hoehe: 900, qualitaet: 80, nurDateien: /^(ort\d\d_.*|start_.*)\.jpg$/ },
  { ordner: 'figuren/einzeln', max: 640, qualitaet: 82 },
  { ordner: 'gegenstaende/einzeln/inventar', max: 320, qualitaet: 85 },
  { ordner: 'gegenstaende/einzeln/klickobjekte', max: 400, qualitaet: 85 },
  { ordner: 'gegenstaende/einzeln/buchstaben', max: 240, qualitaet: 85 },
  { ordner: 'gegenstaende/einzeln/spielzeug', max: 320, qualitaet: 85 },
  { ordner: 'gegenstaende/einzeln/oberflaeche', max: 256, qualitaet: 88 },
  { ordner: 'gegenstaende/einzeln/buch', max: 1100, qualitaet: 85 },
  { ordner: 'gegenstaende/einzeln/knoepfe', max: 900, qualitaet: 88 },
  { ordner: 'gegenstaende/einzeln/kulissen', max: 400, qualitaet: 80, nurDateien: /^kulisse\d_\d+\.png$/ },
  { ordner: 'gegenstaende', max: 640, qualitaet: 85, nurDateien: /^omas_kinderfoto\.png$/, flach: true },
  { ordner: 'figuren', max: 900, qualitaet: 82, nurDateien: /^silberwind_liegend\.png$/, flach: true },
];

async function* dateien(dir, flach) {
  let eintraege;
  try { eintraege = await readdir(dir, { withFileTypes: true }); } catch { return; }
  for (const e of eintraege) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (!flach) yield* dateien(p, flach); }
    else yield p;
  }
}

async function neuer(src, dst) {
  try { return (await stat(src)).mtimeMs > (await stat(dst)).mtimeMs; } catch { return true; }
}

let neu = 0, gesamt = 0;
for (const r of regeln) {
  const basis = join(quelle, r.ordner);
  for await (const src of dateien(basis, r.flach)) {
    const ext = extname(src).toLowerCase();
    if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue;
    if (r.nurDateien && !r.nurDateien.test(basename(src))) continue;
    const rel = relative(quelle, src).replace(/\\/g, '/').replace('/einzeln/', '/').replace(/\.(png|jpe?g)$/i, '.webp');
    const dst = join(ziel, rel);
    gesamt++;
    if (!(await neuer(src, dst))) continue;
    await mkdir(dirname(dst), { recursive: true });
    let bild = sharp(src);
    bild = r.breite
      ? bild.resize({ width: r.breite, height: r.hoehe, fit: 'cover' })
      : bild.resize({ width: r.max, height: r.max, fit: 'inside', withoutEnlargement: true });
    await bild.webp({ quality: r.qualitaet, alphaQuality: 90, effort: 5 }).toFile(dst);
    neu++;
  }
}
console.log(`Bilder: ${gesamt} geprueft, ${neu} neu erzeugt -> public/assets`);
