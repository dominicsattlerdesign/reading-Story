import { useEffect, useRef, useState } from 'preact/hooks';
import { asset, inventar } from '../inhalt';
import { vorleser } from '../engine/vorlesen';

const RABAT_SAETZE = [
  'Ich bin Rabat! Wenn du nicht weiterweißt, tipp auf mich.',
  'Schau dich gut um. Vielleicht kannst du etwas antippen?',
];

/** Untere Leiste: Rabat als Hilfe, Inventar, Raetsel-Punkte, Weiter-Knopf. */
export function Leiste(props: {
  inventar: string[];
  lichter: number;
  raetsel: { gesamt: number; geloest: number };
  weiter?: () => void;
}) {
  const [blase, setBlase] = useState<string | null>(null);
  const zaehler = useRef(0);
  const uhr = useRef<number | null>(null);

  useEffect(() => () => { if (uhr.current) window.clearTimeout(uhr.current); }, []);

  const rabatHilft = async () => {
    const satz = RABAT_SAETZE[zaehler.current % RABAT_SAETZE.length];
    zaehler.current++;
    setBlase(satz);
    if (uhr.current) window.clearTimeout(uhr.current);
    await vorleser.sprich(satz);
    uhr.current = window.setTimeout(() => setBlase(null), 1500);
  };

  const fertig = props.raetsel.geloest >= props.raetsel.gesamt;

  return (
    <div class="leiste">
      <button class="rabat-knopf" onClick={rabatHilft} aria-label="Rabat um Hilfe bitten">
        <img src={asset('figuren/rabat/rabat_schal_lacht')} alt="" draggable={false} />
      </button>
      {blase && (
        <div class="sprechblase rabat-blase" role="status">
          {blase}
        </div>
      )}

      <ul class="inventar" aria-label="Deine Fundstücke">
        {inventar.map((ding) => {
          const hat = props.inventar.includes(ding.id);
          return (
            <li key={ding.id} class={hat ? 'fach voll' : 'fach'} title={hat ? ding.name : 'noch nicht gefunden'}>
              {hat && <img src={asset(ding.bild)} alt={ding.name} draggable={false} />}
              {hat && ding.id === 'laterne' && (
                <span class="lichter" aria-label={`${props.lichter} von 3 Lichtern`}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} class={i < props.lichter ? 'licht an' : 'licht'} />
                  ))}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <div class="raetsel-punkte" aria-label={`${props.raetsel.geloest} von ${props.raetsel.gesamt} Rätseln gelöst`}>
        {Array.from({ length: props.raetsel.gesamt }, (_, i) => (
          <span key={i} class={i < props.raetsel.geloest ? 'punkt an' : 'punkt'} />
        ))}
      </div>

      <button class={`weiter-knopf ${fertig ? 'bereit' : ''}`} disabled={!fertig || !props.weiter} onClick={props.weiter}>
        Weiter <span aria-hidden="true">▶</span>
      </button>
    </div>
  );
}
