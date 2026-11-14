import { useEffect, useRef, useState } from 'preact/hooks';
import type { SilbenRaetsel } from '../../inhalt/typen';
import { ohneTrennung, silben } from '../../engine/logik';
import { asset } from '../../inhalt';

const klatschBild = asset('gegenstaende/oberflaeche/klatschen');
import { RaetselRahmen, useFehler, type RaetselHelfer } from './gemeinsam';

/** Silben klatschen: Fuer jede Silbe einmal auf den Klatsch-Knopf, dann auf "Fertig". */
export function Silben({ raetsel, helfer }: { raetsel: SilbenRaetsel; helfer: RaetselHelfer }) {
  const [nr, setNr] = useState(0);
  const [klatscher, setKlatscher] = useState(0);
  const [stufe, setStufe] = useState(0); // Hilfe-Stufe beim aktuellen Wort
  const [richtig, setRichtig] = useState(false);
  const [wackelt, setWackelt] = useState(false);
  const uhr = useRef<number | null>(null);
  const fb = useFehler(helfer, raetsel.tipps[0]);

  useEffect(() => () => { if (uhr.current) window.clearTimeout(uhr.current); }, []);

  const fertigAlle = nr >= raetsel.woerter.length;
  const wort = raetsel.woerter[Math.min(nr, raetsel.woerter.length - 1)];
  const teile = silben(wort);

  const pruefen = () => {
    if (richtig || klatscher === 0) return;
    if (klatscher === teile.length) {
      setRichtig(true);
      if (nr < raetsel.woerter.length - 1) fb.richtig();
      uhr.current = window.setTimeout(() => {
        setNr((n) => n + 1);
        setKlatscher(0);
        setStufe(0);
        setRichtig(false);
      }, 1600);
    } else {
      setStufe(fb.fehler(wort));
      setWackelt(true);
      window.setTimeout(() => setWackelt(false), 600);
      setKlatscher(0);
    }
  };

  return (
    <RaetselRahmen titel={raetsel.titel} aufgabe={raetsel.aufgabe} geloest={fertigAlle} helfer={helfer} erfolgText={raetsel.erfolg}>
      <div class="silben">
        <div class="silben-fortschritt" aria-label={`Wort ${Math.min(nr + 1, raetsel.woerter.length)} von ${raetsel.woerter.length}`}>
          {raetsel.woerter.map((_, i) => (
            <span key={i} class={i < nr || (i === nr && richtig) ? 'punkt an' : 'punkt'} />
          ))}
        </div>

        <div class={`silben-wort ${wackelt ? 'wackeln' : ''} ${richtig ? 'richtig' : ''}`}>
          {richtig || stufe >= 2 ? (
            teile.map((t, i) => (
              <span key={i} class="silbe">
                {t}
                {i < teile.length - 1 && <span class="silben-strich">-</span>}
              </span>
            ))
          ) : (
            ohneTrennung(wort)
          )}
        </div>

        <div class="klatsch-zeile">
          {Array.from({ length: Math.max(klatscher, stufe >= 3 ? teile.length : 0) }, (_, i) => (
            <span key={i} class={i < klatscher ? 'klatsch an' : 'klatsch hilfe'} aria-hidden="true">
              <img src={klatschBild} alt="" draggable={false} />
            </span>
          ))}
        </div>

        <div class="silben-knoepfe">
          <button class="klatsch-knopf" disabled={richtig} onClick={() => setKlatscher((k) => Math.min(k + 1, 6))} aria-label="Klatschen">
            <img src={klatschBild} alt="" draggable={false} />
          </button>
          <button class="gross-knopf zweitrangig" disabled={richtig || klatscher === 0} onClick={() => setKlatscher(0)}>
            Nochmal
          </button>
          <button class="gross-knopf primaer" disabled={richtig || klatscher === 0} onClick={pruefen}>
            Fertig
          </button>
        </div>
      </div>
    </RaetselRahmen>
  );
}
