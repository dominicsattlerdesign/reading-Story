import { useState } from 'preact/hooks';

/** Text auf Pergament. Laesst sich zuklappen, damit man das ganze Bild sieht. */
export function TextKarte(props: { text: string }) {
  const [zu, setZu] = useState(false);

  if (zu) {
    return (
      <button class="textkarte-zu" onClick={() => setZu(false)} aria-label="Text wieder aufklappen">
        <span aria-hidden="true">📜</span>
      </button>
    );
  }

  return (
    <div class="textkarte">
      <p class="textkarte-text">{props.text}</p>
      <button class="textkarte-zuklappen" onClick={() => setZu(true)} aria-label="Text zuklappen">
        ‹
      </button>
    </div>
  );
}
