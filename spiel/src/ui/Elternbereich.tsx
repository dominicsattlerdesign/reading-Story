import { useEffect, useState } from 'preact/hooks';
import type { Einstellungen } from '../engine/speicher';
import { vorleser, type Stimme } from '../engine/vorlesen';

export function Elternbereich(props: {
  einstellungen: Einstellungen;
  aendern: (e: Partial<Einstellungen>) => void;
  fortschrittLoeschen: () => void;
  schliessen: () => void;
}) {
  const e = props.einstellungen;
  const [stimmen, setStimmen] = useState<Stimme[]>(() => vorleser.stimmen());
  const [sicher, setSicher] = useState(false);

  // Stimmen werden in manchen Browsern erst verzoegert geladen
  useEffect(() => {
    if (!vorleser.verfuegbar) return;
    const neu = () => setStimmen(vorleser.stimmen());
    speechSynthesis.addEventListener('voiceschanged', neu);
    return () => speechSynthesis.removeEventListener('voiceschanged', neu);
  }, []);

  return (
    <div class="eltern-hintergrund" onClick={props.schliessen}>
      <div class="eltern" role="dialog" aria-label="Elternbereich" onClick={(ev) => ev.stopPropagation()}>
        <h2>Elternbereich</h2>

        <label class="zeile">
          <input type="checkbox" checked={e.autoVorlesen} onChange={(ev) => props.aendern({ autoVorlesen: ev.currentTarget.checked })} />
          Texte und Aufgaben automatisch vorlesen
        </label>

        <label class="zeile">
          <input type="checkbox" checked={e.lesehilfe} onChange={(ev) => props.aendern({ lesehilfe: ev.currentTarget.checked })} />
          Lesehilfe: Wortkärtchen in Rätseln beim Antippen vorlesen
        </label>

        <label class="zeile spalte">
          Sprechtempo: {Math.round(e.tempo * 100)} %
          <input type="range" min={0.6} max={1.2} step={0.05} value={e.tempo} onInput={(ev) => props.aendern({ tempo: Number(ev.currentTarget.value) })} />
        </label>

        <label class="zeile spalte">
          Stimme
          <select value={e.stimme ?? ''} onChange={(ev) => props.aendern({ stimme: ev.currentTarget.value || null })}>
            <option value="">Automatisch wählen</option>
            {stimmen.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
          {!vorleser.verfuegbar && <small>Dieser Browser kann nicht vorlesen.</small>}
        </label>

        <button class="klein-knopf" onClick={() => vorleser.sprich('So klingt die Stimme. Ida und Rabat suchen Silberwind.')}>
          Stimme anhören
        </button>

        <hr />
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
