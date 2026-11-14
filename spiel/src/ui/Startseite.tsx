import { asset } from '../inhalt';
import { Halteknopf } from './Halteknopf';

export function Startseite(props: { kannWeiterlesen: boolean; weiterlesen: () => void; vonVorne: () => void; oeffneEltern: () => void }) {
  return (
    <div class="startseite">
      <div class="deckel">
        <img class="deckel-bild" src={asset('hintergruende/ort13_flug_panorama')} alt="" draggable={false} />
        <div class="deckel-verlauf" />
        <img class="deckel-held" src={asset('figuren/ida/ida_reitet_silberwind_2')} alt="Ida reitet auf Silberwind" draggable={false} />
        <h1 class="deckel-titel">
          <span class="titel-klein">Ida und der</span>
          <span class="titel-gross">Pegasus</span>
        </h1>
        <div class="deckel-knoepfe">
          {props.kannWeiterlesen && (
            <button class="gross-knopf primaer" onClick={props.weiterlesen}>
              Weiterlesen
            </button>
          )}
          <button class={`gross-knopf ${props.kannWeiterlesen ? 'zweitrangig' : 'primaer'}`} onClick={props.vonVorne}>
            {props.kannWeiterlesen ? 'Von vorne' : 'Los geht’s!'}
          </button>
        </div>
      </div>
      <Halteknopf class="ecke-oben-rechts bild-knopf" label="Elternbereich" ausloesen={props.oeffneEltern}>
        <img src={asset('gegenstaende/oberflaeche/einstellungen')} alt="" draggable={false} />
      </Halteknopf>
    </div>
  );
}
