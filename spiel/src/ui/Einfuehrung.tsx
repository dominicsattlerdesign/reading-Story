import { useContext, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { asset } from '../inhalt';
import { BREITE, HOEHE, Massstab } from './Buehne';

const GESEHEN = 'ida-pegasus/einfuehrung';

/** Wurde die Einfuehrung schon einmal ganz angesehen? */
export function einfuehrungGesehen(): boolean {
  try { return localStorage.getItem(GESEHEN) === 'gesehen'; } catch { return true; }
}
function merkeGesehen() {
  try { localStorage.setItem(GESEHEN, 'gesehen'); } catch { /* egal */ }
}

/** Ein Schritt: was hervorgehoben wird (CSS-Auswahl auf der Doppelseite, leer = nur Rabbat) und was Rabbat sagt */
type Schritt = { ziel?: string; text: string };

const SCHRITTE: Schritt[] = [
  { text: 'Hallo! Ich bin Rabbat, Idas bester Freund. Bevor unser Abenteuer losgeht, zeige ich dir, wie alles funktioniert.' },
  { ziel: '.rabat-knopf', text: 'Das bin ich! Wenn du einmal nicht weiterweißt, tippe auf mich. Dann gebe ich dir einen Tipp.' },
  { ziel: '.textkarte, .textkarte-zu', text: 'Hier steht die Geschichte. Wenn du sie gelesen hast, tippe auf „Gelesen“. Mit der Schriftrolle holst du sie wieder.' },
  { ziel: '.inventar', text: 'Hier kommen alle Dinge hin, die Ida unterwegs findet. Manche brauchst du später noch.' },
  { ziel: '.raetsel-punkte', text: 'Diese Punkte zeigen, wie viele Rätsel du auf der Seite schon gelöst hast.' },
  { ziel: '.weiter-knopf', text: 'Wenn du alle Rätsel auf einer Seite gelöst hast, kannst du hier umblättern.' },
  { ziel: '.seitenzahl', text: 'Auf vielen Seiten ist ein leuchtender Buchstabe versteckt. Hier siehst du, welche du schon gefunden hast.' },
  { ziel: '.musik-knopf', text: 'Hier kannst du die Musik ein- und ausschalten.' },
  { ziel: '.neustart-knopf', text: 'Mit dem Pfeil fängst du die Seite noch einmal von vorne an.' },
  { ziel: '.ecke-oben-links', text: 'Mit dem Haus kommst du zurück zum Buchdeckel.' },
  { ziel: '.ecke-oben-rechts', text: 'Das Zahnrad ist für Mama und Papa.' },
  { text: 'Super, jetzt weißt du alles! Tippe auf die Dinge im Bild und schau, was passiert. Los geht’s!' },
];

type Rechteck = { x: number; y: number; b: number; h: number };
const ABSTAND = 26; // zwischen hervorgehobenem Symbol und Sprechblase
const BLASE_B = 820;

/**
 * Einfuehrung auf der ersten Seite: Das Bild wird abgedunkelt, Rabbat zeigt nacheinander jedes Symbol,
 * das dauerhaft zu sehen ist. Erst „Verstanden!“ fuehrt zum naechsten Symbol.
 */
export function Einfuehrung(props: { fertig: () => void }) {
  const skala = useContext(Massstab);
  const [nr, setNr] = useState(0);
  const [ziel, setZiel] = useState<Rechteck | null>(null);
  const [blase, setBlase] = useState<{ left: number; top: number } | null>(null);
  // neben grossen Symbolen (z. B. der Textkarte) wird die Blase schmaler, damit sie daneben passt
  const [breite, setBreite] = useState(BLASE_B);
  const blaseRef = useRef<HTMLDivElement>(null);
  const ebeneRef = useRef<HTMLDivElement>(null);
  const schritt = SCHRITTE[nr];

  // Lage des hervorgehobenen Symbols in Buehnen-Punkten
  useLayoutEffect(() => {
    const buehne = ebeneRef.current?.parentElement;
    const el = schritt.ziel && buehne ? (buehne.querySelector(schritt.ziel) as HTMLElement | null) : null;
    if (!el || !buehne) { setZiel(null); return; }
    const b = buehne.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const pad = 10;
    setZiel({ x: (r.left - b.left) / skala - pad, y: (r.top - b.top) / skala - pad, b: r.width / skala + 2 * pad, h: r.height / skala + 2 * pad });
  }, [nr, skala]);

  // Sprechblase dort hinstellen, wo am meisten Platz ist, ohne das Symbol zu verdecken
  useLayoutEffect(() => {
    const el = blaseRef.current;
    if (!el) return;
    const bh = el.offsetHeight;
    const mitte = (lo: number, hi: number, groesse: number) => Math.min(Math.max(lo, 30), hi - groesse - 30);
    if (!ziel) { setBlase({ left: (BREITE - breite) / 2, top: (HOEHE - bh) / 2 }); return; }
    const platz = { oben: ziel.y, unten: HOEHE - (ziel.y + ziel.h), links: ziel.x, rechts: BREITE - (ziel.x + ziel.b) };
    const cx = mitte(ziel.x + ziel.b / 2 - breite / 2, BREITE, breite);
    const cy = mitte(ziel.y + ziel.h / 2 - bh / 2, HOEHE, bh);
    if (platz.unten >= bh + ABSTAND + 20) setBlase({ left: cx, top: ziel.y + ziel.h + ABSTAND });
    else if (platz.oben >= bh + ABSTAND + 20) setBlase({ left: cx, top: ziel.y - ABSTAND - bh });
    else {
      // daneben: auf der Seite mit mehr Platz, notfalls schmaler
      const rechts = platz.rechts >= platz.links;
      const frei = (rechts ? platz.rechts : platz.links) - ABSTAND - 20;
      if (breite > frei && frei >= 520) { setBreite(frei); return; }
      setBlase({ left: rechts ? ziel.x + ziel.b + ABSTAND : Math.max(20, ziel.x - ABSTAND - breite), top: cy });
    }
  }, [ziel, nr, breite]);

  const weiter = () => {
    if (nr < SCHRITTE.length - 1) {
      setBlase(null);
      setBreite(BLASE_B);
      setNr(nr + 1);
    } else {
      merkeGesehen();
      props.fertig();
    }
  };

  const letzter = nr === SCHRITTE.length - 1;
  return (
    <div ref={ebeneRef} class="einfuehrung" role="dialog" aria-label="Einführung">
      {ziel ? (
        <div class="einfuehrung-licht" style={{ left: `${ziel.x}px`, top: `${ziel.y}px`, width: `${ziel.b}px`, height: `${ziel.h}px` }} />
      ) : (
        <div class="einfuehrung-dunkel" />
      )}
      <div
        ref={blaseRef}
        class="einfuehrung-blase"
        style={{ width: `${breite}px`, left: `${blase?.left ?? -2000}px`, top: `${blase?.top ?? 0}px`, visibility: blase ? 'visible' : 'hidden' }}
        aria-live="polite"
      >
        <img class="einfuehrung-rabbat" src={asset('figuren/rabat/rabat_schal_lacht')} alt="" draggable={false} />
        <div class="einfuehrung-inhalt">
          <p>{schritt.text}</p>
          <button class="gross-knopf primaer einfuehrung-knopf" onClick={weiter}>
            {letzter ? 'Los geht’s!' : 'Verstanden!'}
          </button>
        </div>
      </div>
    </div>
  );
}
