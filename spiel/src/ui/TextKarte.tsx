import { useEffect, useMemo, useState } from 'preact/hooks';
import { vorleser, woerter } from '../engine/vorlesen';

/**
 * Text auf Pergament. Wird beim Erscheinen automatisch vorgelesen (wenn eingeschaltet).
 * Ein Tippen auf die Karte liest noch einmal vor. Das gesprochene Wort wird markiert.
 */
export function TextKarte(props: { text: string; autoVorlesen: boolean }) {
  const liste = useMemo(() => woerter(props.text), [props.text]);
  const [aktiv, setAktiv] = useState(-1);
  const [zu, setZu] = useState(false);

  const vorlesen = () => vorleser.sprich(props.text, { beiWort: setAktiv });

  useEffect(() => {
    if (!props.autoVorlesen) return;
    // kurz warten, bis die Seite aufgeblaettert ist
    const t = window.setTimeout(vorlesen, 700);
    return () => {
      window.clearTimeout(t);
      vorleser.stopp();
    };
  }, [props.text, props.autoVorlesen]);

  if (zu) {
    return (
      <button class="textkarte-zu" onClick={() => setZu(false)} aria-label="Text wieder aufklappen">
        <span aria-hidden="true">📜</span>
      </button>
    );
  }

  return (
    <div class="textkarte">
      <button class="textkarte-text" onClick={vorlesen} aria-label="Text noch einmal vorlesen">
        {liste.map((w, i) => (
          <span key={i} class={i === aktiv ? 'wort aktiv' : 'wort'}>
            {w.text}{' '}
          </span>
        ))}
      </button>
      <button
        class="textkarte-zuklappen"
        onClick={() => {
          vorleser.stopp();
          setZu(true);
        }}
        aria-label="Text zuklappen"
      >
        ‹
      </button>
    </div>
  );
}
