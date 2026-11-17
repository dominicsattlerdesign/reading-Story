import { useMemo, useState } from 'preact/hooks';
import type { ReihenfolgeRaetsel } from '../../inhalt/typen';
import { mischen } from '../../engine/logik';
import { asset } from '../../inhalt';
import { RaetselRahmen, useFehler, useWackeln, type RaetselHelfer } from './gemeinsam';

/** Gemalter Trittstein als Hintergrund (vier Varianten im Wechsel). Der Stein wird so breit wie sein Wort, damit es ganz draufpasst. */
const stein = (nr: number, text: string, extra = 0, klein = false) => ({
  backgroundImage: `url(${asset(`gegenstaende/inventar/trittstein_${(nr % 4) + 1}`)})`,
  // bei vielen Steinen (z. B. neun Orte) etwas kleiner, damit alles ins Fenster passt
  width: `${klein ? 60 + text.length * 22 + extra * 0.6 : 90 + text.length * 28 + extra}px`,
});

/**
 * Reihenfolge: Das Kind tippt die Karte an, die als Naechstes kommt.
 * Richtige Karten wandern nach oben in die geordnete Geschichte, falsche wackeln nur.
 */
export function Reihenfolge({ raetsel, helfer }: { raetsel: ReihenfolgeRaetsel; helfer: RaetselHelfer }) {
  const gemischt = useMemo(() => mischen(raetsel.karten.map((text, nr) => ({ nr, text }))), [raetsel.id]);
  const [gelegt, setGelegt] = useState(0); // so viele Karten liegen schon richtig
  const [leuchtet, setLeuchtet] = useState(false); // ab dem 3. Fehler leuchtet die richtige Karte
  const [wackelt, wackeln] = useWackeln();
  const fb = useFehler(helfer, raetsel.tipps[0]);

  const geloest = gelegt === raetsel.karten.length;
  const steine = raetsel.stil === 'steine';
  const viele = raetsel.karten.length > 6;

  const antippen = (nr: number) => {
    if (geloest) return;
    if (nr === gelegt) {
      setGelegt(gelegt + 1);
      setLeuchtet(false);
      if (gelegt + 1 < raetsel.karten.length) fb.richtig();
    } else {
      wackeln(`k${nr}`);
      if (fb.fehler(`platz${gelegt}`) >= 3) setLeuchtet(true);
    }
  };

  return (
    <RaetselRahmen titel={raetsel.titel} aufgabe={raetsel.aufgabe} geloest={geloest} helfer={helfer} erfolgText={raetsel.erfolg}>
      <div class={steine ? `reihe reihe-steine ${viele ? 'viele' : ''}` : 'reihe'}>
      <ol class="reihe-geordnet" aria-label="Die Geschichte in der richtigen Reihenfolge">
        {raetsel.karten.map((text, nr) =>
          nr < gelegt ? (
            <li key={nr} class="reihe-zeile fertig" style={steine ? stein(nr, text, -30, viele) : undefined}>
              <span class="reihe-nummer">{nr + 1}</span>
              <span>{text}</span>
            </li>
          ) : (
            <li key={nr} class={`reihe-zeile leer ${nr === gelegt ? 'als-naechstes' : ''}`} style={steine ? stein(nr, text, -30, viele) : undefined}>
              <span class="reihe-nummer">{nr + 1}</span>
              <span class="reihe-frage">{nr === gelegt ? 'Was kommt jetzt?' : ''}</span>
            </li>
          ),
        )}
      </ol>
      <div class="reihe-karten">
        {gemischt
          .filter((k) => k.nr >= gelegt)
          .map((k) => (
            <button
              key={k.nr}
              class={`reihe-karte ${wackelt === `k${k.nr}` ? 'wackeln' : ''} ${leuchtet && k.nr === gelegt ? 'leuchten' : ''}`}
              onClick={() => antippen(k.nr)}
              style={steine ? stein(k.nr + 1, k.text, 20, viele) : undefined}
            >
              {k.text}
            </button>
          ))}
      </div>
      </div>
    </RaetselRahmen>
  );
}
