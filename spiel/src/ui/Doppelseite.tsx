import type { Seite } from '../inhalt/typen';
import type { Spielstand } from '../engine/speicher';
import { asset } from '../inhalt';
import { TextKarte } from './TextKarte';
import { Leiste } from './Leiste';
import { Halteknopf } from './Halteknopf';

/** Eine aufgeschlagene Doppelseite: Hintergrund ueber beide Seiten, Text links, Leiste unten. */
export function Doppelseite(props: { seite: Seite; stand: Spielstand; zurStartseite: () => void; oeffneEltern: () => void }) {
  const { seite, stand } = props;
  return (
    <div class="doppelseite aufblaettern">
      <img class="hintergrund" src={asset(seite.hintergrund)} alt={seite.titel} draggable={false} />
      {(seite.figuren ?? []).map((f, i) => (
        <img
          key={i}
          class="figur"
          src={asset(f.bild)}
          alt=""
          draggable={false}
          style={{ left: `${f.x}px`, top: `${f.y - f.hoehe}px`, height: `${f.hoehe}px`, transform: f.spiegeln ? 'scaleX(-1)' : undefined }}
        />
      ))}
      <div class="buchfalz" aria-hidden="true" />

      <button class="ecke-oben-links rund-knopf" onClick={props.zurStartseite} aria-label="Zum Buchdeckel">
        🏠
      </button>
      <div class="seitenzahl">Seite {seite.nummer}</div>
      <Halteknopf class="ecke-oben-rechts" label="Elternbereich" ausloesen={props.oeffneEltern}>
        ⚙
      </Halteknopf>

      <TextKarte text={seite.text} />

      <Leiste inventar={stand.inventar} lichter={0} raetsel={{ gesamt: 3, geloest: (stand.geloest[seite.id] ?? []).length }} />
    </div>
  );
}
