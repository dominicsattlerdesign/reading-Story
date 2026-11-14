import type { ComponentChildren } from 'preact';
import { useRef, useState } from 'preact/hooks';

/** Verbindung eines Raetsels zum Rest des Spiels. */
export interface RaetselHelfer {
  /** Rabat sagt etwas (Sprechblase unten links) */
  rabat: (text: string) => void;
  /** Raetsel ist geloest und der Erfolg wurde bestaetigt */
  geschafft: () => void;
  schliessen: () => void;
}

const NOCHMAL = ['Fast! Versuch es nochmal.', 'Hm, das passt noch nicht. Probier es nochmal!', 'Nicht schlimm! Versuch es noch einmal.'];
const LOB = ['Super!', 'Richtig!', 'Toll gemacht!', 'Genau!', 'Prima!'];

export function zufall<T>(liste: T[]): T {
  return liste[Math.floor(Math.random() * liste.length)];
}

/**
 * Fehler-Zaehler pro Stelle, kein Bestrafen:
 * 1. Fehler: freundliches "nochmal", 2. Fehler: erster Tipp, ab 3.: die Loesung leuchtet.
 * Liefert die Stufe (1, 2, 3) zurueck.
 */
export function useFehler(helfer: RaetselHelfer, tipp: string) {
  const zaehler = useRef(new Map<string, number>());
  return {
    fehler(stelle: string): number {
      const n = (zaehler.current.get(stelle) ?? 0) + 1;
      zaehler.current.set(stelle, n);
      if (n === 1) helfer.rabat(zufall(NOCHMAL));
      else if (n === 2) helfer.rabat(tipp);
      else helfer.rabat('Schau mal, was jetzt leuchtet!');
      return Math.min(n, 3);
    },
    richtig() {
      helfer.rabat(zufall(LOB));
    },
  };
}

/** Kurzes Wackeln an einer Stelle ausloesen. */
export function useWackeln(): [string | null, (stelle: string) => void] {
  const [wer, setWer] = useState<string | null>(null);
  const uhr = useRef<number | null>(null);
  return [
    wer,
    (stelle) => {
      setWer(null);
      if (uhr.current) window.clearTimeout(uhr.current);
      requestAnimationFrame(() => setWer(stelle));
      uhr.current = window.setTimeout(() => setWer(null), 600);
    },
  ];
}

/** Rahmen um jedes Raetsel: Titel, Aufgabe, Schliessen, Erfolgsmeldung. */
export function RaetselRahmen(props: {
  titel: string;
  aufgabe: string;
  geloest: boolean;
  helfer: RaetselHelfer;
  erfolgText?: string;
  children: ComponentChildren;
}) {
  return (
    <div class="raetsel-hintergrund">
      <section class="raetsel" role="dialog" aria-label={props.titel}>
        <header class="raetsel-kopf">
          <h2>{props.titel}</h2>
          <button class="raetsel-zu" onClick={props.helfer.schliessen} aria-label="Rätsel schließen">
            ✕
          </button>
        </header>
        <p class="raetsel-aufgabe">{props.aufgabe}</p>
        <div class="raetsel-inhalt">{props.children}</div>
        {props.geloest && (
          <div class="erfolg">
            <div class="erfolg-karte">
              <div class="erfolg-sterne" aria-hidden="true">✦ ✧ ✦</div>
              <p>{props.erfolgText ?? 'Super gemacht!'}</p>
              <button class="gross-knopf primaer" onClick={props.helfer.geschafft}>
                Weiter
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
