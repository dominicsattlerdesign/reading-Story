// Reine Spiellogik ohne Oberflaeche – dadurch gut testbar.
import type { Aktion, Bedingung, Seite, Tipp } from '../inhalt/typen';
import type { Spielstand } from './speicher';

/** Alle Merker, die auf einer Seite gerade gelten. */
export function merker(stand: Spielstand, seiteId: string): Set<string> {
  const m = new Set<string>(stand.merker[seiteId] ?? []);
  for (const r of stand.geloest[seiteId] ?? []) m.add(`raetsel:${r}`);
  for (const i of stand.inventar) m.add(`inventar:${i}`);
  if (stand.buchstaben.includes(seiteId)) m.add('buchstabe');
  return m;
}

export function erfuellt(wenn: Bedingung | undefined, m: Set<string>): boolean {
  if (!wenn) return true;
  return wenn.every((w) => (w.startsWith('!') ? !m.has(w.slice(1)) : m.has(w)));
}

export function ersteAktion(aktionen: Aktion[] | undefined, m: Set<string>): Aktion | undefined {
  return aktionen?.find((a) => erfuellt(a.wenn, m));
}

export function passenderTipp(tipps: Tipp[], m: Set<string>): Tipp | undefined {
  return tipps.find((t) => erfuellt(t.wenn, m));
}

/** Wendet eine Aktion auf den Spielstand an (Merker, Inventar, Buchstabe). Raetsel oeffnen/Blasen macht die Oberflaeche. */
export function wendeAn(stand: Spielstand, seiteId: string, a: Aktion): Spielstand {
  let s = stand;
  if (a.setze?.length) {
    const alt = s.merker[seiteId] ?? [];
    const neu = [...alt, ...a.setze.filter((x) => !alt.includes(x))];
    s = { ...s, merker: { ...s.merker, [seiteId]: neu } };
  }
  if (a.inventar && !s.inventar.includes(a.inventar)) s = { ...s, inventar: [...s.inventar, a.inventar] };
  if (a.buchstabe && !s.buchstaben.includes(seiteId)) s = { ...s, buchstaben: [...s.buchstaben, seiteId] };
  return s;
}

export function loese(stand: Spielstand, seiteId: string, raetselId: string): Spielstand {
  const alt = stand.geloest[seiteId] ?? [];
  if (alt.includes(raetselId)) return stand;
  return { ...stand, geloest: { ...stand.geloest, [seiteId]: [...alt, raetselId] } };
}

export function alleGeloest(stand: Spielstand, seite: Seite): boolean {
  const g = stand.geloest[seite.id] ?? [];
  return seite.raetsel.every((r) => g.includes(r.id));
}

// ---------- Lueckentext ----------

export type Textteil = { art: 'text'; text: string } | { art: 'luecke'; nr: number; wort: string };

/** "Liebe {Lene}, ich" -> [text "Liebe ", luecke Lene, text ", ich"] */
export function zerlegeLuecken(text: string): Textteil[] {
  const teile: Textteil[] = [];
  const muster = /\{([^}]+)\}/g;
  let letzte = 0;
  let nr = 0;
  let m: RegExpExecArray | null;
  while ((m = muster.exec(text))) {
    if (m.index > letzte) teile.push({ art: 'text', text: text.slice(letzte, m.index) });
    teile.push({ art: 'luecke', nr: nr++, wort: m[1] });
    letzte = m.index + m[0].length;
  }
  if (letzte < text.length) teile.push({ art: 'text', text: text.slice(letzte) });
  return teile;
}

// ---------- Silben ----------

export function silben(wort: string): string[] {
  return wort.split('-');
}

export function ohneTrennung(wort: string): string {
  return wort.replace(/-/g, '');
}

// ---------- Wortschlange ----------

/**
 * "Oma wartet auf" -> Buchstaben ["O","M","A","W",...] und die richtigen Trennstellen.
 * Stelle i liegt zwischen Buchstabe i und i+1.
 */
export function wortschlange(satz: string): { buchstaben: string[]; stellen: number[] } {
  const woerter = satz.trim().split(/\s+/);
  const buchstaben: string[] = [];
  const stellen: number[] = [];
  woerter.forEach((w, i) => {
    buchstaben.push(...[...w.toUpperCase()]);
    if (i < woerter.length - 1) stellen.push(buchstaben.length - 1);
  });
  return { buchstaben, stellen };
}

// ---------- Fehler antippen ----------

export type Fehlerteil =
  | { art: 'text'; text: string } // Leerzeichen, Satzzeichen
  | { art: 'wort'; nr: number; text: string; richtig?: string }; // richtig gesetzt = dieses Wort ist ein Fehler

