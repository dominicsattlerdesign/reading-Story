import { describe, it, expect, vi } from 'vitest';
import { woerter, wortAnPosition, vorleser } from './vorlesen';
import { laden, speichern, neuerSpielstand, zuruecksetzen, hatFortschritt, SCHLUESSEL, type Ablage } from './speicher';

function testAblage(start: Record<string, string> = {}): Ablage & { daten: Record<string, string> } {
  const daten = { ...start };
  return {
    daten,
    lesen: (k) => daten[k] ?? null,
    schreiben: (k, w) => { daten[k] = w; },
    loeschen: (k) => { delete daten[k]; },
  };
}

describe('woerter', () => {
  it('zerlegt Text mit Satzzeichen und Positionen', () => {
    const w = woerter('Ida kann nicht schlafen. Rabat!');
    expect(w.map((x) => x.text)).toEqual(['Ida', 'kann', 'nicht', 'schlafen.', 'Rabat!']);
    expect(w[3]).toEqual({ text: 'schlafen.', start: 15, ende: 24 });
  });

  it('findet das Wort an einer Zeichenposition', () => {
    const w = woerter('Ein Pferd mit Fluegeln');
    expect(wortAnPosition(w, 0)).toBe(0);
    expect(wortAnPosition(w, 4)).toBe(1);
    expect(wortAnPosition(w, 9)).toBe(2); // Leerzeichen nach "Pferd" gehoert zum naechsten Wort
    expect(wortAnPosition(w, 999)).toBe(3);
  });
});

describe('vorleser', () => {
  it('entfernt die Wortmarkierung, wenn ein anderer Text das Vorlesen unterbricht', () => {
    const gesprochen: any[] = [];
    vi.stubGlobal('SpeechSynthesisUtterance', class { constructor(public text: string) {} } as any);
    vi.stubGlobal('speechSynthesis', { speak: (u: any) => gesprochen.push(u), cancel: () => {}, getVoices: () => [] });

    const seite = vi.fn();
    vorleser.sprich('Ida kann nicht schlafen.', { beiWort: seite });
    gesprochen[0].onstart();
    gesprochen[0].onboundary({ name: 'word', charIndex: 4 });
    expect(seite).toHaveBeenLastCalledWith(1);

    vorleser.sprich('Ich bin Rabat!'); // Rabat unterbricht
    expect(seite).toHaveBeenLastCalledWith(-1);
    vi.unstubAllGlobals();
  });
});

describe('speicher', () => {
  it('liefert einen neuen Spielstand, wenn nichts gespeichert ist', () => {
    expect(laden(testAblage())).toEqual(neuerSpielstand());
  });

  it('speichert und laedt einen Spielstand', () => {
    const a = testAblage();
    const s = { ...neuerSpielstand(), seite: 's01', inventar: ['silberfeder'] };
    speichern(s, a);
    expect(laden(a)).toEqual(s);
  });

  it('ueberlebt kaputte Daten', () => {
    expect(laden(testAblage({ [SCHLUESSEL]: '{kaputt' }))).toEqual(neuerSpielstand());
  });

  it('ergaenzt fehlende Einstellungen aus aelteren Spielstaenden', () => {
    const alt = JSON.stringify({ seite: 's03', einstellungen: { tempo: 0.7 } });
    const s = laden(testAblage({ [SCHLUESSEL]: alt }));
    expect(s.seite).toBe('s03');
    expect(s.einstellungen.tempo).toBe(0.7);
    expect(s.einstellungen.autoVorlesen).toBe(true);
  });

  it('zuruecksetzen behaelt die Einstellungen', () => {
    const s = { ...neuerSpielstand(), seite: 's05', einstellungen: { ...neuerSpielstand().einstellungen, lesehilfe: true } };
    const z = zuruecksetzen(s);
    expect(hatFortschritt(z)).toBe(false);
    expect(z.einstellungen.lesehilfe).toBe(true);
  });
});
