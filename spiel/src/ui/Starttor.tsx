import { useState } from 'preact/hooks';
import { asset } from '../inhalt';

/**
 * Allererster Bildschirm: Nur ein grosser Start-Knopf ueber dem unscharfen Tisch mit dem Buch.
 * Das Antippen ist noetig, damit der Browser danach Musik abspielen darf.
 */
export function Starttor(props: { start: () => void }) {
  const [weg, setWeg] = useState(false);

  const los = () => {
    if (weg) return;
    setWeg(true);
    props.start();
  };

  return (
    <div class={`starttor ${weg ? 'weg' : ''}`}>
      <button class="start-knopf" onClick={los} aria-label="Start">
        <img src={asset('gegenstaende/knoepfe/startknopf')} alt="" draggable={false} />
        <span class="start-schrift">Start</span>
      </button>
    </div>
  );
}
