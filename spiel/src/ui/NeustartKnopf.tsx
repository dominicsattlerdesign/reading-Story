import { useEffect, useRef, useState } from 'preact/hooks';
import { asset } from '../inhalt';

const HALTEN_MS = 3000;
const NACHFRAGE_MS = 5000;

/**
 * Gemalter Spiralpfeil oben links.
 * Einmal tippen: Nachfrage "Seite neu starten?". Noch einmal tippen: die Seite beginnt von vorne.
 * 3 Sekunden gedrueckt halten: eine Seite zurueckblaettern.
 */
export function NeustartKnopf(props: { neuStarten: () => void; zurueck?: () => void }) {
  const [fragt, setFragt] = useState(false);
  const [haelt, setHaelt] = useState(false);
  const [hinweis, setHinweis] = useState<string | null>(null);
  const halteUhr = useRef<number | null>(null);
  const frageUhr = useRef<number | null>(null);
  const hinweisUhr = useRef<number | null>(null);
  const zurueckGeblaettert = useRef(false);

  const stoppe = (u: { current: number | null }) => {
    if (u.current) window.clearTimeout(u.current);
    u.current = null;
  };
  useEffect(() => () => [halteUhr, frageUhr, hinweisUhr].forEach(stoppe), []);

  const zeigeHinweis = (text: string) => {
    setHinweis(text);
    stoppe(hinweisUhr);
    hinweisUhr.current = window.setTimeout(() => setHinweis(null), 3000);
  };

  const runter = (e: PointerEvent) => {
    e.preventDefault();
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* egal */ }
    zurueckGeblaettert.current = false;
    setHaelt(true);
    halteUhr.current = window.setTimeout(() => {
      zurueckGeblaettert.current = true;
      setHaelt(false);
      setFragt(false);
      stoppe(frageUhr);
      if (props.zurueck) props.zurueck();
      else zeigeHinweis('Das ist schon die erste Seite.');
    }, HALTEN_MS);
  };

  const hoch = () => {
    stoppe(halteUhr);
    if (!haelt || zurueckGeblaettert.current) return;
    setHaelt(false);
    if (fragt) {
      // zweites Tippen: bestaetigt
      setFragt(false);
      stoppe(frageUhr);
      props.neuStarten();
      return;
    }
    setFragt(true);
    setHinweis(null);
    stoppe(frageUhr);
    frageUhr.current = window.setTimeout(() => setFragt(false), NACHFRAGE_MS);
  };

  const abbrechen = () => {
    stoppe(halteUhr);
    setHaelt(false);
  };

  return (
    <>
      <button
        class={`rund-knopf bild-knopf neustart-knopf ${haelt ? 'haelt' : ''} ${fragt ? 'fragt' : ''}`}
        style={{ '--dauer': `${HALTEN_MS}ms` }}
        aria-label={fragt ? 'Ja, Seite neu starten' : 'Seite neu starten'}
        title="Seite neu starten (3 Sekunden halten: eine Seite zurück)"
        onPointerDown={runter}
        onPointerUp={hoch}
        onPointerCancel={abbrechen}
        onContextMenu={(e) => e.preventDefault()}
      >
        <img src={asset('gegenstaende/oberflaeche/seite_neu')} alt="" draggable={false} />
        <span class="halte-ring" aria-hidden="true" />
      </button>
      {fragt && (
        <div class="neustart-frage" role="alert">
          <strong>Seite neu starten?</strong>
          <span>Tipp noch einmal auf den Pfeil.</span>
        </div>
      )}
      {hinweis && <div class="neustart-frage">{hinweis}</div>}
    </>
  );
}
