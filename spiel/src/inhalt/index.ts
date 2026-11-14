import type { Seite, InventarDing } from './typen';

// Alle Seiten-Dateien automatisch einsammeln, sortiert nach Dateiname (s01, s03, ...)
const dateien = import.meta.glob<Seite>('./seiten/*.json', { eager: true, import: 'default' });
export const seiten: Seite[] = Object.keys(dateien)
  .sort()
  .map((k) => dateien[k]);

export function seiteMitId(id: string | null): Seite | undefined {
  return seiten.find((s) => s.id === id);
}

/** Die sieben Fundstuecke in der Reihenfolge der Inventar-Leiste */
export const inventar: InventarDing[] = [
  { id: 'silberfeder', name: 'Silberfeder', bild: 'gegenstaende/inventar/silberfeder' },
  { id: 'laterne', name: 'Laterne', bild: 'gegenstaende/inventar/laterne_dunkel' },
  { id: 'kompass', name: 'Papas Kompass', bild: 'gegenstaende/inventar/kompass' },
  { id: 'schal', name: 'Mamas Schal', bild: 'gegenstaende/inventar/schal_rot' },
  { id: 'faeustling', name: 'Brummbarts Fäustling', bild: 'gegenstaende/inventar/faeustling' },
  { id: 'gluehwuermchen', name: 'Glühwürmchen-Funke', bild: 'figuren/tiere/gluehwuermchen_an_1' },
  { id: 'mondperle', name: 'Mondperle', bild: 'gegenstaende/inventar/mondperle' },
];

export function asset(pfad: string): string {
  return `${import.meta.env.BASE_URL}assets/${pfad}.webp`;
}
