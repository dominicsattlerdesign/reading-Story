import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Objekt, Raetsel, Seite } from '../inhalt/typen';
import type { Spielstand } from '../engine/speicher';
import { alleGeloest, ersteAktion, loese, merker, passenderTipp, wendeAn } from '../engine/logik';
import { asset, seiteMitId } from '../inhalt';
import { TextKarte } from './TextKarte';
import { Leiste } from './Leiste';
import { Halteknopf } from './Halteknopf';
import { MusikKnopf } from './MusikKnopf';
import { NeustartKnopf } from './NeustartKnopf';
import { Szene, blaseAn, type Blase } from './Szene';
import { Lueckentext } from './raetsel/Lueckentext';
import { Sortieren } from './raetsel/Sortieren';
import { Silben } from './raetsel/Silben';
import { Reihenfolge } from './raetsel/Reihenfolge';
import { Paare } from './raetsel/Paare';
import { Wortschlange } from './raetsel/Wortschlange';
import { FehlerFinden } from './raetsel/FehlerFinden';
import { Auswahl } from './raetsel/Auswahl';
import { Silbenbau } from './raetsel/Silbenbau';
import { Satzbau } from './raetsel/Satzbau';
import { Zauberwort } from './raetsel/Zauberwort';
import { Einfuehrung } from './Einfuehrung';
import type { RaetselHelfer } from './raetsel/gemeinsam';

