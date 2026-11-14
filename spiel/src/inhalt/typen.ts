// Datenformat einer Doppelseite. Jede Seite liegt als JSON-Datei in src/inhalt/seiten/.
// Koordinaten beziehen sich auf die Buehne mit 1600 x 900 Punkten (oben links = 0,0).
//
// Bedingungen ("wenn") sind Listen von Merkern, die ALLE gelten muessen.
// "name" = Merker ist gesetzt, "!name" = Merker ist nicht gesetzt.
// Automatische Merker: "raetsel:<id>" (geloest), "inventar:<id>" (im Inventar), "buchstabe" (Buchstabe dieser Seite gefunden).

export type Bedingung = string[];

export interface Rechteck {
  x: number;
  y: number;
  b: number; // Breite
  h: number; // Hoehe
}

/** Was beim Antippen passiert. Die erste Variante, deren Bedingung passt, wird ausgefuehrt. */
export interface Aktion {
  wenn?: Bedingung;
  blase?: string; // Sprechblase am Objekt
  setze?: string[]; // Merker setzen
  raetsel?: string; // Raetsel oeffnen
  inventar?: string; // Fundstueck ins Inventar legen
  buchstabe?: boolean; // versteckten Buchstaben dieser Seite einsammeln
}

export interface Objekt extends Rechteck {
  id: string;
  name: string; // fuer Screenreader und Editor
  bild?: string; // Sprite unter assets/ ohne Endung; ohne Bild ist es eine unsichtbare Antipp-Flaeche
  spiegeln?: boolean;
  sichtbar?: Bedingung; // nur anzeigen, wenn erfuellt
  klick?: Aktion[];
  funkeln?: Bedingung; // leicht glitzern, wenn erfuellt (z. B. versteckter Buchstabe)
  ebene?: number; // hoeher = weiter vorne
  /** Eigener Ort fuer die Sprechblase, falls sie sonst etwas Wichtiges verdeckt */
  blaseAnker?: { x: number; y: number; unten?: boolean };
  /** Effekt ueber der ganzen Szene, solange sichtbar */
  effekt?: 'licht';
}

export interface Tipp {
  wenn?: Bedingung;
  text: string;
  zeige?: string; // Objekt-ID, die kurz aufleuchtet
}

// ---------- Raetsel ----------

interface RaetselBasis {
  id: string;
  titel: string;
  aufgabe: string;
  tipps: [string, string]; // erster und deutlicherer Tipp
  erfolg?: string; // Satz auf der Erfolgskarte
  belohnung?: Aktion; // nach dem Loesen
}

export interface LueckenRaetsel extends RaetselBasis {
  typ: 'luecken';
  /** Text mit Luecken in geschweiften Klammern: "Liebe {Lene}, ..." */
  text: string;
  falsche: string[]; // zusaetzliche falsche Woerter
}

export interface SortierKarte {
  id: string;
  text?: string;
  bild?: string;
  emoji?: string;
  gruppe: string;
}

export interface SortierRaetsel extends RaetselBasis {
  typ: 'sortieren';
  gruppen: { id: string; name: string }[];
  karten: SortierKarte[];
}

export interface SilbenRaetsel extends RaetselBasis {
  typ: 'silben';
  /** Woerter mit Silbentrennung durch "-", z. B. "La-ter-ne" */
  woerter: string[];
}

export type Raetsel = LueckenRaetsel | SortierRaetsel | SilbenRaetsel;

export interface Seite {
  id: string; // z. B. "s01"
  nummer: string; // Anzeige, z. B. "1–2"
  titel: string;
  hintergrund: string; // Pfad unter assets/ ohne Endung
  /** Lichtstimmung: toent Figuren passend zum Hintergrund (z. B. warmes Nachtlicht) */
  stimmung?: 'nacht';
  text: string;
  objekte: Objekt[];
  raetsel: Raetsel[];
  buchstabe: string; // versteckter Buchstabe dieser Seite
  tipps: Tipp[]; // Rabat-Hilfe ausserhalb der Raetsel, erste passende gilt
  fertig: string; // Satz, wenn alle Raetsel geloest sind
  naechste: string | null; // ID der naechsten Seite
}

export interface InventarDing {
  id: string;
  name: string;
  bild: string;
}
