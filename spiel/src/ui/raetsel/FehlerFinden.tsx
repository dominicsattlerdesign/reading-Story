import { useMemo, useState } from 'preact/hooks';
import type { FehlerRaetsel } from '../../inhalt/typen';
import { zerlegeFehlertext } from '../../engine/logik';
import { RaetselRahmen, useFehler, useWackeln, type RaetselHelfer } from './gemeinsam';

/**
 * Fehler antippen: Ein Text (z. B. Omas Tagebuch) mit falsch geschriebenen Woertern.
 * Ein Tipp auf ein falsches Wort schreibt es richtig. Ein Tipp auf ein richtiges Wort wackelt nur.
 */
export function FehlerFinden({ raetsel, helfer }: { raetsel: FehlerRaetsel; helfer: RaetselHelfer }) {
  const teile = useMemo(() => zerlegeFehlertext(raetsel.text), [raetsel.text]);
  const fehlerNr = teile.flatMap((t) => (t.art === 'wort' && t.richtig ? [t.nr] : []));
  const [verbessert, setVerbessert] = useState<number[]>([]);
  const [hilfe, setHilfe] = useState(false);
  const [wackelt, wackeln] = useWackeln();
  const fb = useFehler(helfer, raetsel.tipps[0]);

  const geloest = fehlerNr.every((n) => verbessert.includes(n));
  const naechster = fehlerNr.find((n) => !verbessert.includes(n));

  const tippen = (nr: number, istFehler: boolean) => {
    if (geloest || verbessert.includes(nr)) return;
    if (istFehler) {
      const neu = [...verbessert, nr];
      setVerbessert(neu);
      setHilfe(false);
      if (!fehlerNr.every((n) => neu.includes(n))) fb.richtig();
    } else {
      wackeln(`w${nr}`);
      if (fb.fehler('text') >= 3) setHilfe(true);
    }
  };

  return (
    <RaetselRahmen titel={raetsel.titel} aufgabe={raetsel.aufgabe} geloest={geloest} helfer={helfer} erfolgText={raetsel.erfolg}>
      <div class="tagebuch">
        {teile.map((t, i) =>
          t.art === 'text' ? (
            <span key={i}>{t.text}</span>
          ) : (
            <button
              key={i}
              class={`tagebuch-wort ${verbessert.includes(t.nr) ? 'verbessert' : ''} ${wackelt === `w${t.nr}` ? 'wackeln' : ''} ${hilfe && naechster === t.nr ? 'leuchten' : ''}`}
              onClick={() => tippen(t.nr, !!t.richtig)}
            >
              {verbessert.includes(t.nr) ? t.richtig : t.text}
            </button>
          ),
        )}
      </div>
      <p class="tagebuch-zaehler">
        Gefunden: {verbessert.length} von {fehlerNr.length}
      </p>
    </RaetselRahmen>
  );
}
