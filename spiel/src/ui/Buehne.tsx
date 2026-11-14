import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';

export const BREITE = 1600;
export const HOEHE = 900;

/** Feste Buehne mit 1600 x 900 Punkten, die in jedes Fenster eingepasst wird (mit Rand). */
export function Buehne({ children }: { children: ComponentChildren }) {
  const [skala, setSkala] = useState(1);

  useEffect(() => {
    const anpassen = () => setSkala(Math.min(window.innerWidth / BREITE, window.innerHeight / HOEHE));
    anpassen();
    window.addEventListener('resize', anpassen);
    return () => window.removeEventListener('resize', anpassen);
  }, []);

  return (
    <div class="rahmen">
      <div class="buehne" style={{ width: `${BREITE}px`, height: `${HOEHE}px`, transform: `translate(-50%, -50%) scale(${skala})` }}>
        {children}
      </div>
      <div class="drehen-hinweis" role="alert">
        <div class="drehen-symbol" aria-hidden="true">⟳</div>
        <p>Bitte dreh das Gerät.</p>
      </div>
    </div>
  );
}
