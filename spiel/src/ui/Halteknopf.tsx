import type { ComponentChildren } from 'preact';
import { useRef, useState } from 'preact/hooks';

/** Knopf, der erst nach `dauer` ms Gedrueckthalten ausloest (Kindersicherung fuer den Elternbereich). */
export function Halteknopf(props: { dauer?: number; ausloesen: () => void; class?: string; label: string; children: ComponentChildren }) {
  const dauer = props.dauer ?? 3000;
  const uhr = useRef<number | null>(null);
  const [haelt, setHaelt] = useState(false);

  const start = (e: PointerEvent) => {
    e.preventDefault();
    setHaelt(true);
    uhr.current = window.setTimeout(() => {
      setHaelt(false);
      props.ausloesen();
    }, dauer);
  };
  const ende = () => {
    if (uhr.current) window.clearTimeout(uhr.current);
    uhr.current = null;
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
      onPointerLeave={ende}
      onPointerCancel={ende}
      onContextMenu={(e) => e.preventDefault()}
    >
      {props.children}
      <span class="halte-ring" aria-hidden="true" />
    </button>
  );
}
