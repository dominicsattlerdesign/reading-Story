// Prueft die Seiten-Dateien auf Tippfehler, bevor ein Kind darueber stolpert.
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { seiten, inventar } from './index';
import { zerlegeLuecken, wortschlange, zerlegeFehlertext } from '../engine/logik';
import type { Aktion, Seite } from './typen';

const assets = join(process.cwd(), 'public', 'assets'); // Tests laufen im Ordner spiel/
const bildDa = (p: string) => existsSync(join(assets, `${p}.webp`));

function aktionen(seite: Seite): Aktion[] {
  return [...seite.objekte.flatMap((o) => o.klick ?? []), ...seite.raetsel.flatMap((r) => (r.belohnung ? [r.belohnung] : []))];
}

describe.each(seiten.map((s) => [s.id, s] as const))('Seite %s', (_, seite) => {
  it('hat eindeutige IDs', () => {
    const ids = seite.objekte.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
    const rids = seite.raetsel.map((r) => r.id);
    expect(new Set(rids).size).toBe(rids.length);
  });

  it('verweist nur auf vorhandene Raetsel, Objekte und Fundstuecke', () => {
    const rids = new Set(seite.raetsel.map((r) => r.id));
    const oids = new Set(seite.objekte.map((o) => o.id));
    const inv = new Set(inventar.map((i) => i.id));
    for (const a of aktionen(seite)) {
      if (a.raetsel) expect(rids, `Raetsel ${a.raetsel}`).toContain(a.raetsel);
      if (a.inventar) expect(inv, `Fundstueck ${a.inventar}`).toContain(a.inventar);
    }
    for (const t of seite.tipps) if (t.zeige) expect(oids, `Tipp zeigt auf ${t.zeige}`).toContain(t.zeige);
    // jedes Raetsel muss sich irgendwo oeffnen lassen
    const geoeffnet = new Set(aktionen(seite).map((a) => a.raetsel).filter(Boolean));
    for (const r of seite.raetsel) expect(geoeffnet, `Raetsel ${r.id} wird nie geoeffnet`).toContain(r.id);
  });

  it('nutzt nur vorhandene Bilder', () => {
    expect(bildDa(seite.hintergrund), seite.hintergrund).toBe(true);
    for (const o of seite.objekte) if (o.bild) expect(bildDa(o.bild), o.bild).toBe(true);
    for (const a of aktionen(seite)) if (a.bild) expect(bildDa(a.bild), a.bild).toBe(true);
    for (const r of seite.raetsel) if (r.typ === 'sortieren') for (const k of r.karten) if (k.bild) expect(bildDa(k.bild), k.bild).toBe(true);
  });

  it('hat loesbare Raetsel', () => {
    for (const r of seite.raetsel) {
      if (r.typ === 'luecken') {
        const woerter = zerlegeLuecken(r.text).filter((t) => t.art === 'luecke');
        expect(woerter.length).toBeGreaterThan(0);
        for (const f of r.falsche) expect(woerter.map((w) => (w as { wort: string }).wort)).not.toContain(f);
      }
      if (r.typ === 'sortieren') {
        const gruppen = new Set(r.gruppen.map((g) => g.id));
        for (const k of r.karten) expect(gruppen, `Karte ${k.id}`).toContain(k.gruppe);
      }
      if (r.typ === 'silben') expect(r.woerter.length).toBeGreaterThan(0);
      if (r.typ === 'reihenfolge') {
        expect(r.karten.length, r.id).toBeGreaterThan(1);
        expect(new Set(r.karten).size, `${r.id}: doppelte Karten`).toBe(r.karten.length);
      }
      if (r.typ === 'silbenbau') {
        expect(r.woerter.length, r.id).toBeGreaterThan(0);
        for (const w of r.woerter) expect(w, r.id).toContain('-');
      }
      if (r.typ === 'satzbau') {
        expect(r.saetze.length, r.id).toBeGreaterThan(0);
        for (const s of r.saetze) {
          const varianten = Array.isArray(s) ? s : [s];
          for (const v of varianten) expect(v, r.id).toMatch(/^[A-ZÄÖÜ].*[.!?]$/);
          // jede Satzstellung besteht aus denselben Woertern
          const woerter = (v: string) => v.toLowerCase().replace(/[.!?]$/, '').split(/\s+/).sort().join(' ');
          for (const v of varianten) expect(woerter(v), r.id + ': ' + v).toBe(woerter(varianten[0]));
        }
      }
      if (r.typ === 'auswahl') {
        expect(r.fragen.length, r.id).toBeGreaterThan(0);
        for (const f of r.fragen) for (const ri of [f.richtig].flat()) expect(f.antworten, `${r.id}: ${f.frage}`).toContain(ri);
      }
      if (r.typ === 'fehler') {
        const teile = zerlegeFehlertext(r.text);
        expect(teile.some((t) => t.art === 'wort' && t.richtig), r.id + ': kein Fehler im Text').toBe(true);
      }
      if (r.typ === 'paare' || r.typ === 'woerter') {
        expect(r.paare.length, r.id).toBeGreaterThan(1);
        const zweite = r.paare.map((x) => x[1]);
        expect(new Set(zweite).size, `${r.id}: doppelte Woerter`).toBe(zweite.length);
      }
      if (r.typ === 'zauberwort') {
        // das Zauberwort besteht genau aus den versteckten Buchstaben aller Seiten
        const gesammelt = seiten.map((s) => s.buchstabe).filter(Boolean).sort().join('');
        expect([...r.woerter.join('')].sort().join(''), r.id).toBe(gesammelt);
      }
      if (r.typ === 'wortschlange') {
        expect(wortschlange(r.satz).stellen.length, r.id).toBeGreaterThan(0);
        expect(r.satz, r.id).toMatch(/^[A-Za-zÄÖÜäöüß ]+$/);
      }
    }
  });

  it('hat hoechstens einen versteckten Buchstaben, und den kann man finden', () => {
    if (!seite.buchstabe) {
      expect(aktionen(seite).some((a) => a.buchstabe)).toBe(false);
      return;
    }
    expect(seite.buchstabe).toMatch(/^[A-ZÄÖÜ]$/);
    expect(aktionen(seite).some((a) => a.buchstabe)).toBe(true);
  });
});

describe('Versteckte Buchstaben', () => {
  it('stammen alle aus MUTIGES HERZ und kommen nicht oefter vor als dort', () => {
    const vorrat = [...'MUTIGESHERZ'];
    for (const s of seiten) {
      if (!s.buchstabe) continue;
      const i = vorrat.indexOf(s.buchstabe);
      expect(i, `Seite ${s.id}: ${s.buchstabe} kommt zu oft vor`).toBeGreaterThanOrEqual(0);
      vorrat.splice(i, 1);
    }
  });
});
