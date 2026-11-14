// Vorlese-Schicht. Das Spiel spricht nur mit dieser Datei.
// Heute: Sprachausgabe des Browsers. Spaeter austauschbar gegen eigene Aufnahmen
// oder ein Capacitor-Plugin, ohne dass sich das Spiel aendert.

export interface Wort {
  text: string;
  start: number; // Zeichenposition im Gesamttext
  ende: number;
}

/** Zerlegt einen Text in Woerter (inkl. Satzzeichen am Wort) mit ihren Positionen. */
export function woerter(text: string): Wort[] {
  const ergebnis: Wort[] = [];
  const muster = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = muster.exec(text))) ergebnis.push({ text: m[0], start: m.index, ende: m.index + m[0].length });
  return ergebnis;
}

/** Index des Wortes, das an Zeichenposition `pos` beginnt oder sie enthaelt. */
export function wortAnPosition(liste: Wort[], pos: number): number {
  for (let i = 0; i < liste.length; i++) {
    if (pos < liste[i].ende) return i;
  }
  return liste.length - 1;
}

export interface SprechOptionen {
  /** wird mit dem Index des gerade gesprochenen Wortes aufgerufen (-1 = fertig) */
  beiWort?: (index: number) => void;
}

export interface Stimme {
  name: string;
  sprache: string;
}

type Zustand = { sprichtGerade: boolean };
type Hoerer = (z: Zustand) => void;

class Vorleser {
  private tempo = 0.9;
  private stimmenName: string | null = null;
  private hoerer = new Set<Hoerer>();
  private laufend: SpeechSynthesisUtterance | null = null;
  private laufendBeiWort: ((index: number) => void) | null = null;

  get verfuegbar(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  einstellen(tempo: number, stimmenName: string | null) {
    this.tempo = tempo;
    this.stimmenName = stimmenName;
  }

  /** Deutsche Stimmen, die das Geraet anbietet. */
  stimmen(): Stimme[] {
    if (!this.verfuegbar) return [];
    return speechSynthesis
      .getVoices()
      .filter((v) => v.lang.toLowerCase().startsWith('de'))
      .map((v) => ({ name: v.name, sprache: v.lang }));
  }

  private waehleStimme(): SpeechSynthesisVoice | null {
    const alle = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('de'));
    if (!alle.length) return null;
    if (this.stimmenName) {
      const gewaehlt = alle.find((v) => v.name === this.stimmenName);
      if (gewaehlt) return gewaehlt;
    }
    // natuerlicher klingende Stimmen bevorzugen
    const bevorzugt = ['Natural', 'Online', 'Google', 'Katja', 'Hedda', 'Anna', 'Petra'];
    for (const b of bevorzugt) {
      const v = alle.find((s) => s.name.includes(b) && s.lang.toLowerCase() === 'de-de');
      if (v) return v;
    }
    return alle.find((v) => v.lang.toLowerCase() === 'de-de') ?? alle[0];
  }

  /** Liest `text` vor. Ein laufendes Vorlesen wird vorher beendet. */
  sprich(text: string, optionen: SprechOptionen = {}): Promise<void> {
    this.stopp();
    if (!this.verfuegbar || !text.trim()) return Promise.resolve();
    const liste = woerter(text);
    return new Promise((fertig) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'de-DE';
      u.rate = this.tempo;
      u.pitch = 1.05;
      const stimme = this.waehleStimme();
      if (stimme) u.voice = stimme;
      u.onstart = () => {
        this.melde(true);
        optionen.beiWort?.(0);
      };
      u.onboundary = (e) => {
        if (e.name === 'word' || e.name === undefined) optionen.beiWort?.(wortAnPosition(liste, e.charIndex));
      };
      const ende = () => {
        if (this.laufend === u) { this.laufend = null; this.laufendBeiWort = null; }
        optionen.beiWort?.(-1);
        this.melde(false);
        fertig();
      };
      u.onend = ende;
      u.onerror = ende;
      this.laufend = u;
      this.laufendBeiWort = optionen.beiWort ?? null;
      speechSynthesis.speak(u);
    });
  }

  stopp() {
    if (!this.verfuegbar) return;
    if (this.laufend) {
      const alt = this.laufend;
      const altBeiWort = this.laufendBeiWort;
      this.laufend = null;
      this.laufendBeiWort = null;
      alt.onend = null;
      alt.onerror = null;
      alt.onboundary = null;
      altBeiWort?.(-1); // Markierung im abgebrochenen Text entfernen
    }
    speechSynthesis.cancel();
    this.melde(false);
  }

  beobachte(h: Hoerer): () => void {
    this.hoerer.add(h);
    return () => this.hoerer.delete(h);
  }

  private melde(sprichtGerade: boolean) {
    for (const h of this.hoerer) h({ sprichtGerade });
  }
}

export const vorleser = new Vorleser();
