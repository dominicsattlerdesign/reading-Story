// Prueft die Seiten-Dateien auf Tippfehler, bevor ein Kind darueber stolpert.
import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { seiten, inventar } from './index';
import { zerlegeLuecken } from '../engine/logik';
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
    }
  });

  it('hat einen versteckten Buchstaben, den man finden kann', () => {
    expect(seite.buchstabe).toMatch(/^[A-ZÄÖÜ]$/);
    expect(aktionen(seite).some((a) => a.buchstabe)).toBe(true);
  });
});
