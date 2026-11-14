import { useState } from 'preact/hooks';

/** Elternbereich (hinter dem 3-Sekunden-Halteknopf). Spaeter kommt die Kapiteluebersicht dazu. */
export function Elternbereich(props: { fortschrittLoeschen: () => void; schliessen: () => void }) {
  const [sicher, setSicher] = useState(false);

  return (
    <div class="eltern-hintergrund" onClick={props.schliessen}>
      <div class="eltern" role="dialog" aria-label="Elternbereich" onClick={(ev) => ev.stopPropagation()}>
        <h2>Elternbereich</h2>

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
