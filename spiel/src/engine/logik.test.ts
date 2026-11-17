import { describe, it, expect } from 'vitest';
import { merker, erfuellt, ersteAktion, passenderTipp, wendeAn, loese, alleGeloest, zerlegeLuecken, silben, ohneTrennung, mischen, wortschlange, zerlegeFehlertext, verbinde, fuelleLuecke, silbenAuswahl, seiteZuruecksetzen, satzBausteine } from './logik';
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

describe('Wortschlange', () => {
  it('findet Buchstaben und Trennstellen', () => {
    const w = wortschlange('Oma wartet auf Silberwind');
    expect(w.buchstaben.join('')).toBe('OMAWARTETAUFSILBERWIND');
    // nach OMA (Index 2), nach WARTET (8), nach AUF (11)
    expect(w.stellen).toEqual([2, 8, 11]);
  });

  it('kommt mit Umlauten und doppelten Leerzeichen zurecht', () => {
    const w = wortschlange('  Käse  über  ');
    expect(w.buchstaben.join('')).toBe('KÄSEÜBER');
    expect(w.stellen).toEqual([3]);
  });
});

describe('Fehler antippen', () => {
  it('zerlegt den Text in Woerter, Fehler und Zwischenraeume', () => {
    const t = zerlegeFehlertext('{heute|Heute} kam {silberwind|Silberwind}. Er lacht!');
    const woerter = t.filter((x) => x.art === 'wort');
    expect(woerter.map((w) => w.text)).toEqual(['heute', 'kam', 'silberwind', 'Er', 'lacht']);
    expect(woerter.filter((w) => w.art === 'wort' && w.richtig).map((w) => (w as { richtig: string }).richtig)).toEqual(['Heute', 'Silberwind']);
    expect(t.map((x) => x.text).join('')).toBe('heute kam silberwind. Er lacht!');
  });
});

describe('Woerter bauen', () => {
  it('verbindet zwei Wortteile zu einem Namenwort', () => {
    expect(verbinde('Schaukel', 'Pferd')).toBe('Schaukelpferd');
    expect(verbinde('Tage', 'Buch')).toBe('Tagebuch');
  });
});

describe('Auswahl', () => {
  it('fuellt die Luecke und entfernt den Hinweis in Klammern', () => {
    expect(fuelleLuecke('_ein', 'St')).toBe('Stein');
    expect(fuelleLuecke('Die Schnecke _ (kriechen).', 'kriecht')).toBe('Die Schnecke kriecht.');
  });
});

describe('Silben zusammensetzen', () => {
  it('liefert die eigenen Silben und zwei fremde', () => {
    const w = ['Ne-bel-wald', 'Mond-see', 'Brü-cke'];
    expect(silbenAuswahl(w, 1)).toEqual(['Mond', 'see', 'Ne', 'bel']);
    expect(silbenAuswahl(w, 0, 3)).toEqual(['Ne', 'bel', 'wald', 'Mond', 'see', 'Brü']);
  });
});

describe('Seite neu starten', () => {
  it('nimmt nur die Fortschritte dieser Seite zurueck', () => {
    const seite = {
      id: 's13', objekte: [{ id: 'x', klick: [{ inventar: 'laterne' }] }],
      raetsel: [{ id: 'r', belohnung: { inventar: 'gluehwuermchen' } }],
    } as unknown as Seite;
    const s = {
      ...neuerSpielstand(), seite: 's13',
      geloest: { s11: ['a'], s13: ['r'] }, merker: { s11: ['m'], s13: ['eulen_da'] },
      buchstaben: ['s11', 's13'], inventar: ['faeustling', 'gluehwuermchen', 'laterne'],
    };
    const neu = seiteZuruecksetzen(s, seite);
    expect(neu.geloest).toEqual({ s11: ['a'] });
    expect(neu.merker).toEqual({ s11: ['m'] });
    expect(neu.buchstaben).toEqual(['s11']);
    expect(neu.inventar).toEqual(['faeustling']);
    expect(neu.seite).toBe('s13');
  });
});

describe('Satz bauen', () => {
  it('macht das erste Wort klein und den Punkt zu einem eigenen Kaertchen', () => {
    expect(satzBausteine('Gib Mehl in die Schüssel.')).toEqual({
      richtig: ['Gib', 'Mehl', 'in', 'die', 'Schüssel', '.'],
      karten: ['gib', 'Mehl', 'in', 'die', 'Schüssel', '.'],
    });
  });
});
