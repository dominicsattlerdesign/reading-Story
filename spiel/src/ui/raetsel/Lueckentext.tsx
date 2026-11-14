import { useMemo, useState } from 'preact/hooks';
import type { LueckenRaetsel } from '../../inhalt/typen';
import { mischen, zerlegeLuecken } from '../../engine/logik';
import { RaetselRahmen, useFehler, useWackeln, type RaetselHelfer } from './gemeinsam';
import { Ziehkarte } from './Ziehkarte';

/** Woerter in die Luecken eines Textes ziehen (oder Wort antippen, dann Luecke antippen). */
export function Lueckentext({ raetsel, helfer }: { raetsel: LueckenRaetsel; helfer: RaetselHelfer }) {
  const teile = useMemo(() => zerlegeLuecken(raetsel.text), [raetsel.text]);
  const luecken = teile.filter((t) => t.art === 'luecke') as { art: 'luecke'; nr: number; wort: string }[];
  const karten = useMemo(
    () => mischen([...luecken.map((l) => l.wort), ...raetsel.falsche]).map((wort, i) => ({ id: `k${i}`, wort })),
    [raetsel.id],
  );

  const [gefuellt, setGefuellt] = useState<(string | null)[]>(() => luecken.map(() => null)); // Karten-ID je Luecke
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);
  const [leuchtet, setLeuchtet] = useState<string | null>(null); // Karten-ID, die als Hilfe leuchtet
  const [wackelt, wackeln] = useWackeln();
  const fb = useFehler(helfer, raetsel.tipps[0]);

  const benutzt = new Set(gefuellt.filter(Boolean) as string[]);
  const geloest = gefuellt.every(Boolean);

  const versuche = (kartenId: string, nr: number) => {
    const karte = karten.find((k) => k.id === kartenId);
    if (!karte || gefuellt[nr] || benutzt.has(kartenId)) return;
    setGewaehlt(null);
    if (karte.wort === luecken[nr].wort) {
      const neu = [...gefuellt];
      neu[nr] = kartenId;
      setGefuellt(neu);
      setLeuchtet(null);
      if (!neu.every(Boolean)) fb.richtig();
    } else {
      wackeln(`l${nr}`);
      if (fb.fehler(`l${nr}`) >= 3) {
        const richtige = karten.find((k) => k.wort === luecken[nr].wort && !benutzt.has(k.id));
        setLeuchtet(richtige?.id ?? null);
      }
    }
  };

  return (
    <RaetselRahmen titel={raetsel.titel} aufgabe={raetsel.aufgabe} geloest={geloest} helfer={helfer} erfolgText={raetsel.erfolg}>
      <div class="luecken-text">
        {teile.map((t, i) =>
          t.art === 'text' ? (
            <span key={i}>{t.text}</span>
          ) : (
            <button
              key={i}
              data-ziel={`${t.nr}`}
              class={`luecke ${gefuellt[t.nr] ? 'voll' : ''} ${wackelt === `l${t.nr}` ? 'wackeln' : ''} ${gewaehlt && !gefuellt[t.nr] ? 'bereit' : ''}`}
              aria-label={gefuellt[t.nr] ? luecken[t.nr].wort : `Lücke ${t.nr + 1}`}
              onClick={() => gewaehlt && versuche(gewaehlt, t.nr)}
            >
              {gefuellt[t.nr] ? luecken[t.nr].wort : ''}
            </button>
          ),
        )}
      </div>
      <div class="kartenstapel">
        {karten.map((k) =>
          benutzt.has(k.id) ? (
            <span key={k.id} class="ziehkarte platzhalter" aria-hidden="true">{k.wort}</span>
          ) : (
            <Ziehkarte
              key={k.id}
              label={k.wort}
              gewaehlt={gewaehlt === k.id}
              leuchten={leuchtet === k.id}
              antippen={() => setGewaehlt(gewaehlt === k.id ? null : k.id)}
              ablegen={(ziel) => versuche(k.id, Number(ziel))}
            >
              {k.wort}
            </Ziehkarte>
          ),
        )}
      </div>
    </RaetselRahmen>
  );
}
