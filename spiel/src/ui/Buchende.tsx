import { useEffect, useRef, useState } from 'preact/hooks';
import { asset } from '../inhalt';
import { MusikKnopf } from './MusikKnopf';

/** So lange dauert das Zuklappen: Ende und Widmung lesen, Deckel schliesst, Buch rutscht zurueck auf den Tisch */
const ZUKLAPPEN_MS = 6600;

/**
 * Das Ende des Buchs: Links liegt die letzte Seite mit dem Schriftzug „Ende“,
 * rechts die Innenseite des hinteren Deckels mit der Widmung. Dann klappt der Deckel zu,
 * und das Buch liegt mit der Rueckseite nach oben wieder auf dem Tisch.
 */
export function Buchende(props: { zumAnfang: () => void }) {
  const [fertig, setFertig] = useState(false);
  const uhr = useRef<number | null>(null);
  useEffect(() => {
    uhr.current = window.setTimeout(() => setFertig(true), ZUKLAPPEN_MS);
    return () => { if (uhr.current) window.clearTimeout(uhr.current); };
  }, []);

  // Wer nicht warten mag, tippt aufs Buch
  const ueberspringen = () => {
    if (fertig) return;
    if (uhr.current) window.clearTimeout(uhr.current);
    setFertig(true);
  };

  return (
    <div class={`startseite buchende ${fertig ? 'fertig' : ''}`}>
      <img class="tisch" src={asset('hintergruende/start_tisch_tischdecke')} alt="" draggable={false} />
      <div class="tisch-licht" aria-hidden="true" />

      <div class="buch" aria-label="Das Buch ist zu Ende" onClick={ueberspringen}>
        {/* letzte Seite */}
        <div class="buch-seiten" aria-hidden="true">
          <div class="ende-blatt">
            <img class="ende-schriftzug" src={asset('gegenstaende/buch/schriftzug_ende')} alt="" draggable={false} />
            <div class="ende-titel">Ida und der Pegasus</div>
          </div>
        </div>
        {/* hinterer Deckel: dreht sich um den Buchruecken (rechte Kante) */}
        <div class="buch-deckel">
          <div class="deckel-vorne">
            <img class="deckel-bild" src={asset('gegenstaende/buch/buch_rueckseite')} alt="" draggable={false} />
          </div>
          <div class="deckel-innen widmung">
            <div class="widmung-zier" aria-hidden="true">❦</div>
            <p>
              Für meine liebste Ida,
              <br />
              dass du immer so unerschrocken
              <br />
              und mutig sein wirst.
            </p>
            <div class="widmung-zier" aria-hidden="true">✦</div>
          </div>
        </div>
      </div>

      <div class="ende-knoepfe">
        <button class="gross-knopf primaer" onClick={props.zumAnfang}>
          Zum Buchdeckel
        </button>
      </div>

      <MusikKnopf />
    </div>
  );
}
