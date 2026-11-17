// Macht aus den Original-Musikstuecken (../musik/originale) nahtlose Loops (../musik/loops)
// und legt sie fuers Spiel nach public/assets/musik.
//
// Pro Stueck:
//  1. Die ersten 10 Sekunden fallen weg.
//  2. Gegen Ende wird die Stelle gesucht, die am besten zum (neuen) Anfang passt,
//     aber noch vor einem Ausklingen am Schluss liegt.
//  3. Die letzten Sekunden vor dieser Stelle werden weich in die Sekunden vor dem Anfang
//     uebergeblendet. Beim Wiederholen geht das Ende so ohne hoerbaren Sprung in den Anfang ueber.
//  4. Speichern als MP3. Die Originale bleiben unveraendert.
//
// Braucht ffmpeg: entweder im PATH, ueber die Umgebungsvariable FFMPEG oder als Paket "ffmpeg-static".
// Es wird nur neu gerechnet, wenn das Original neuer ist als der Loop.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { copyFile, mkdir, readdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const spiel = join(dirname(fileURLToPath(import.meta.url)), '..');
const originale = join(spiel, '..', 'musik', 'originale');
const loops = join(spiel, '..', 'musik', 'loops');
const ziel = join(spiel, 'public', 'assets', 'musik');

/** Original-Datei -> Name des Loops im Spiel (ohne Endung) */
const STUECKE = {
  'titel melodie und zuhause.mp3': 'titel_zuhause',
  'Spring Night Lullaby.mp3': 'nachtlied',
  'garten und waldrand.mp3': 'garten_waldrand',
  'Nebelwald.mp3': 'nebelwald',
  'holundas hexenhaus.mp3': 'hexenhaus',
  'mondsee.mp3': 'mondsee',
  'echohöhle.mp3': 'echohoehle',
  'wolkenpfad und gipfel.mp3': 'wolkenpfad_gipfel',
  'flugnachhause und finale.mp3': 'flug_finale',
};

const RATE = 44100;
const KANAELE = 2;
const ANFANG_WEG_S = 10; // so viel faellt am Anfang weg
const UEBERGANG_S = 3; // Laenge der Ueberblendung am Loop-Ende
const SUCHFENSTER_S = 30; // so weit vor dem Schluss wird die beste Loop-Stelle gesucht

function ffmpegPfad() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  try {
    return createRequire(import.meta.url)('ffmpeg-static');
  } catch {
    return 'ffmpeg';
  }
}

function lauf(args, eingabe) {
  return new Promise((ok, fehler) => {
    const p = spawn(ffmpegPfad(), args, { stdio: ['pipe', 'pipe', 'pipe'] });
    const teile = [];
    let log = '';
    p.stdout.on('data', (d) => teile.push(d));
    p.stderr.on('data', (d) => (log += d));
    p.on('error', fehler);
    p.on('close', (code) => (code === 0 ? ok(Buffer.concat(teile)) : fehler(new Error(log || `ffmpeg Fehler ${code}`))));
    if (eingabe) p.stdin.end(eingabe);
    else p.stdin.end();
  });
}

/** MP3 -> Float32 (Stereo, verschraenkt) */
async function lesen(datei) {
  const roh = await lauf(['-v', 'error', '-i', datei, '-f', 'f32le', '-ac', String(KANAELE), '-ar', String(RATE), '-']);
  return new Float32Array(roh.buffer, roh.byteOffset, roh.byteLength / 4);
}

async function schreiben(datei, samples) {
  const daten = Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength);
  await lauf(['-v', 'error', '-y', '-f', 'f32le', '-ar', String(RATE), '-ac', String(KANAELE), '-i', '-', '-c:a', 'libmp3lame', '-b:a', '160k', datei], daten);
}

/** Mono-Huellkurve: Lautstaerke (RMS) je 100 ms */
function lautheit(x, frames) {
  const fenster = RATE / 10;
  const werte = [];
  for (let f = 0; f + fenster <= frames; f += fenster) {
    let s = 0;
    for (let i = f; i < f + fenster; i++) {
      const m = (x[i * 2] + x[i * 2 + 1]) / 2;
      s += m * m;
    }
    werte.push(Math.sqrt(s / fenster));
  }
  return werte;
}

/** Normalisierte Aehnlichkeit zweier Ausschnitte (Mono, jeder 4. Wert) */
function aehnlichkeit(x, a, b, laenge) {
  let ab = 0, aa = 0, bb = 0;
  for (let i = 0; i < laenge; i += 4) {
    const u = x[(a + i) * 2] + x[(a + i) * 2 + 1];
    const v = x[(b + i) * 2] + x[(b + i) * 2 + 1];
    ab += u * v; aa += u * u; bb += v * v;
  }
  const korrelation = aa && bb ? ab / Math.sqrt(aa * bb) : 0;
  const lautVerhaeltnis = aa && bb ? Math.min(aa, bb) / Math.max(aa, bb) : 0;
  return korrelation * Math.sqrt(lautVerhaeltnis);
}

