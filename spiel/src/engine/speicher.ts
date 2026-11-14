// Spielstand speichern und laden. Funktioniert ohne Internet und ohne Konto.
// Die Ablage ist austauschbar (Browser heute, Capacitor-Preferences in der App).

export interface Spielstand {
  version: 1;
  seite: string | null; // zuletzt geoeffnete Doppelseite
  geloest: Record<string, string[]>; // Seite -> geloeste Raetsel-IDs
  inventar: string[];
  buchstaben: string[]; // gefundene versteckte Buchstaben (Seiten-IDs)
  merker: Record<string, string[]>; // Seite -> gesetzte Merker (z. B. "fenster_offen")
}

export interface Ablage {
  lesen(schluessel: string): string | null;
  schreiben(schluessel: string, wert: string): void;
  loeschen(schluessel: string): void;
}

export const SCHLUESSEL = 'ida-pegasus/spielstand';

export function neuerSpielstand(): Spielstand {
  return { version: 1, seite: null, geloest: {}, inventar: [], buchstaben: [], merker: {} };
}

/** Browser-Speicher. Faellt still auf "nichts gespeichert" zurueck, wenn er gesperrt ist. */
export const browserAblage: Ablage = {
  lesen(k) {
    try { return localStorage.getItem(k); } catch { return null; }
  },
  schreiben(k, w) {
    try { localStorage.setItem(k, w); } catch { /* privates Fenster o. ae. – Spiel laeuft trotzdem */ }
  },
  loeschen(k) {
    try { localStorage.removeItem(k); } catch { /* egal */ }
  },
};

/** Liest den Spielstand. Kaputte oder alte Daten werden mit Standardwerten aufgefuellt, nie verworfen. */
export function laden(ablage: Ablage = browserAblage): Spielstand {
  const roh = ablage.lesen(SCHLUESSEL);
  if (!roh) return neuerSpielstand();
  try {
    const d = JSON.parse(roh) as Partial<Spielstand>;
    return {
      version: 1,
      seite: typeof d.seite === 'string' ? d.seite : null,
      geloest: d.geloest && typeof d.geloest === 'object' ? d.geloest : {},
      inventar: Array.isArray(d.inventar) ? d.inventar : [],
      buchstaben: Array.isArray(d.buchstaben) ? d.buchstaben : [],
      merker: d.merker && typeof d.merker === 'object' ? d.merker : {},
    };
  } catch {
    return neuerSpielstand();
  }
}

export function speichern(stand: Spielstand, ablage: Ablage = browserAblage) {
  ablage.schreiben(SCHLUESSEL, JSON.stringify(stand));
}

export function hatFortschritt(stand: Spielstand): boolean {
  return stand.seite !== null;
}
