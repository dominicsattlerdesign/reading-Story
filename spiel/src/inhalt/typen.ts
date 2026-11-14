// Datenformat einer Doppelseite. Jede Seite liegt als JSON-Datei in src/inhalt/seiten/.
// Koordinaten beziehen sich auf die Buehne mit 1600 x 900 Punkten.

export interface Seite {
  id: string; // z. B. "s01"
  nummer: string; // Anzeige, z. B. "1–2"
  titel: string;
  hintergrund: string; // Pfad unter assets/ ohne Endung, z. B. "hintergruende/ort01_idas_zimmer"
  text: string;
  /** Figuren, die in der Szene stehen (werden in Etappe 1 ausgebaut) */
  figuren?: Figur[];
}

export interface Figur {
  bild: string; // Pfad unter assets/ ohne Endung
  x: number; // linke Kante
  y: number; // Unterkante (Fuesse)
  hoehe: number;
  spiegeln?: boolean;
}

export interface InventarDing {
  id: string;
  name: string;
  bild: string;
}
