import type { ComponentChildren } from 'preact';
import { useContext, useRef, useState } from 'preact/hooks';
import { Massstab } from '../Buehne';

/**
 * Eine Karte, die man mit dem Finger auf ein Ziel ziehen ODER antippen kann.
 * Ziele sind Elemente mit dem Attribut data-ziel="<id>".
 * - Ziehen und Loslassen ueber einem Ziel ruft ablegen(zielId) auf.
 * - Kurzes Antippen ruft antippen() auf (Karte auswaehlen, dann Ziel antippen).
 */
export function Ziehkarte(props: {
  ablegen: (zielId: string) => void;
  antippen: () => void;
  gewaehlt?: boolean;
  wackeln?: boolean;
  leuchten?: boolean;
  class?: string;
  label: string;
  children: ComponentChildren;
}) {
  const skala = useContext(Massstab);
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const [versatz, setVersatz] = useState<{ x: number; y: number } | null>(null);
  const zieht = useRef(false);

  const runter = (e: PointerEvent) => {
    if (start.current) return; // nur ein Finger
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    zieht.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const bewegen = (e: PointerEvent) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    const dx = (e.clientX - s.x) / skala;
    const dy = (e.clientY - s.y) / skala;
    if (!zieht.current && Math.hypot(dx, dy) < 12) return; // kleine Wackler zaehlen als Antippen
    zieht.current = true;
    setVersatz({ x: dx, y: dy });
  };

  const hoch = (e: PointerEvent) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    start.current = null;
    const el = e.currentTarget as HTMLElement;
    if (!zieht.current) {
      setVersatz(null);
      props.antippen();
      return;
    }
    // Ziel unter dem Finger suchen (Karte dafuer kurz ausblenden)
    el.style.visibility = 'hidden';
    const unten = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    el.style.visibility = '';
    const ziel = unten?.closest<HTMLElement>('[data-ziel]');
    setVersatz(null);
    zieht.current = false;
    if (ziel?.dataset.ziel) props.ablegen(ziel.dataset.ziel);
  };

  const abbrechen = () => {
    start.current = null;
    zieht.current = false;
    setVersatz(null);
  };

  const klassen = ['ziehkarte', props.class, props.gewaehlt && 'gewaehlt', props.wackeln && 'wackeln', props.leuchten && 'leuchten', versatz && 'zieht']
    .filter(Boolean)
    .join(' ');

  return (
    <button
      class={klassen}
      aria-label={props.label}
      aria-pressed={props.gewaehlt}
      style={versatz ? { transform: `translate(${versatz.x}px, ${versatz.y}px) scale(1.08)` } : undefined}
      onPointerDown={runter}
      onPointerMove={bewegen}
      onPointerUp={hoch}
      onPointerCancel={abbrechen}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); props.antippen(); } }}
    >
      {props.children}
    </button>
  );
}
