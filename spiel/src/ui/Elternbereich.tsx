import { useEffect, useState } from 'preact/hooks';
import { musik } from './musik';

/** Elternbereich (hinter dem 3-Sekunden-Halteknopf). Spaeter kommt die Kapiteluebersicht dazu. */
export function Elternbereich(props: { fortschrittLoeschen: () => void; schliessen: () => void }) {
  const [sicher, setSicher] = useState(false);
  const [musikAn, setMusikAn] = useState(musik.istAn());
  const [laut, setLaut] = useState(Math.round(musik.lautstaerke() * 100));
  useEffect(() => musik.abonnieren(setMusikAn), []);

  return (
    <div class="eltern-hintergrund" onClick={props.schliessen}>
      <div class="eltern" role="dialog" aria-label="Elternbereich" onClick={(ev) => ev.stopPropagation()}>
        <h2>Elternbereich</h2>

        <div class="zeile">
          Musik:
          <button class="klein-knopf" onClick={() => { musik.setAn(!musikAn); setMusikAn(!musikAn); }}>
            {musikAn ? 'An – ausschalten' : 'Aus – einschalten'}
          </button>
        </div>
        <label class="zeile laut-regler">
          Lautstärke:
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={laut}
            onInput={(e) => {
              const v = Number((e.target as HTMLInputElement).value);
              setLaut(v);
              musik.setLautstaerke(v / 100);
              // wer die Lautstaerke aufdreht, will Musik hoeren: ausgeschaltete Musik geht dabei wieder an
              if (v > 0 && !musik.istAn()) musik.setAn(true);
            }}
          />
          <span class="laut-wert">{laut} %</span>
        </label>


        {!sicher ? (
          <button class="klein-knopf warnung" onClick={() => setSicher(true)}>
            Fortschritt zurücksetzen …
          </button>
        ) : (
          <div class="zeile">
            Wirklich alles Gesammelte löschen?
            <button class="klein-knopf warnung" onClick={() => { props.fortschrittLoeschen(); props.schliessen(); }}>
              Ja, löschen
            </button>
            <button class="klein-knopf" onClick={() => setSicher(false)}>
              Nein
            </button>
          </div>
        )}

        <button class="gross-knopf primaer schliessen" onClick={props.schliessen}>
          Fertig
        </button>
      </div>
    </div>
  );
}
