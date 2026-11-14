import type { Objekt } from '../inhalt/typen';
import { asset } from '../inhalt';
import { erfuellt } from '../engine/logik';

export interface Blase {
  text: string;
  x: number; // Ankerpunkt auf der Buehne
  y: number;
  unten: boolean; // Blase unterhalb des Ankers anzeigen
}

/** Ort fuer eine Sprechblase an einem Objekt. */
export function blaseAn(o: Objekt, text: string): Blase {
  if (o.blaseAnker) return { text, x: o.blaseAnker.x, y: o.blaseAnker.y, unten: !!o.blaseAnker.unten };
  const x = Math.min(Math.max(o.x + o.b / 2, 260), 1340);
  const unten = o.y < 180;
  return { text, x, y: unten ? o.y + o.h + 14 : o.y - 14, unten };
}

/** Alle Objekte einer Seite: Figuren, Dinge und unsichtbare Antipp-Flaechen. */
export function Szene(props: {
  objekte: Objekt[];
  merker: Set<string>;
  leuchtet: string | null;
  antippen: (o: Objekt) => void;
  blase: Blase | null;
  blaseZu: () => void;
}) {
  const sichtbar = props.objekte
    .filter((o) => erfuellt(o.sichtbar, props.merker))
    .sort((a, b) => (a.ebene ?? 0) - (b.ebene ?? 0));

  return (
    <>
      {sichtbar.some((o) => o.effekt === 'licht') && <div class="effekt-licht" aria-hidden="true" />}
      {sichtbar.map((o) => {
        const klickbar = !!o.klick?.length;
        const klassen = [
          'objekt',
          o.bild ? 'mit-bild' : 'flaeche',
          o.bild?.startsWith('figuren/') && 'figur',
          klickbar && 'klickbar',
          o.funkeln && erfuellt(o.funkeln, props.merker) && 'funkeln',
          props.leuchtet === o.id && 'hinweis',
        ]
          .filter(Boolean)
          .join(' ');
        const stil = { left: `${o.x}px`, top: `${o.y}px`, width: `${o.b}px`, height: `${o.h}px`, zIndex: `${2 + (o.ebene ?? 0)}` };
        const inhalt = o.bild ? (
          <img src={asset(o.bild)} alt="" draggable={false} style={o.spiegeln ? { transform: 'scaleX(-1)' } : undefined} />
        ) : null;
        return klickbar ? (
          <button key={o.id} class={klassen} style={stil} aria-label={o.name} onClick={() => props.antippen(o)}>
            {inhalt}
          </button>
        ) : (
          <div key={o.id} class={klassen} style={stil} aria-hidden="true">
            {inhalt}
          </div>
        );
      })}
      {props.blase && (
        <button
          class={`sprechblase szenen-blase ${props.blase.unten ? 'unten' : 'oben'}`}
          style={{ left: `${props.blase.x}px`, top: `${props.blase.y}px` }}
          onClick={props.blaseZu}
          aria-live="polite"
        >
          {props.blase.text}
        </button>
      )}
    </>
  );
}
