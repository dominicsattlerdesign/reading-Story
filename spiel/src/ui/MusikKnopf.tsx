import { useEffect, useState } from 'preact/hooks';
import { asset } from '../inhalt';
import { musik } from './musik';

/** Gemalte Musiknote neben dem Zahnrad: Antippen schaltet die Musik aus und wieder an. */
export function MusikKnopf() {
  const [an, setAn] = useState(musik.istAn());
  useEffect(() => musik.abonnieren(setAn), []);

  return (
    <button
      class={`rund-knopf bild-knopf musik-knopf ${an ? '' : 'aus'}`}
      onClick={() => musik.setAn(!an)}
      aria-label={an ? 'Musik ausschalten' : 'Musik einschalten'}
      aria-pressed={!an}
    >
      <img src={asset('gegenstaende/oberflaeche/musik')} alt="" draggable={false} />
      <span class="musik-strich" aria-hidden="true" />
    </button>
  );
}
