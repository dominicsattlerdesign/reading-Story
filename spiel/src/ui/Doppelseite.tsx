import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Objekt, Raetsel, Seite } from '../inhalt/typen';
import type { Spielstand } from '../engine/speicher';
import { alleGeloest, ersteAktion, loese, merker, passenderTipp, wendeAn } from '../engine/logik';
import { asset, seiteMitId } from '../inhalt';
import { TextKarte } from './TextKarte';
import { Leiste } from './Leiste';
import { Halteknopf } from './Halteknopf';
import { Szene, blaseAn, type Blase } from './Szene';
import { Lueckentext } from './raetsel/Lueckentext';
import { Sortieren } from './raetsel/Sortieren';
import { Silben } from './raetsel/Silben';
import type { RaetselHelfer } from './raetsel/gemeinsam';

/** Eine aufgeschlagene Doppelseite: Szene zum Antippen, Text, Raetsel, Leiste. */
export function Doppelseite(props: {
  seite: Seite;
  stand: Spielstand;
  aendern: (f: (s: Spielstand) => Spielstand) => void;
  zurStartseite: () => void;
  oeffneEltern: () => void;
  weiterZu: (id: string) => void;
}) {
  const { seite, stand } = props;
  const m = useMemo(() => merker(stand, seite.id), [stand, seite.id]);

  const [offen, setOffen] = useState<{ raetsel: Raetsel; von: Objekt | null } | null>(null);
  const [blase, setBlase] = useState<Blase | null>(null);
  const [rabatBlase, setRabatBlase] = useState<string | null>(null);
  const [leuchtet, setLeuchtet] = useState<string | null>(null);
  const [ende, setEnde] = useState(false);
  const hilfeStufe = useRef(0);
  const uhren = useRef<Record<string, number>>({});

  useEffect(() => () => Object.values(uhren.current).forEach((u) => window.clearTimeout(u)), []);

  const spaeter = (name: string, ms: number, f: () => void) => {
    window.clearTimeout(uhren.current[name]);
    uhren.current[name] = window.setTimeout(f, ms);
  };

  const zeigeBlase = (b: Blase) => {
    setBlase(b);
    spaeter('blase', 6000, () => setBlase(null));
  };

  const rabatSagt = (text: string) => {
    setRabatBlase(text);
    spaeter('rabat', 6000, () => setRabatBlase(null));
  };

  const leuchten = (id: string) => {
    setLeuchtet(id);
    spaeter('leuchten', 4000, () => setLeuchtet(null));
  };

  const antippen = (o: Objekt) => {
    const a = ersteAktion(o.klick, m);
    if (!a) return;
    setRabatBlase(null); // alter Tipp passt nach einer Aktion oft nicht mehr
    props.aendern((s) => wendeAn(s, seite.id, a));
    const raetsel = a.raetsel ? seite.raetsel.find((r) => r.id === a.raetsel) : undefined;
    if (raetsel) {
      setBlase(null);
      hilfeStufe.current = 0;
      setOffen({ raetsel, von: o });
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
      if (raetsel.belohnung?.blase && von) zeigeBlase(blaseAn(von, raetsel.belohnung.blase));
    },
  };

  const geloestAnzahl = (stand.geloest[seite.id] ?? []).length;
  const fertig = alleGeloest(stand, seite);

  // sobald alles geloest ist, sagt Rabat Bescheid
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
    <div class="doppelseite aufblaettern">
      <img class="hintergrund" src={asset(seite.hintergrund)} alt={seite.titel} draggable={false} />
      <Szene objekte={seite.objekte} merker={m} leuchtet={leuchtet} antippen={antippen} blase={blase} blaseZu={() => setBlase(null)} />
      <div class="buchfalz" aria-hidden="true" />

      <button class="ecke-oben-links rund-knopf bild-knopf" onClick={props.zurStartseite} aria-label="Zum Buchdeckel">
        <img src={asset('gegenstaende/oberflaeche/haus')} alt="" draggable={false} />
      </button>
      <div class="seitenzahl">
        Seite {seite.nummer}
        {gefundeneBuchstaben.length > 0 && (
          <span class="buchstaben-leiste" aria-label="Gefundene Buchstaben">
            {gefundeneBuchstaben.map((b, i) => (
              <span key={i} class="buchstaben-kachel">{b}</span>
            ))}
          </span>
        )}
      </div>
      <Halteknopf class="ecke-oben-rechts bild-knopf" label="Elternbereich" ausloesen={props.oeffneEltern}>
        <img src={asset('gegenstaende/oberflaeche/einstellungen')} alt="" draggable={false} />
      </Halteknopf>

      <TextKarte text={seite.text} />

      {offen && helfer && offen.raetsel.typ === 'luecken' && <Lueckentext raetsel={offen.raetsel} helfer={helfer} />}
      {offen && helfer && offen.raetsel.typ === 'sortieren' && <Sortieren raetsel={offen.raetsel} helfer={helfer} />}
      {offen && helfer && offen.raetsel.typ === 'silben' && <Silben raetsel={offen.raetsel} helfer={helfer} />}

      <Leiste
        inventar={stand.inventar}
        lichter={0}
        raetsel={{ gesamt: seite.raetsel.length, geloest: geloestAnzahl }}
        rabatBlase={rabatBlase}
        rabatTippen={rabatTippen}
        blaseZu={() => setRabatBlase(null)}
        weiter={weiter}
      />

      {ende && (
        <div class="raetsel-hintergrund">
          <div class="erfolg-karte ende-karte">
            <div class="erfolg-sterne" aria-hidden="true">✦ ✧ ✦</div>
            <h2>Fortsetzung folgt …</h2>
            <p>Hier endet die Probeseite. Bald geht Idas Reise weiter!</p>
            <button class="gross-knopf primaer" onClick={props.zurStartseite}>
              Zum Buchdeckel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
