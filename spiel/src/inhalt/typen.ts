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
  bild?: string; // Bild gross zeigen (z. B. ein Foto), die Blase steht darunter
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
  /** Beim Erscheinen langsam einblenden (z. B. ein zweites Hintergrundbild, wenn die Sterne aufleuchten) */
  einblenden?: boolean;
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
  /** Text mit Luecken in geschweiften Klammern: "Liebe {Lene}, ..."; passen mehrere Woerter, mit / getrennt: "w{e/a}nn" (das erste ist die Karte) */
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

export interface ReihenfolgeRaetsel extends RaetselBasis {
  typ: 'reihenfolge';
  /** Saetze oder Woerter in der RICHTIGEN Reihenfolge; das Spiel mischt sie */
  karten: string[];
  /** "steine": kurze Woerter auf gemalten Trittsteinen nebeneinander (z. B. ABC ordnen) */
  stil?: 'steine';
}

export interface PaareRaetsel extends RaetselBasis {
  typ: 'paare';
  /** Zusammengehoerige Paare, z. B. ["groß", "klein"]; das erste Wort steht fest, das zweite wird gesucht */
  paare: [string, string][];
}

export interface WortschlangeRaetsel extends RaetselBasis {
  typ: 'wortschlange';
  /** Der Satz mit Leerzeichen; angezeigt wird er in Grossbuchstaben ohne Luecken */
  satz: string;
}

export interface WoerterRaetsel extends RaetselBasis {
  typ: 'woerter';
  /** Zwei Wortteile, die zusammen ein Wort ergeben, z. B. ["Schaukel", "Pferd"] -> Schaukelpferd */
  paare: [string, string][];
}

export interface FehlerRaetsel extends RaetselBasis {
  typ: 'fehler';
  /** Text, falsche Woerter als {falsch|richtig}, z. B. "{heute|Heute} kam {silberwind|Silberwind}." */
  text: string;
}

export interface AuswahlFrage {
  /** Frage oder Satz; "_" ist die Luecke, z. B. "_ein" oder "Die Schnecke _ (kriechen)." */
  frage: string;
  antworten: string[];
  /** die richtige Antwort; sind mehrere sprachlich richtig, eine Liste */
  richtig: string | string[];
  /** wie das fertige Wort angezeigt wird, falls es anders geschrieben wird, z. B. { "St": "stur" } */
  zeige?: Record<string, string>;
}

export interface AuswahlRaetsel extends RaetselBasis {
  typ: 'auswahl';
  /** Lesetext ueber den Fragen (z. B. was Rabbat gerochen hat) */
  text?: string;
  fragen: AuswahlFrage[];
}

export interface SilbenbauRaetsel extends RaetselBasis {
  typ: 'silbenbau';
  /** Woerter mit Silbentrennung, z. B. "Ne-bel-wald"; die Silben werden in der richtigen Reihenfolge angetippt */
  woerter: string[];
}

export interface SatzbauRaetsel extends RaetselBasis {
  typ: 'satzbau';
  /** Richtige Saetze mit Punkt, z. B. "Gib Mehl in die Schüssel."; die Woerter kommen gemischt, das erste klein */
  /** sind mehrere Satzstellungen richtig, eine Liste: die erste liefert die Wortkarten */
  saetze: (string | string[])[];
}

export interface ZauberwortRaetsel extends RaetselBasis {
  typ: 'zauberwort';
  /** Die Woerter in Grossbuchstaben, z. B. ["MUTIGES", "HERZ"]; die Buchstaben kommen gemischt */
  woerter: string[];
}

export type Raetsel = ZauberwortRaetsel | SatzbauRaetsel | SilbenbauRaetsel | AuswahlRaetsel | LueckenRaetsel | SortierRaetsel | SilbenRaetsel | ReihenfolgeRaetsel | PaareRaetsel | WortschlangeRaetsel | WoerterRaetsel | FehlerRaetsel;

export interface Seite {
  id: string; // z. B. "s01"
  nummer: string; // Anzeige, z. B. "1–2"
  titel: string;
  hintergrund: string; // Pfad unter assets/ ohne Endung
  /** Lichtstimmung: toent Figuren passend zum Hintergrund (z. B. warmes Nachtlicht) */
  stimmung?: 'nacht';
  /** Name des Musik-Loops unter assets/musik (ohne Endung), z. B. "nachtlied" */
  musik?: string;
  text: string;
  objekte: Objekt[];
  raetsel: Raetsel[];
  buchstabe?: string; // versteckter Buchstabe dieser Seite (die letzten Seiten haben keinen mehr)
  tipps: Tipp[]; // Rabbat-Hilfe ausserhalb der Raetsel, erste passende gilt
  fertig: string; // Satz, wenn alle Raetsel geloest sind
  naechste: string | null; // ID der naechsten Seite
  /** Letzte Seite: Schlussbild und Schlusstext nach dem letzten Weiter */
  schluss?: { bild: string; text: string };
}

export interface InventarDing {
  id: string;
  name: string;
  bild: string;
}