function baueLoop(x) {
  const frames = x.length / KANAELE;
  const C = UEBERGANG_S * RATE; // Ueberblendung
  const ZEHNTEL = RATE / 10;

  const laut = lautheit(x, frames);
  const ab10 = ANFANG_WEG_S * 10; // Index der 10-Sekunden-Marke in Zehntelsekunden
  const sortiert = laut.slice(ab10).sort((p, q) => p - q);
  const median = sortiert[Math.floor(sortiert.length / 2)] ?? 0;

  // Neuer Anfang: nach den 10 Sekunden. Liegt dort eine leise Pause, beginnt der Loop erst,
  // wenn die Musik wieder einsetzt (hoechstens 10 s spaeter), mit 0,3 s Vorlauf fuer den Einsatz.
  let start = ab10;
  while (start < ab10 + 100 && start < laut.length && laut[start] < median * 0.6) start++;
  if (start >= ab10 + 100 || start >= laut.length) start = ab10;
  const S = Math.max(ANFANG_WEG_S * RATE, (start - 3) * ZEHNTEL);

  // Wo klingt das Stueck aus? Letzte Stelle, die noch mindestens halb so laut ist wie ueblich.
  let letzte = laut.length - 1;
  while (letzte > 0 && laut[letzte] < median * 0.5) letzte--;
  const eMax = Math.min(frames, (letzte - 5) * (RATE / 10)); // eine halbe Sekunde Sicherheitsabstand
  const eMin = Math.max(S + 60 * RATE, eMax - SUCHFENSTER_S * RATE);
  if (eMax <= eMin) throw new Error('Stueck ist zu kurz fuer einen Loop');

  // Beste Loop-Stelle: Die Sekunden um E sollen klingen wie die Sekunden um den Anfang S.
  const vergleich = 2 * RATE;
  let besteE = eMax, besteWertung = -Infinity;
  for (let e = eMin; e <= eMax; e += RATE / 200) {
    const w = aehnlichkeit(x, S - vergleich / 2, e - vergleich / 2, vergleich);
    if (w > besteWertung) { besteWertung = w; besteE = e; }
  }
  const E = Math.round(besteE);

  // Loop = Original von S bis E; die letzten C Frames blenden in die C Frames vor S ueber.
  const laenge = E - S;
  const y = new Float32Array(laenge * KANAELE);
  for (let t = 0; t < laenge; t++) {
    for (let k = 0; k < KANAELE; k++) {
      const jetzt = x[(S + t) * KANAELE + k];
      if (t < laenge - C) {
        y[t * KANAELE + k] = jetzt;
      } else {
        const u = (t - (laenge - C)) / C; // 0 -> 1
        const vorAnfang = x[(t + 2 * S - E) * KANAELE + k]; // laeuft bei u = 1 genau in x[S] hinein
        y[t * KANAELE + k] = jetzt * Math.cos((u * Math.PI) / 2) + vorAnfang * Math.sin((u * Math.PI) / 2);
      }
    }
  }
  return { y, sekunden: laenge / RATE, wertung: besteWertung, anfang: S / RATE };
}

async function neuer(a, b) {
  try { return (await stat(a)).mtimeMs > (await stat(b)).mtimeMs; } catch { return true; }
}

async function main() {
  await mkdir(loops, { recursive: true });
  await mkdir(ziel, { recursive: true });
  const vorhanden = new Set(await readdir(originale).catch(() => []));
  let fehlt = 0;
  for (const [datei, name] of Object.entries(STUECKE)) {
    const quelle = join(originale, datei);
    const loop = join(loops, `${name}.mp3`);
    if (!vorhanden.has(datei)) { console.log(`fehlt: ${datei}`); continue; }
    if (await neuer(quelle, loop)) {
      try {
        const x = await lesen(quelle);
        const { y, sekunden, wertung, anfang } = baueLoop(x);
        await schreiben(loop, y);
        console.log(`Loop: ${name}.mp3 (ab ${anfang.toFixed(1)} s, ${sekunden.toFixed(1)} s lang, Passung ${wertung.toFixed(2)})`);
      } catch (e) {
        fehlt++;
        console.log(`Kein Loop fuer ${datei}: ${e.code === 'ENOENT' ? 'ffmpeg nicht gefunden' : e.message}`);
        continue;
      }
    }
    if (await neuer(loop, join(ziel, `${name}.mp3`))) await copyFile(loop, join(ziel, `${name}.mp3`));
  }
  console.log(fehlt ? `Musik: ${fehlt} Stueck(e) ohne Loop` : 'Musik: alle Loops bereit -> public/assets/musik');
}

main();
