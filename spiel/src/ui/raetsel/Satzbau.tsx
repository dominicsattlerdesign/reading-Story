import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { SatzbauRaetsel } from '../../inhalt/typen';
import { mischen, satzBausteine } from '../../engine/logik';
import { RaetselRahmen, useFehler, type RaetselHelfer } from './gemeinsam';

/**
 * Saetze bauen: Die Woerter eines Satzes liegen gemischt da, das erste Wort klein.
 * Das Kind tippt sie der Reihe nach an. Das erste Wort wird beim Einrasten gross,
 * zum Schluss kommt der Punkt. Ein Satz nach dem anderen.
 */
export function Satzbau({ raetsel, helfer }: { raetsel: SatzbauRaetsel; helfer: RaetselHelfer }) {
  const [nr, setNr] = useState(0);
  const [gelegt, setGelegt] = useState(0);
  const [wackelt, setWackelt] = useState<number | null>(null);
  const [hilfe, setHilfe] = useState(false);
  const uhr = useRef<number | null>(null);
  const fb = useFehler(helfer, raetsel.tipps[0]);
  useEffect(() => () => { if (uhr.current) window.clearTimeout(uhr.current); }, []);

  const fertig = nr >= raetsel.saetze.length;
  const aktuell = Math.min(nr, raetsel.saetze.length - 1);
  const { richtig, karten } = useMemo(() => satzBausteine(raetsel.saetze[aktuell]), [aktuell]);
  const gemischt = useMemo(() => {
    const liste = karten.map((text, i) => ({ i, text }));
    // nie schon in der richtigen Reihenfolge anbieten
    let m = mischen(liste);
    for (let n = 0; n < 5 && m.every((k, j) => k.i === j); n++) m = mischen(liste);
    return m;
  }, [aktuell]);
  const komplett = gelegt === richtig.length;
  // gleiche Woerter (z. B. zweimal "die") sind austauschbar: es zaehlt der Text
  const benutzt = useRef(new Set<number>());

  const tippen = (k: { i: number; text: string }) => {
    if (komplett || fertig || benutzt.current.has(k.i)) return;
    if (k.text === karten[gelegt]) {
      benutzt.current.add(k.i);
      const neu = gelegt + 1;
      setGelegt(neu);
      setHilfe(false);
      if (gelegt === 0) helfer.rabat('Am Satzanfang schreibt man groß!');
      if (neu === richtig.length) {
        if (nr < raetsel.saetze.length - 1) fb.richtig();
        uhr.current = window.setTimeout(() => {
          benutzt.current = new Set();
          setNr((n) => n + 1);
          setGelegt(0);
        }, 1600);
      }
    } else {
      setWackelt(k.i);
      window.setTimeout(() => setWackelt(null), 600);
      if (fb.fehler(`s${nr}w${gelegt}`) >= 3) setHilfe(true);
    }
  };

  // die Karte, die als naechstes passt (fuer das Leuchten nach drei Fehlern)
  const naechste = gemischt.find((k) => !benutzt.current.has(k.i) && k.text === karten[gelegt])?.i;

  return (
    <RaetselRahmen titel={raetsel.titel} aufgabe={raetsel.aufgabe} geloest={fertig} helfer={helfer} erfolgText={raetsel.erfolg}>
      <div class="satzbau">
        <div class="silben-fortschritt" aria-label={`Satz ${aktuell + 1} von ${raetsel.saetze.length}`}>
          {raetsel.saetze.map((_, i) => (
            <span key={i} class={i < nr || (i === nr && komplett) ? 'punkt an' : 'punkt'} />
          ))}
        </div>
        <p class={`satzbau-zeile ${komplett ? 'fertig' : ''}`} aria-live="polite">
          {richtig.map((w, i) => (
            <span key={`${aktuell}-${i}`} class={`satz-platz ${w === '.' ? 'punkt-platz' : ''} ${i < gelegt ? 'voll' : ''} ${i === 0 && i < gelegt ? 'gross' : ''}`}>
              {i < gelegt ? w : ''}
            </span>
          ))}
        </p>
        <div class="silben-karten">
          {gemischt.map((k) =>
            benutzt.current.has(k.i) ? (
              <span key={`${aktuell}-${k.i}`} class="silben-karte platzhalter" aria-hidden="true">{k.text}</span>
            ) : (
              <button
                key={`${aktuell}-${k.i}`}
                class={`silben-karte ${k.text === '.' ? 'punkt-karte' : ''} ${wackelt === k.i ? 'wackeln' : ''} ${hilfe && k.i === naechste ? 'leuchten' : ''}`}
                disabled={komplett}
                onClick={() => tippen(k)}
              >
                {k.text}
              </button>
            ),
          )}
        </div>
      </div>
    </RaetselRahmen>
  );
}
