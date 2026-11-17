import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { AuswahlRaetsel } from '../../inhalt/typen';
import { fuelleLuecke, mischen } from '../../engine/logik';
import { RaetselRahmen, useFehler, type RaetselHelfer } from './gemeinsam';

/**
 * Auswahl: Eine Frage nach der anderen, darunter 2–3 grosse Antwort-Knoepfe.
 * Die richtige Antwort fuellt die Luecke, dann kommt die naechste Frage.
 */
export function Auswahl({ raetsel, helfer }: { raetsel: AuswahlRaetsel; helfer: RaetselHelfer }) {
  const [nr, setNr] = useState(0);
  const [richtig, setRichtig] = useState(false);
  const [wackelt, setWackelt] = useState<string | null>(null);
  const [hilfe, setHilfe] = useState(false);
  const uhr = useRef<number | null>(null);
  const fb = useFehler(helfer, raetsel.tipps[0]);
  useEffect(() => () => { if (uhr.current) window.clearTimeout(uhr.current); }, []);

  const fertig = nr >= raetsel.fragen.length;
  const f = raetsel.fragen[Math.min(nr, raetsel.fragen.length - 1)];
  const antworten = useMemo(() => mischen(f.antworten), [nr]);
  const [vor, nach] = f.frage.split('_');

  const waehlen = (a: string) => {
    if (richtig || fertig) return;
    if (a === f.richtig) {
      setRichtig(true);
      setHilfe(false);
      if (nr < raetsel.fragen.length - 1) fb.richtig();
      uhr.current = window.setTimeout(() => {
        setRichtig(false);
        setNr((n) => n + 1);
      }, 1400);
    } else {
      setWackelt(a);
      window.setTimeout(() => setWackelt(null), 600);
      if (fb.fehler(`f${nr}`) >= 3) setHilfe(true);
    }
  };

  return (
    <RaetselRahmen titel={raetsel.titel} aufgabe={raetsel.aufgabe} geloest={fertig} helfer={helfer} erfolgText={raetsel.erfolg}>
      <div class="auswahl">
        {raetsel.text && <p class="auswahl-text">{raetsel.text}</p>}
        <div class="silben-fortschritt" aria-label={`Frage ${Math.min(nr + 1, raetsel.fragen.length)} von ${raetsel.fragen.length}`}>
          {raetsel.fragen.map((_, i) => (
            <span key={i} class={i < nr || (i === nr && richtig) ? 'punkt an' : 'punkt'} />
          ))}
        </div>
        <p class={`auswahl-frage ${richtig ? 'richtig' : ''}`}>
          {richtig ? (
            nach === undefined ? `${f.frage} – ${f.richtig}!` : fuelleLuecke(f.frage, f.richtig)
          ) : nach === undefined ? (
            f.frage
          ) : (
            <>
              {vor}
              <span class="auswahl-luecke" aria-label="Lücke">{' '}</span>
              {nach}
            </>
          )}
        </p>
        <div class="auswahl-antworten">
          {antworten.map((a) => (
            <button
              key={a}
              class={`auswahl-knopf ${/^[.?!,]$/.test(a) ? 'zeichen' : ''} ${wackelt === a ? 'wackeln' : ''} ${hilfe && a === f.richtig ? 'leuchten' : ''}`}
              disabled={richtig}
              onClick={() => waehlen(a)}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </RaetselRahmen>
  );
}
