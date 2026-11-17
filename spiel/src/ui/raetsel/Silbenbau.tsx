import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { SilbenbauRaetsel } from '../../inhalt/typen';
import { mischen, ohneTrennung, silben, silbenAuswahl } from '../../engine/logik';
import { RaetselRahmen, useFehler, type RaetselHelfer } from './gemeinsam';

/**
 * Silben zusammensetzen: Ein Wort nach dem anderen wird auf ein Schild gebaut.
 * Das Kind tippt die Silben in der richtigen Reihenfolge an; ein paar fremde Silben lenken ab.
 */
export function Silbenbau({ raetsel, helfer }: { raetsel: SilbenbauRaetsel; helfer: RaetselHelfer }) {
  const [nr, setNr] = useState(0);
  const [gelegt, setGelegt] = useState(0);
  const [wackelt, setWackelt] = useState<number | null>(null);
  const [hilfe, setHilfe] = useState(false);
  const uhr = useRef<number | null>(null);
  const fb = useFehler(helfer, raetsel.tipps[0]);
  useEffect(() => () => { if (uhr.current) window.clearTimeout(uhr.current); }, []);

  const fertig = nr >= raetsel.woerter.length;
  const wort = raetsel.woerter[Math.min(nr, raetsel.woerter.length - 1)];
  const teile = silben(wort);
  const karten = useMemo(() => mischen(silbenAuswahl(raetsel.woerter, Math.min(nr, raetsel.woerter.length - 1)).map((s, i) => ({ i, s }))), [nr]);
  const komplett = gelegt === teile.length;

  const tippen = (k: { i: number; s: string }) => {
    if (komplett || fertig) return;
    if (k.s === teile[gelegt] && k.i === gelegt) {
      const neu = gelegt + 1;
      setGelegt(neu);
      setHilfe(false);
      if (neu === teile.length) {
        if (nr < raetsel.woerter.length - 1) fb.richtig();
        uhr.current = window.setTimeout(() => {
          setNr((n) => n + 1);
          setGelegt(0);
        }, 1500);
      }
    } else {
      setWackelt(k.i);
      window.setTimeout(() => setWackelt(null), 600);
      if (fb.fehler(`w${nr}s${gelegt}`) >= 3) setHilfe(true);
    }
  };

  return (
    <RaetselRahmen titel={raetsel.titel} aufgabe={raetsel.aufgabe} geloest={fertig} helfer={helfer} erfolgText={raetsel.erfolg}>
      <div class="silbenbau">
        <div class="silben-fortschritt" aria-label={`Schild ${Math.min(nr + 1, raetsel.woerter.length)} von ${raetsel.woerter.length}`}>
          {raetsel.woerter.map((_, i) => (
            <span key={i} class={i < nr || (i === nr && komplett) ? 'punkt an' : 'punkt'} />
          ))}
        </div>
        <div class={`schild ${komplett ? 'fertig' : ''}`}>
          {komplett ? (
            <span class="schild-wort">{ohneTrennung(wort)}</span>
          ) : (
            teile.map((t, i) => (
              <span key={i} class={`schild-silbe ${i < gelegt ? 'voll' : ''}`}>{i < gelegt ? t : ''}</span>
            ))
          )}
        </div>
        <div class="silben-karten">
          {karten.map((k) =>
            k.i < gelegt ? (
              <span key={k.i} class="silben-karte platzhalter" aria-hidden="true">{k.s}</span>
            ) : (
              <button
                key={k.i}
                class={`silben-karte ${wackelt === k.i ? 'wackeln' : ''} ${hilfe && k.i === gelegt ? 'leuchten' : ''}`}
                disabled={komplett}
                onClick={() => tippen(k)}
              >
                {k.s}
              </button>
            ),
          )}
        </div>
      </div>
    </RaetselRahmen>
  );
}
