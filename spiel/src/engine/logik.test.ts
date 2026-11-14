import { describe, it, expect } from 'vitest';
import { merker, erfuellt, ersteAktion, passenderTipp, wendeAn, loese, alleGeloest, zerlegeLuecken, silben, ohneTrennung, mischen } from './logik';
import { neuerSpielstand } from './speicher';
import type { Seite } from '../inhalt/typen';

describe('Bedingungen', () => {
  const m = new Set(['fenster_offen', 'raetsel:brief']);
  it('prueft gesetzte und nicht gesetzte Merker', () => {
    expect(erfuellt(undefined, m)).toBe(true);
    expect(erfuellt(['fenster_offen'], m)).toBe(true);
    expect(erfuellt(['fenster_offen', '!rabat_wach'], m)).toBe(true);
    expect(erfuellt(['!fenster_offen'], m)).toBe(false);
    expect(erfuellt(['fenster_offen', 'rabat_wach'], m)).toBe(false);
  });

  it('waehlt die erste passende Aktion und den ersten passenden Tipp', () => {
    const aktionen = [{ wenn: ['!fenster_offen'], blase: 'zu' }, { blase: 'offen' }];
    expect(ersteAktion(aktionen, m)?.blase).toBe('offen');
    expect(ersteAktion(aktionen, new Set())?.blase).toBe('zu');
    expect(passenderTipp([{ wenn: ['!raetsel:brief'], text: 'a' }, { text: 'b' }], m)?.text).toBe('b');
  });
});

describe('Spielstand-Aenderungen', () => {
  it('setzt Merker, Inventar und Buchstaben nur einmal', () => {
    let s = neuerSpielstand();
    const a = { setze: ['fenster_offen'], inventar: 'silberfeder', buchstabe: true };
    s = wendeAn(wendeAn(s, 's01', a), 's01', a);
    expect(s.merker.s01).toEqual(['fenster_offen']);
    expect(s.inventar).toEqual(['silberfeder']);
    expect(s.buchstaben).toEqual(['s01']);
    const m = merker(s, 's01');
    expect([...m].sort()).toEqual(['buchstabe', 'fenster_offen', 'inventar:silberfeder']);
  });

  it('merkt geloeste Raetsel und erkennt, wann alle geloest sind', () => {
    const seite = { id: 's01', raetsel: [{ id: 'a' }, { id: 'b' }] } as unknown as Seite;
    let s = loese(neuerSpielstand(), 's01', 'a');
    expect(alleGeloest(s, seite)).toBe(false);
    s = loese(loese(s, 's01', 'b'), 's01', 'b');
    expect(s.geloest.s01).toEqual(['a', 'b']);
    expect(alleGeloest(s, seite)).toBe(true);
    expect(merker(s, 's01').has('raetsel:a')).toBe(true);
  });
});

describe('Lueckentext', () => {
  it('zerlegt Text mit Luecken', () => {
    expect(zerlegeLuecken('Liebe {Lene}, ich habe mich {verirrt}.')).toEqual([
      { art: 'text', text: 'Liebe ' },
      { art: 'luecke', nr: 0, wort: 'Lene' },
      { art: 'text', text: ', ich habe mich ' },
      { art: 'luecke', nr: 1, wort: 'verirrt' },
      { art: 'text', text: '.' },
    ]);
  });
});

describe('Silben und Mischen', () => {
  it('trennt Silben', () => {
    expect(silben('La-ter-ne')).toEqual(['La', 'ter', 'ne']);
    expect(silben('Fuchs')).toEqual(['Fuchs']);
    expect(ohneTrennung('Pe-ga-sus')).toBe('Pegasus');
  });

  it('mischt nie in die Ausgangsreihenfolge', () => {
    const liste = [1, 2, 3];
    for (let i = 0; i < 50; i++) expect(mischen(liste)).not.toEqual(liste);
    expect(mischen(liste, () => 0.999)).not.toEqual(liste); // "Zufall", der nichts aendert
    expect(mischen([1])).toEqual([1]);
  });
});
