import { useMemo, useState } from 'preact/hooks';
import type { SortierKarte, SortierRaetsel } from '../../inhalt/typen';
import { mischen } from '../../engine/logik';
import { asset } from '../../inhalt';
import { RaetselRahmen, useFehler, useWackeln, type RaetselHelfer } from './gemeinsam';
import { Ziehkarte } from './Ziehkarte';

function KartenInhalt({ k }: { k: SortierKarte }) {
  if (k.bild) return <img src={asset(k.bild)} alt="" draggable={false} />;
  if (k.emoji) return <span class="karten-emoji" aria-hidden="true">{k.emoji}</span>;
  return <>{k.text}</>;
}

/** Karten in die passende Kiste oder den passenden Korb ziehen. */
export function Sortieren({ raetsel, helfer }: { raetsel: SortierRaetsel; helfer: RaetselHelfer }) {
  const karten = useMemo(() => mischen(raetsel.karten), [raetsel.id]);
  const [abgelegt, setAbgelegt] = useState<Record<string, string>>({}); // Karte -> Gruppe
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);
  const [leuchtet, setLeuchtet] = useState<string | null>(null); // Gruppe, die als Hilfe leuchtet
  const [wackelt, wackeln] = useWackeln();
  const fb = useFehler(helfer, raetsel.tipps[0]);

  const geloest = karten.every((k) => abgelegt[k.id]);

  const versuche = (kartenId: string, gruppe: string) => {
    const k = karten.find((x) => x.id === kartenId);
    if (!k || abgelegt[kartenId]) return;
    setGewaehlt(null);
    if (k.gruppe === gruppe) {
      const neu = { ...abgelegt, [kartenId]: gruppe };
      setAbgelegt(neu);
      setLeuchtet(null);
      if (!karten.every((x) => neu[x.id])) fb.richtig();
    } else {
      wackeln(`g${gruppe}`);
      if (fb.fehler(kartenId) >= 3) setLeuchtet(k.gruppe);
    }
  };

  const name = (k: SortierKarte) => k.text ?? k.id;

  return (
    <RaetselRahmen titel={raetsel.titel} aufgabe={raetsel.aufgabe} geloest={geloest} helfer={helfer} erfolgText={raetsel.erfolg}>
      <div class="kisten">
        {raetsel.gruppen.map((g) => (
          <button
            key={g.id}
            data-ziel={g.id}
            class={`kiste ${wackelt === `g${g.id}` ? 'wackeln' : ''} ${leuchtet === g.id ? 'leuchten' : ''} ${gewaehlt ? 'bereit' : ''}`}
            onClick={() => gewaehlt && versuche(gewaehlt, g.id)}
            aria-label={`Kiste ${g.name}`}
          >
            <span class="kiste-schild">{g.name}</span>
            <span class="kiste-inhalt">
              {karten
                .filter((k) => abgelegt[k.id] === g.id)
                .map((k) => (
                  <span key={k.id} class="mini-karte">
                    <KartenInhalt k={k} />
                  </span>
                ))}
            </span>
          </button>
        ))}
      </div>
      <div class="kartenstapel">
        {karten
          .filter((k) => !abgelegt[k.id])
          .map((k) => (
            <Ziehkarte
              key={k.id}
              class={k.bild || k.emoji ? 'bildkarte' : ''}
              label={name(k)}
              gewaehlt={gewaehlt === k.id}
              antippen={() => setGewaehlt(gewaehlt === k.id ? null : k.id)}
              ablegen={(ziel) => versuche(k.id, ziel)}
            >
              <KartenInhalt k={k} />
            </Ziehkarte>
          ))}
      </div>
    </RaetselRahmen>
  );
}