/** "{heute|Heute} kam Ida." -> Woerter (antippbar) und Zwischenraeume. Fehler tragen die richtige Schreibweise. */
export function zerlegeFehlertext(text: string): Fehlerteil[] {
  const teile: Fehlerteil[] = [];
  let nr = 0;
  const klar = (s: string) => {
    for (const stueck of s.split(/([\s.,!?;:„“"]+)/)) {
      if (!stueck) continue;
      if (/^[\s.,!?;:„“"]+$/.test(stueck)) teile.push({ art: 'text', text: stueck });
      else teile.push({ art: 'wort', nr: nr++, text: stueck });
    }
  };
  const muster = /\{([^|}]+)\|([^}]+)\}/g;
  let letzte = 0;
  let m: RegExpExecArray | null;
  while ((m = muster.exec(text))) {
    klar(text.slice(letzte, m.index));
    teile.push({ art: 'wort', nr: nr++, text: m[1], richtig: m[2] });
    letzte = m.index + m[0].length;
  }
  klar(text.slice(letzte));
  return teile;
}

/** Zusammengesetztes Wort: "Schaukel" + "Pferd" -> "Schaukelpferd" */
export function verbinde(a: string, b: string): string {
  return a + b.charAt(0).toLowerCase() + b.slice(1);
}

// ---------- Auswahl ----------

/** "_ein" + "St" -> "Stein"; "Die Schnecke _ (kriechen)." + "kriecht" -> "Die Schnecke kriecht." */
export function fuelleLuecke(frage: string, antwort: string): string {
  return frage.replace('_', antwort).replace(/\s*\([^)]*\)/, '');
}

// ---------- Silben zusammensetzen ----------

/** Silben fuer ein Wort plus ein paar Silben aus anderen Woertern zum Ablenken (ohne doppelte) */
export function silbenAuswahl(woerter: string[], nr: number, ablenker = 2): string[] {
  const eigene = silben(woerter[nr]);
  const fremde = woerter.flatMap((w, i) => (i === nr ? [] : silben(w))).filter((s) => !eigene.includes(s));
  const gewaehlt = [...new Set(fremde)].slice(0, ablenker);
  return [...eigene, ...gewaehlt];
}

// ---------- Mischen ----------

/** Mischt eine Liste. Bei mehr als einem Element nie in der Ausgangsreihenfolge (sonst waere es zu leicht). */
export function mischen<T>(liste: T[], zufall: () => number = Math.random): T[] {
  if (liste.length < 2) return [...liste];
  for (let versuch = 0; versuch < 20; versuch++) {
    const a = [...liste];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(zufall() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    if (a.some((x, i) => x !== liste[i])) return a;
  }
  return [...liste.slice(1), liste[0]];
}

// ---------- Seite neu starten ----------

/** Alle Fundstuecke, die es auf dieser Seite gibt (aus Klick-Aktionen und Raetsel-Belohnungen). */
export function inventarDerSeite(seite: Seite): string[] {
  const ids = new Set<string>();
  for (const o of seite.objekte) for (const a of o.klick ?? []) if (a.inventar) ids.add(a.inventar);
  for (const r of seite.raetsel) if (r.belohnung?.inventar) ids.add(r.belohnung.inventar);
  return [...ids];
}

/** Setzt eine Seite auf den Anfang: Merker, geloeste Raetsel, ihr Buchstabe und ihre Fundstuecke sind wieder weg. */
export function seiteZuruecksetzen(stand: Spielstand, seite: Seite): Spielstand {
  const geloest = { ...stand.geloest };
  delete geloest[seite.id];
  const merkerNeu = { ...stand.merker };
  delete merkerNeu[seite.id];
  const weg = inventarDerSeite(seite);
  return {
    ...stand,
    geloest,
    merker: merkerNeu,
    buchstaben: stand.buchstaben.filter((b) => b !== seite.id),
    inventar: stand.inventar.filter((i) => !weg.includes(i)),
  };
}

// ---------- Satz bauen ----------

/**
 * Zerlegt einen Satz in Bausteine: die richtigen Woerter (mit grossem Anfang) und die Kaertchen,
 * wie das Kind sie sieht (erstes Wort klein, Punkt als eigenes Kaertchen).
 */
export function satzBausteine(satz: string): { richtig: string[]; karten: string[] } {
  const zeichen = /[.!?]$/.exec(satz)?.[0] ?? '.';
  const woerter = satz.replace(/[.!?]$/, '').split(/\s+/).filter(Boolean);
  const richtig = [...woerter, zeichen];
  const karten = richtig.map((w, i) => (i === 0 ? w.charAt(0).toLowerCase() + w.slice(1) : w));
  return { richtig, karten };
}