/** Eine aufgeschlagene Doppelseite: Szene zum Antippen, Text, Raetsel, Leiste. */
export function Doppelseite(props: {
  seite: Seite;
  stand: Spielstand;
  aendern: (f: (s: Spielstand) => Spielstand) => void;
  zurStartseite: () => void;
  /** nach dem Schlussbild der letzten Seite: Schriftzug „Ende“, das Buch klappt zu */
  buchZu?: () => void;
  /** Einfuehrung zeigen (erster Start oder aus dem Elternbereich) */
  einfuehrung?: boolean;
  einfuehrungFertig?: () => void;
  oeffneEltern: () => void;
  weiterZu: (id: string) => void;
  /** Seite von vorne beginnen (Fortschritt dieser Seite weg) */
  neuStarten: () => void;
  /** eine Seite zurueckblaettern, fehlt auf der ersten Seite */
  zurueck?: () => void;
  /** waehrend umgeblaettert wird, sind die Figuren ausgeblendet (sonst saehe man sie nur halb) */
  blaettert?: boolean;
}) {
  const { seite, stand } = props;
  const m = useMemo(() => merker(stand, seite.id), [stand, seite.id]);

  const [offen, setOffen] = useState<{ raetsel: Raetsel; von: Objekt | null } | null>(null);
  const [blase, setBlase] = useState<Blase | null>(null);
  const [rabatBlase, setRabbatBlase] = useState<string | null>(null);
  const [leuchtet, setLeuchtet] = useState<string | null>(null);
  const [ende, setEnde] = useState(false);
  const [bildKarte, setBildKarte] = useState<{ bild: string; text?: string; buchstabe?: boolean } | null>(null);
  const hilfeStufe = useRef(0);
  const uhren = useRef<Record<string, number>>({});

  useEffect(() => () => Object.values(uhren.current).forEach((u) => window.clearTimeout(u)), []);

  // Nur beim Entwickeln: ?raetsel=id oeffnet das Raetsel dieser Seite sofort
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const id = new URLSearchParams(location.search).get('raetsel');
    const r = id ? seite.raetsel.find((x) => x.id === id) : undefined;
    if (r) setOffen({ raetsel: r, von: null });
  }, []);

  const spaeter = (name: string, ms: number, f: () => void) => {
    window.clearTimeout(uhren.current[name]);
    uhren.current[name] = window.setTimeout(f, ms);
  };

  const zeigeBlase = (b: Blase) => {
    setBlase(b);
  };

  const rabatSagt = (text: string) => {
    setRabbatBlase(text);
  };

  const leuchten = (id: string) => {
    setLeuchtet(id);
    spaeter('leuchten', 4000, () => setLeuchtet(null));
  };

  const antippen = (o: Objekt) => {
    const a = ersteAktion(o.klick, m);
    if (!a) return;
    setRabbatBlase(null); // alter Tipp passt nach einer Aktion oft nicht mehr
    props.aendern((s) => wendeAn(s, seite.id, a));
    const raetsel = a.raetsel ? seite.raetsel.find((r) => r.id === a.raetsel) : undefined;
    if (raetsel) {
      setBlase(null);
      hilfeStufe.current = 0;
      setOffen({ raetsel, von: o });
      return;
    }
    if (a.bild) {
      setBlase(null);
      setBildKarte({ bild: a.bild, text: a.blase, buchstabe: a.buchstabe });
      return;
    }
    if (a.blase) zeigeBlase(blaseAn(o, a.blase));
    else if (a.buchstabe) zeigeBlase(blaseAn(o, `Du hast ein leuchtendes ${seite.buchstabe} gefunden!`));
  };

  const rabatTippen = () => {
    if (offen) {
      const tipps = offen.raetsel.tipps;
      rabatSagt(tipps[Math.min(hilfeStufe.current, tipps.length - 1)]);
      hilfeStufe.current++;
      return;
    }
    const t = passenderTipp(seite.tipps, m);
    if (t) {
      rabatSagt(t.text);
      if (t.zeige) leuchten(t.zeige);
    }
  };

  const helfer: RaetselHelfer | null = offen && {
    rabat: rabatSagt,
    schliessen: () => setOffen(null),
    geschafft: () => {
      const { raetsel, von } = offen;
      setOffen(null);
      props.aendern((s) => {
        let neu = loese(s, seite.id, raetsel.id);
        if (raetsel.belohnung) neu = wendeAn(neu, seite.id, raetsel.belohnung);
        return neu;
      });
      // eine Belohnung mit Bild zeigt das Bild gross, der Text steht darunter
      if (raetsel.belohnung?.bild) setBildKarte({ bild: raetsel.belohnung.bild, text: raetsel.belohnung.blase, buchstabe: raetsel.belohnung.buchstabe });
      else if (raetsel.belohnung?.blase && von) zeigeBlase(blaseAn(von, raetsel.belohnung.blase));
    },
  };

  const geloestAnzahl = (stand.geloest[seite.id] ?? []).length;
  const fertig = alleGeloest(stand, seite);

  // sobald alles geloest ist, sagt Rabbat Bescheid
  const warFertig = useRef(fertig);
  useEffect(() => {
    if (fertig && !warFertig.current) spaeter('fertig', 1200, () => rabatSagt(seite.fertig));
    warFertig.current = fertig;
  }, [fertig]);

  const weiter = () => {
    if (seite.naechste && seiteMitId(seite.naechste)) props.weiterZu(seite.naechste);
    else setEnde(true);
  };

  const gefundeneBuchstaben = stand.buchstaben.map((id) => seiteMitId(id)?.buchstabe).filter(Boolean);

  return (
    <div class={`doppelseite aufblaettern ${seite.stimmung ? `stimmung-${seite.stimmung}` : ''} ${props.blaettert ? 'blaettert' : ''}`}>
      <img class="hintergrund" src={asset(seite.hintergrund)} alt={seite.titel} draggable={false} />
      <Szene objekte={seite.objekte} merker={m} leuchtet={leuchtet} antippen={antippen} blase={blase} blaseZu={() => setBlase(null)} />
      <div class="buchfalz" aria-hidden="true" />

      <button class="ecke-oben-links rund-knopf bild-knopf" onClick={props.zurStartseite} aria-label="Zum Buchdeckel">
        <img src={asset('gegenstaende/oberflaeche/haus')} alt="" draggable={false} />
      </button>
      <div class="seitenzahl">
        Seite {seite.nummer}
        {/* Seiten ohne eigenen Buchstaben (ab dem Zauberwort) zeigen nur die Seitenzahl */}
        {gefundeneBuchstaben.length > 0 && seite.buchstabe && (
          <span class="buchstaben-leiste" aria-label="Gefundene Buchstaben">
            {gefundeneBuchstaben.map((b, i) => (
              <span key={i} class="buchstaben-kachel">{b}</span>
            ))}
          </span>
        )}
      </div>
      <NeustartKnopf neuStarten={props.neuStarten} zurueck={props.zurueck} />
      <MusikKnopf />
      <Halteknopf class="ecke-oben-rechts bild-knopf" label="Elternbereich" ausloesen={props.oeffneEltern}>
        <img src={asset('gegenstaende/oberflaeche/einstellungen')} alt="" draggable={false} />
      </Halteknopf>

      <TextKarte text={seite.text} />

      {offen && helfer && offen.raetsel.typ === 'luecken' && <Lueckentext raetsel={offen.raetsel} helfer={helfer} />}
      {offen && helfer && offen.raetsel.typ === 'sortieren' && <Sortieren raetsel={offen.raetsel} helfer={helfer} />}
      {offen && helfer && offen.raetsel.typ === 'silben' && <Silben raetsel={offen.raetsel} helfer={helfer} />}
      {offen && helfer && offen.raetsel.typ === 'reihenfolge' && <Reihenfolge raetsel={offen.raetsel} helfer={helfer} />}
      {offen && helfer && (offen.raetsel.typ === 'paare' || offen.raetsel.typ === 'woerter') && <Paare raetsel={offen.raetsel} helfer={helfer} />}
      {offen && helfer && offen.raetsel.typ === 'silbenbau' && <Silbenbau raetsel={offen.raetsel} helfer={helfer} />}
      {offen && helfer && offen.raetsel.typ === 'zauberwort' && <Zauberwort raetsel={offen.raetsel} helfer={helfer} />}
      {offen && helfer && offen.raetsel.typ === 'satzbau' && <Satzbau raetsel={offen.raetsel} helfer={helfer} />}
      {offen && helfer && offen.raetsel.typ === 'auswahl' && <Auswahl raetsel={offen.raetsel} helfer={helfer} />}
      {offen && helfer && offen.raetsel.typ === 'fehler' && <FehlerFinden raetsel={offen.raetsel} helfer={helfer} />}
      {offen && helfer && offen.raetsel.typ === 'wortschlange' && <Wortschlange raetsel={offen.raetsel} helfer={helfer} />}

      {bildKarte && (
        <button class="bild-karte-hintergrund" onClick={() => setBildKarte(null)} aria-label="Bild schließen">
          <div class={`bild-karte ${bildKarte.buchstabe ? 'buchstabe-karte' : ''}`}>
            <img src={asset(bildKarte.bild)} alt="" draggable={false} />
            {bildKarte.text && <p>{bildKarte.text}</p>}
            <div class="bild-karte-hinweis">Tippen zum Schließen</div>
          </div>
        </button>
      )}

      <Leiste
        inventar={stand.inventar}
        lichter={0}
        raetsel={{ gesamt: seite.raetsel.length, geloest: geloestAnzahl }}
        rabatBlase={rabatBlase}
        rabatTippen={rabatTippen}
        blaseZu={() => setRabbatBlase(null)}
        weiter={weiter}
      />

      {props.einfuehrung && <Einfuehrung fertig={() => props.einfuehrungFertig?.()} />}

      {ende && (
        <div class="raetsel-hintergrund">
          <div class={`erfolg-karte ende-karte ${seite.schluss ? 'schluss' : ''}`}>
            <div class="erfolg-sterne" aria-hidden="true">✦ ✧ ✦</div>
            {seite.schluss ? (
              <>
                <img class="schluss-bild" src={asset(seite.schluss.bild)} alt="" draggable={false} />
                <p>{seite.schluss.text}</p>
              </>
            ) : (
              <>
                <h2>Fortsetzung folgt …</h2>
                <p>Weiter sind wir noch nicht. Bald geht Idas Reise weiter!</p>
              </>
            )}
            {seite.schluss && props.buchZu ? (
              <button class="gross-knopf primaer" onClick={props.buchZu}>
                Weiter
              </button>
            ) : (
              <button class="gross-knopf primaer" onClick={props.zurStartseite}>
                Zum Buchdeckel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
