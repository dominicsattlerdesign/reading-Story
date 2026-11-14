import { describe, it, expect } from 'vitest';
import { laden, speichern, neuerSpielstand, hatFortschritt, SCHLUESSEL, type Ablage } from './speicher';

function testAblage(start: Record<string, string> = {}): Ablage {
  const daten = { ...start };
  return {
    lesen: (k) => daten[k] ?? null,
    schreiben: (k, w) => { daten[k] = w; },
    loeschen: (k) => { delete daten[k]; },
  };
}

describe('speicher', () => {
  it('liefert einen neuen Spielstand, wenn nichts gespeichert ist', () => {
    const s = laden(testAblage());
    expect(s).toEqual(neuerSpielstand());
    expect(hatFortschritt(s)).toBe(false);
  });

  it('speichert und laedt einen Spielstand', () => {
    const a = testAblage();
    const s = { ...neuerSpielstand(), seite: 's01', inventar: ['silberfeder'], geloest: { s01: ['brief'] } };
    speichern(s, a);
    expect(laden(a)).toEqual(s);
    expect(hatFortschritt(laden(a))).toBe(true);
  });

  it('ueberlebt kaputte Daten', () => {
    expect(laden(testAblage({ [SCHLUESSEL]: '{kaputt' }))).toEqual(neuerSpielstand());
  });

  it('liest alte Spielstaende mit Vorlese-Einstellungen und laesst diese weg', () => {
    const alt = JSON.stringify({ version: 1, seite: 's03', inventar: ['laterne'], einstellungen: { autoVorlesen: true, tempo: 0.9 } });
    expect(laden(testAblage({ [SCHLUESSEL]: alt }))).toEqual({ ...neuerSpielstand(), seite: 's03', inventar: ['laterne'] });
  });
});
