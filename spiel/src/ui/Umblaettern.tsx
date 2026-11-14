import { useEffect } from 'preact/hooks';
import { asset } from '../inhalt';

/** Dauer einer umgeblaetterten Seite */
export const UMBLAETTERN_MS = 1000;

/**
 * Echtes Umblaettern zwischen zwei Doppelseiten: Die rechte Haelfte der alten Seite hebt sich,
 * dreht sich um den Buchfalz in der Mitte und legt sich links ab. Auf ihrer Rueckseite ist schon
 * die linke Haelfte der neuen Seite zu sehen. Darunter liegt bereits die neue Doppelseite.
 */
export function Umblaettern(props: { alt: string; neu: string; fertig: () => void }) {
  useEffect(() => {
    const uhr = window.setTimeout(props.fertig, UMBLAETTERN_MS);
    return () => window.clearTimeout(uhr);
  }, []);

  const bild = (pfad: string) => ({ backgroundImage: `url(${asset(pfad)})` });

  return (
    <div class="umblaettern" aria-hidden="true">
      {/* linke Haelfte der alten Seite bleibt liegen, bis das Blatt sie zudeckt */}
      <div class="halbseite links" style={bild(props.alt)} />
      <div class="blatt">
        <div class="blatt-vorne halbseite rechts" style={bild(props.alt)}>
          <div class="blatt-schatten" />
        </div>
        <div class="blatt-hinten halbseite links" style={bild(props.neu)}>
          <div class="blatt-schatten" />
        </div>
      </div>
    </div>
  );
}
