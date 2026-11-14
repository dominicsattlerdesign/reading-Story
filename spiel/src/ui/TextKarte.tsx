import { useState } from 'preact/hooks';
import { asset } from '../inhalt';

/**
 * Text auf Pergament. Nach dem Lesen tippt das Kind auf "Gelesen", dann klappt die Karte zu
 * und das ganze Bild ist frei. Die Schriftrolle am Rand klappt sie wieder auf.
 */
export function TextKarte(props: { text: string }) {
  const [zu, setZu] = useState(false);

  if (zu) {
    return (
      <button class="textkarte-zu" onClick={() => setZu(false)} aria-label="Text wieder aufklappen">
        <img src={asset('gegenstaende/oberflaeche/schriftrolle')} alt="" draggable={false} />
      </button>
    );
  }

  return (
    <div class="textkarte">
      <p class="textkarte-text">{props.text}</p>
      <button class="gelesen-knopf" onClick={() => setZu(true)}>
        Gelesen <span aria-hidden="true">✓</span>
      </button>
    </div>
  );
}
