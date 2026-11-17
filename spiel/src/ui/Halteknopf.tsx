import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

/**
 * Knopf, der erst nach `dauer` ms Gedrueckthalten ausloest (Kindersicherung fuer den Elternbereich).
 * Ein kurzer Tipp zeigt einen Hinweis, wie man ihn oeffnet.
 */
export function Halteknopf(props: { dauer?: number; ausloesen: () => void; class?: string; label: string; children: ComponentChildren }) {
  const dauer = props.dauer ?? 3000;
  const uhr = useRef<number | null>(null);
  const hinweisUhr = useRef<number | null>(null);
  const ausgeloest = useRef(false);
  const [haelt, setHaelt] = useState(false);
  const [hinweis, setHinweis] = useState(false);

  useEffect(() => () => {
    if (uhr.current) window.clearTimeout(uhr.current);
    if (hinweisUhr.current) window.clearTimeout(hinweisUhr.current);
  }, []);

  const start = (e: PointerEvent) => {
    e.preventDefault();
    // Zeiger festhalten: leichtes Verrutschen von Maus oder Finger bricht das Halten nicht ab
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* egal */ }
    ausgeloest.current = false;
    setHinweis(false);
    setHaelt(true);
    uhr.current = window.setTimeout(() => {
      ausgeloest.current = true;
      setHaelt(false);
      props.ausloesen();
    }, dauer);
  };

  const ende = () => {
    if (uhr.current) window.clearTimeout(uhr.current);
    uhr.current = null;
    if (haelt && !ausgeloest.current) {
      // zu kurz gedrueckt: kurz erklaeren, wie es geht
      setHinweis(true);
      if (hinweisUhr.current) window.clearTimeout(hinweisUhr.current);
      hinweisUhr.current = window.setTimeout(() => setHinweis(false), 3500);
    }
    setHaelt(false);
  };

  return (
    <button
      class={`halteknopf ${props.class ?? ''} ${haelt ? 'haelt' : ''}`}
      style={{ '--dauer': `${dauer}ms` }}
      aria-label={props.label}
      title={`${props.label} (3 Sekunden gedrückt halten)`}
      onPointerDown={start}
      onPointerUp={ende}
      onPointerCancel={ende}
      onContextMenu={(e) => e.preventDefault()}
    >
      {props.children}
      <span class="halte-ring" aria-hidden="true" />
      {hinweis && <span class="halte-hinweis">Für Erwachsene: 3 Sekunden gedrückt halten</span>}
    </button>
  );
}
