import { useEffect } from 'preact/hooks';
import { asset } from '../inhalt';

/** Dauer einer umgeblaetterten Seite */
export const UMBLAETTERN_MS = 1000;

/**
 * Echtes Umblaettern zwischen zwei Doppelseiten: Die rechte Haelfte der alten Seite hebt sich,
 * dreht sich um den Buchfalz in der Mitte und legt sich links ab. Auf ihrer Rueckseite ist schon
 * die linke Haelfte der neuen Seite zu sehen. Darunter liegt bereits die neue Doppelseite.
 * Rueckwaerts ist es spiegelverkehrt: die linke Haelfte dreht sich nach rechts.
 */
export function Umblaettern(props: { alt: string; neu: string; rueckwaerts?: boolean; fertig: () => void }) {
  useEffect(() => {
    const uhr = window.setTimeout(props.fertig, UMBLAETTERN_MS);
    return () => window.clearTimeout(uhr);
  }, []);

  const bild = (pfad: string) => ({ backgroundImage: `url(${asset(pfad)})` });
  // Seite, die liegen bleibt, bis das Blatt sie zudeckt, und die beiden Seiten des Blatts
  const [liegt, vorne, hinten] = props.rueckwaerts ? ['rechts', 'links', 'rechts'] : ['links', 'rechts', 'links'];

  return (
    <div class={`umblaettern ${props.rueckwaerts ? 'rueckwaerts' : ''}`} aria-hidden="true">
      <div class={`halbseite ${liegt} liegt`} style={bild(props.alt)} />
      <div class="blatt">
        <div class={`blatt-vorne halbseite ${vorne}`} style={bild(props.alt)}>
          <div class="blatt-schatten" />
        </div>
        <div class={`blatt-hinten halbseite ${hinten}`} style={bild(props.neu)}>
          <div class="blatt-schatten" />
        </div>
      </div>
    </div>
  );
}
