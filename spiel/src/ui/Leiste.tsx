import { useEffect, useRef, useState } from 'preact/hooks';
import { asset, inventar } from '../inhalt';

/** Untere Leiste: Rabbat als Hilfe, Inventar, Raetsel-Punkte, Weiter-Knopf. */
export function Leiste(props: {
  inventar: string[];
  lichter: number;
  raetsel: { gesamt: number; geloest: number };
  rabatBlase: string | null;
  rabatTippen: () => void;
  blaseZu: () => void;
  weiter: () => void;
}) {
  // frisch gefundenes Fundstueck kurz hervorheben
  const [neu, setNeu] = useState<string | null>(null);
  const vorher = useRef(props.inventar);
  useEffect(() => {
    const dazu = props.inventar.find((i) => !vorher.current.includes(i));
    vorher.current = props.inventar;
    if (!dazu) return;
    setNeu(dazu);
    const t = window.setTimeout(() => setNeu(null), 2500);
    return () => window.clearTimeout(t);
  }, [props.inventar]);

  const fertig = props.raetsel.geloest >= props.raetsel.gesamt;

  return (
    <div class="leiste">
      <button class="rabat-knopf" onClick={props.rabatTippen} aria-label="Rabbat um Hilfe bitten">
        <img src={asset('figuren/rabat/rabat_schal_lacht')} alt="" draggable={false} />
      </button>
      {props.rabatBlase && (
        <button class="sprechblase rabat-blase" aria-live="polite" onClick={props.blaseZu}>
          {props.rabatBlase}
        </button>
      )}

      <ul class="inventar" aria-label="Deine Fundstücke">
        {inventar.map((ding) => {
          const hat = props.inventar.includes(ding.id);
          return (
            <li key={ding.id} class={`fach ${hat ? 'voll' : ''} ${neu === ding.id ? 'neu' : ''}`} title={hat ? ding.name : 'noch nicht gefunden'}>
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

      <button class={`weiter-knopf ${fertig ? 'bereit' : ''}`} disabled={!fertig} onClick={props.weiter}>
        Weiter <span aria-hidden="true">▶</span>
      </button>
    </div>
  );
}
