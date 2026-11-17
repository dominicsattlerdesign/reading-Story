import { useEffect, useRef, useState } from 'preact/hooks';
import { asset } from '../inhalt';
import { Halteknopf } from './Halteknopf';
import { MusikKnopf } from './MusikKnopf';

/** So lange dauert das Aufschlagen: Deckel klappt auf, Titelblatt mit Mitwirkenden bleibt kurz liegen, dann Zoom ins Buch */
export const AUFSCHLAGEN_MS = 4800;

/**
 * Startseite: Ein geschlossenes Maerchenbuch liegt auf dem Tisch.
 * "Weiterlesen" bzw. "Von vorne" schlagen den Deckel auf, danach geht es in die Doppelseite.
 */
export function Startseite(props: { kannWeiterlesen: boolean; weiterlesen: () => void; vonVorne: () => void; oeffneEltern: () => void }) {
  const [oeffnet, setOeffnet] = useState(false);
  const uhr = useRef<number | null>(null);
  const weiter = useRef<(() => void) | null>(null);
  useEffect(() => () => { if (uhr.current) window.clearTimeout(uhr.current); }, []);

  const aufschlagen = (danach: () => void) => {
    if (oeffnet) return;
    setOeffnet(true);
    weiter.current = danach;
    uhr.current = window.setTimeout(danach, AUFSCHLAGEN_MS);
  };
  // Wer nicht warten mag, tippt aufs offene Buch
  const ueberspringen = () => {
    if (!oeffnet || !weiter.current) return;
    if (uhr.current) window.clearTimeout(uhr.current);
    const danach = weiter.current;
    weiter.current = null;
    danach();
  };

  return (
    <div class={`startseite ${oeffnet ? 'oeffnet' : ''}`}>
      <img class="tisch" src={asset('hintergruende/start_tisch_tischdecke')} alt="" draggable={false} />
      <div class="tisch-licht" aria-hidden="true" />

      <div class="start-links">
        <div class="deckel-knoepfe">
          {props.kannWeiterlesen && (
            <button class="gross-knopf primaer" onClick={() => aufschlagen(props.weiterlesen)}>
              Weiterlesen
            </button>
          )}
          <button class={`gross-knopf ${props.kannWeiterlesen ? 'zweitrangig' : 'primaer'}`} onClick={() => aufschlagen(props.vonVorne)}>
            {props.kannWeiterlesen ? 'Von vorne' : 'Los geht’s!'}
          </button>
        </div>
      </div>

      <div class="buch" aria-label="Das Buch „Ida und der Pegasus“" onClick={ueberspringen}>
        {/* Seitenblock unter dem Deckel: sichtbar, sobald der Deckel aufgeht */}
        <div class="buch-seiten" aria-hidden="true">
          <div class="titelblatt">
            <div class="titelblatt-zier">✦</div>
            <div class="titelblatt-klein">Ida und der</div>
            <div class="titelblatt-gross">Pegasus</div>
            <div class="titelblatt-zier">❦</div>
            <dl class="mitwirkende">
              <dt>Idee und Konzept</dt>
              <dd>Dominic Sattler</dd>
              <dt>Bilder</dt>
              <dd>gestaltet mit ChatGPT</dd>
              <dt>Programmiert</dt>
              <dd>mit Claude von Anthropic</dd>
            </dl>
          </div>
        </div>
        <div class="buch-deckel">
          <div class="deckel-vorne">
            <img class="deckel-bild" src={asset('gegenstaende/buch/buchdeckel')} alt="" draggable={false} />
            <h1 class="deckel-titel">
              <span class="titel-klein">Ida und der</span>
              <span class="titel-gross">Pegasus</span>
            </h1>
            <img class="deckel-foto" src={asset('gegenstaende/buch/deckel_foto')} alt="Altes Foto: Oma als Kind mit dem Pegasus" draggable={false} />
          </div>
          <div class="deckel-innen" aria-hidden="true" />
        </div>
      </div>

      <MusikKnopf />
      <Halteknopf class="ecke-oben-rechts bild-knopf" label="Elternbereich" ausloesen={props.oeffneEltern}>
        <img src={asset('gegenstaende/oberflaeche/einstellungen')} alt="" draggable={false} />
      </Halteknopf>
    </div>
  );
}
