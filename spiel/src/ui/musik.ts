// Hintergrundmusik: Jede Szene hat einen Loop, der endlos laeuft.
// Beim Wechsel blendet die alte Musik weich aus und die neue weich ein.
// Web Audio statt <audio loop>, weil nur so die Wiederholung ohne Luecke klappt.

const UEBERBLENDEN_S = 2.5;
const LAUTSTAERKE = 0.85; // hoechste Lautstaerke (Regler auf 100 %)
const EINSTELLUNG = 'ida-pegasus/musik';
const EINSTELLUNG_LAUT = 'ida-pegasus/musik-lautstaerke';

function liesLaut(): number {
  try { const v = Number(localStorage.getItem(EINSTELLUNG_LAUT)); return Number.isFinite(v) && localStorage.getItem(EINSTELLUNG_LAUT) !== null ? Math.min(1, Math.max(0, v)) : 0.7; } catch { return 0.7; }
}

type Spur = { name: string; quelle: AudioBufferSourceNode; regler: GainNode };

function liesAn(): boolean {
  try { return localStorage.getItem(EINSTELLUNG) !== 'aus'; } catch { return true; }
}

/** MP3-Dateien haben am Anfang und Ende oft ein paar stille Frames (Encoder). Die ueberspringt der Loop. */
function stilleRaender(b: AudioBuffer): { start: number; ende: number } {
  const daten = b.getChannelData(0);
  const grenze = 1e-4;
  const max = Math.min(8192, daten.length >> 2);
  let a = 0;
  while (a < max && Math.abs(daten[a]) < grenze) a++;
  let e = daten.length - 1;
  while (daten.length - 1 - e < max && Math.abs(daten[e]) < grenze) e--;
  return { start: a / b.sampleRate, ende: (e + 1) / b.sampleRate };
}

class Musik {
  private ctx: AudioContext | null = null;
  private haupt: GainNode | null = null;
  private spur: Spur | null = null;
  private gewuenscht: string | null = null;
  private puffer = new Map<string, Promise<AudioBuffer | null>>();
  private an = liesAn();
  private laut = liesLaut(); // 0 bis 1, im Elternbereich einstellbar

  private ziel() {
    return this.an ? LAUTSTAERKE * this.laut : 0;
  }

  lautstaerke() {
    return this.laut;
  }

  setLautstaerke(v: number) {
    this.laut = Math.min(1, Math.max(0, v));
    try { localStorage.setItem(EINSTELLUNG_LAUT, String(this.laut)); } catch { /* egal */ }
    if (this.ctx && this.haupt) this.haupt.gain.setTargetAtTime(this.ziel(), this.ctx.currentTime, 0.1);
  }

  /** Muss bei einem Tippen des Kindes aufgerufen werden (Browser erlauben Ton erst danach). */
  entsperren() {
    if (!this.ctx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.haupt = this.ctx.createGain();
      this.haupt.gain.value = this.ziel();
      this.haupt.connect(this.ctx.destination);
    }
    void this.ctx.resume();
    if (this.gewuenscht && !this.spur) void this.wechseln(this.gewuenscht);
  }

  private zuhoerer = new Set<(an: boolean) => void>();

  istAn() {
    return this.an;
  }

  /** Bescheid bekommen, wenn die Musik an- oder ausgeschaltet wird (Musik-Knopf, Elternbereich). */
  abonnieren(f: (an: boolean) => void): () => void {
    this.zuhoerer.add(f);
    return () => this.zuhoerer.delete(f);
  }

  setAn(an: boolean) {
    this.an = an;
    this.zuhoerer.forEach((f) => f(an));
    try { localStorage.setItem(EINSTELLUNG, an ? 'an' : 'aus'); } catch { /* egal */ }
    if (this.ctx && this.haupt) this.haupt.gain.setTargetAtTime(this.ziel(), this.ctx.currentTime, 0.3);
  }

  /** Musik fuer die aktuelle Szene (null = Stille). Gleiche Musik laeuft einfach weiter. */
  spiele(name: string | null) {
    if (name === this.gewuenscht) return;
    this.gewuenscht = name;
    if (this.ctx) void this.wechseln(name);
  }

  private laden(name: string): Promise<AudioBuffer | null> {
    let p = this.puffer.get(name);
    if (!p) {
      const ctx = this.ctx!;
      p = fetch(`${import.meta.env.BASE_URL}assets/musik/${name}.mp3`)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(`${r.status}`))))
        .then((d) => ctx.decodeAudioData(d))
        .catch(() => null); // fehlt die Datei, bleibt es eben still
      this.puffer.set(name, p);
    }
    return p;
  }

  private async wechseln(name: string | null) {
    const ctx = this.ctx!;
    const alt = this.spur;
    if (alt && alt.name === name) return;

    // alte Musik weich ausblenden
    if (alt) {
      this.spur = null;
      const jetzt = ctx.currentTime;
      alt.regler.gain.cancelScheduledValues(jetzt);
      alt.regler.gain.setValueAtTime(alt.regler.gain.value, jetzt);
      alt.regler.gain.linearRampToValueAtTime(0, jetzt + UEBERBLENDEN_S);
      alt.quelle.stop(jetzt + UEBERBLENDEN_S + 0.05);
    }
    // nur aktuelle und gewuenschte Musik im Speicher halten (decodiert sind das viele MB)
    for (const n of [...this.puffer.keys()]) if (n !== name && n !== alt?.name) this.puffer.delete(n);
    if (!name) return;

    const puffer = await this.laden(name);
    if (!puffer || this.gewuenscht !== name || this.spur) return; // inzwischen wurde umgeblaettert

    const quelle = ctx.createBufferSource();
    quelle.buffer = puffer;
    quelle.loop = true;
    const { start, ende } = stilleRaender(puffer);
    quelle.loopStart = start;
    quelle.loopEnd = ende;
    const regler = ctx.createGain();
    regler.gain.value = 0;
    quelle.connect(regler).connect(this.haupt!);
    const jetzt = ctx.currentTime;
    quelle.start(jetzt, start);
    regler.gain.linearRampToValueAtTime(1, jetzt + UEBERBLENDEN_S);
    this.spur = { name, quelle, regler };
  }
}

export const musik = new Musik();
