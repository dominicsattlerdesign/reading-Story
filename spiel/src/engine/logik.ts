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
