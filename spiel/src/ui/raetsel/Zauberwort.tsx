import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ZauberwortRaetsel } from '../../inhalt/typen';
import { mischen } from '../../engine/logik';
import { RaetselRahmen, useFehler, type RaetselHelfer } from './gemeinsam';

/**
 * Zauberwort: Die goldenen Buchstaben liegen durcheinander. Das Kind tippt sie der Reihe nach an,
 * sie rasten in die Felder der Woerter ein. Gleiche Buchstaben (zweimal E) sind austauschbar.
 */
export function Zauberwort({ raetsel, helfer }: { raetsel: ZauberwortRaetsel; helfer: RaetselHelfer }) {
  const folge = useMemo(() => raetsel.woerter.join('').split(''), []);
  const gemischt = useMemo(() => {
    const liste = folge.map((b, i) => ({ i, b }));
    let m = mischen(liste);
    for (let n = 0; n < 5 && m.every((k, j) => k.i === j); n++) m = mischen(liste);
    return m;
  }, []);
  const [gelegt, setGelegt] = useState(0);
  const [benutzt, setBenutzt] = useState<Set<number>>(() => new Set());
  const [wackelt, setWackelt] = useState<number | null>(null);
  const [hilfe, setHilfe] = useState(false);
  const fb = useFehler(helfer, raetsel.tipps[0]);
  const fertig = gelegt === folge.length;
  const uhr = useRef<number | null>(null);
  useEffect(() => () => { if (uhr.current) window.clearTimeout(uhr.current); }, []);

  // Wortgrenzen: nach dem ersten Wort ein kurzes Lob
  const enden = raetsel.woerter.reduce<number[]>((a, w) => [...a, (a[a.length - 1] ?? 0) + w.length], []);

  const tippen = (k: { i: number; b: string }) => {
    if (fertig || benutzt.has(k.i)) return;
    if (k.b === folge[gelegt]) {
      const neu = gelegt + 1;
      setBenutzt(new Set(benutzt).add(k.i));
      setGelegt(neu);
      setHilfe(false);
      if (enden.includes(neu) && neu < folge.length) fb.richtig();
    } else {
      setWackelt(k.i);
      uhr.current = window.setTimeout(() => setWackelt(null), 600);
      if (fb.fehler(`b${gelegt}`) >= 3) setHilfe(true);
    }
  };

  const naechste = gemischt.find((k) => !benutzt.has(k.i) && k.b === folge[gelegt])?.i;

  let start = 0;
  return (
    <RaetselRahmen titel={raetsel.titel} aufgabe={raetsel.aufgabe} geloest={fertig} helfer={helfer} erfolgText={raetsel.erfolg}>
      <div class="zauberwort">
        <div class={`zauber-woerter ${fertig ? 'fertig' : ''}`} aria-live="polite">
          {raetsel.woerter.map((w, wi) => {
            const von = start;
            start += w.length;
            return (
              <span key={wi} class="zauber-wort">
                {[...w].map((b, j) => (
                  <span key={j} class={`zauber-feld ${von + j < gelegt ? 'voll' : ''}`}>{von + j < gelegt ? b : ''}</span>
                ))}
              </span>
            );
          })}
        </div>
        <div class="zauber-buchstaben">
          {gemischt.map((k) =>
            benutzt.has(k.i) ? (
              <span key={k.i} class="zauber-buchstabe platzhalter" aria-hidden="true">{k.b}</span>
            ) : (
              <button
                key={k.i}
                class={`zauber-buchstabe ${wackelt === k.i ? 'wackeln' : ''} ${hilfe && k.i === naechste ? 'leuchten' : ''}`}
                onClick={() => tippen(k)}
              >
                {k.b}
              </button>
            ),
          )}
        </div>
      </div>
    </RaetselRahmen>
  );
}
