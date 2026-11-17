import { Fragment } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import type { WortschlangeRaetsel } from '../../inhalt/typen';
import { wortschlange } from '../../engine/logik';
import { RaetselRahmen, useFehler, useWackeln, type RaetselHelfer } from './gemeinsam';

/**
 * Wortschlange: Ein Satz ohne Luecken. Das Kind tippt zwischen die Buchstaben,
 * wo ein Wort aufhoert. Richtige Stellen bekommen einen Trennstrich, falsche wackeln nur.
 */
export function Wortschlange({ raetsel, helfer }: { raetsel: WortschlangeRaetsel; helfer: RaetselHelfer }) {
  const { buchstaben, stellen } = useMemo(() => wortschlange(raetsel.satz), [raetsel.satz]);
  const [gesetzt, setGesetzt] = useState<number[]>([]);
  const [hilfe, setHilfe] = useState(false); // ab dem 3. Fehler leuchtet die naechste richtige Stelle
  const [wackelt, wackeln] = useWackeln();
  const fb = useFehler(helfer, raetsel.tipps[0]);

  // Lange Saetze laufen in zwei Zeilen, damit die Luecken breit genug zum Antippen bleiben.
  // Der Umbruch liegt an der Wortgrenze, die der Mitte am naechsten ist, damit kein Wort zerrissen wird.
  const umbruch = useMemo(() => {
    if (buchstaben.length <= 24) return -1; // kurze Saetze passen in eine Zeile
    const mitte = (buchstaben.length - 1) / 2;
    return stellen.reduce((a, b) => (Math.abs(b - mitte) < Math.abs(a - mitte) ? b : a), stellen[0]);
  }, [buchstaben, stellen]);

  const geloest = stellen.every((s) => gesetzt.includes(s));
  const naechste = stellen.find((s) => !gesetzt.includes(s));

  const tippen = (stelle: number) => {
    if (geloest || gesetzt.includes(stelle)) return;
    if (stellen.includes(stelle)) {
      const neu = [...gesetzt, stelle];
      setGesetzt(neu);
      setHilfe(false);
      if (!stellen.every((s) => neu.includes(s))) fb.richtig();
    } else {
      wackeln(`s${stelle}`);
      if (fb.fehler('schlange') >= 3) setHilfe(true);
    }
  };

  return (
    <RaetselRahmen titel={raetsel.titel} aufgabe={raetsel.aufgabe} geloest={geloest} helfer={helfer} erfolgText={raetsel.erfolg}>
      <div class="schlange" aria-label="Wortschlange">
        {buchstaben.map((b, i) => (
          <Fragment key={i}>
            <span class={`schlange-buchstabe ${wackelt === `s${i}` || wackelt === `s${i - 1}` ? 'wackeln' : ''}`}>{b}</span>
            {i < buchstaben.length - 1 && (
              <button
                class={`schlange-luecke ${gesetzt.includes(i) ? 'gesetzt' : ''} ${hilfe && naechste === i ? 'leuchten' : ''}`}
                aria-label={gesetzt.includes(i) ? 'Trennstrich' : `Zwischen ${b} und ${buchstaben[i + 1]}`}
                onClick={() => tippen(i)}
              >
                <span class="schlange-strich" aria-hidden="true" />
              </button>
            )}
            {i === umbruch && <span class="schlange-umbruch" aria-hidden="true" />}
          </Fragment>
        ))}
      </div>
      {geloest && <p class="schlange-loesung">{raetsel.satz}</p>}
    </RaetselRahmen>
  );
}
