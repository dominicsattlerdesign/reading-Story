import { useMemo, useState } from 'preact/hooks';
import type { PaareRaetsel, WoerterRaetsel } from '../../inhalt/typen';
import { mischen, verbinde } from '../../engine/logik';
import { RaetselRahmen, useFehler, useWackeln, type RaetselHelfer } from './gemeinsam';
import { Ziehkarte } from './Ziehkarte';

/**
 * Paare finden: Zu jedem festen Wort links gehoert ein Wort rechts (z. B. das Gegenteil).
 * Karte ziehen oder antippen, dann das Feld neben dem passenden Wort antippen.
 * Als "Woerter bauen" (typ woerter) werden die beiden Teile zu einem neuen Wort verbunden.
 */
export function Paare({ raetsel, helfer }: { raetsel: PaareRaetsel | WoerterRaetsel; helfer: RaetselHelfer }) {
  const bauen = raetsel.typ === 'woerter';
  const karten = useMemo(() => mischen(raetsel.paare.map(([, b], nr) => ({ id: `k${nr}`, nr, wort: b }))), [raetsel.id]);
  const [gefunden, setGefunden] = useState<boolean[]>(() => raetsel.paare.map(() => false));
  const [gewaehlt, setGewaehlt] = useState<string | null>(null);
  const [leuchtet, setLeuchtet] = useState<string | null>(null);
  const [wackelt, wackeln] = useWackeln();
  const fb = useFehler(helfer, raetsel.tipps[0]);

  const geloest = gefunden.every(Boolean);
  // lange Saetze links (z. B. Wer wohnt wo?) passen nicht auf die Strickdecke: dann als Liste mit den Karten darunter
  const saetze = raetsel.paare.some(([a]) => a.length > 14);

  const versuche = (kartenId: string, zeile: number) => {
    const k = karten.find((x) => x.id === kartenId);
    if (!k || gefunden[zeile] || gefunden[k.nr]) return;
    setGewaehlt(null);
    if (k.nr === zeile) {
      const neu = [...gefunden];
      neu[zeile] = true;
      setGefunden(neu);
      setLeuchtet(null);
      if (!neu.every(Boolean)) fb.richtig();
    } else {
      wackeln(`z${zeile}`);
      if (fb.fehler(`z${zeile}`) >= 3) setLeuchtet(`k${zeile}`);
    }
  };

  return (
    <RaetselRahmen titel={raetsel.titel} aufgabe={raetsel.aufgabe} geloest={geloest} helfer={helfer} erfolgText={raetsel.erfolg}>
      <div class={saetze ? 'paare saetze' : 'paare'}>
        <div class={saetze ? 'paare-liste' : bauen ? 'paare-decke koffer' : 'paare-decke'}>
          {raetsel.paare.map(([a, b], zeile) => (
            <div key={zeile} class="paar-zeile">
              <span class="paar-fest">{a}</span>
              <span class="paar-strich" aria-hidden="true">{bauen ? '+' : '–'}</span>
              <button
                data-ziel={`${zeile}`}
                class={`paar-feld ${gefunden[zeile] ? 'voll' : ''} ${wackelt === `z${zeile}` ? 'wackeln' : ''} ${gewaehlt && !gefunden[zeile] ? 'bereit' : ''}`}
                aria-label={gefunden[zeile] ? b : `Gegenstück zu ${a}`}
                onClick={() => gewaehlt && versuche(gewaehlt, zeile)}
              >
                {gefunden[zeile] ? b : ''}
              </button>
              {bauen && gefunden[zeile] && <span class="paar-ergebnis">= {verbinde(a, b)}</span>}
            </div>
          ))}
        </div>
        <div class="kartenstapel paare-karten">
          {karten.map((k) =>
            gefunden[k.nr] ? (
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
      </div>
    </RaetselRahmen>
  );
}
