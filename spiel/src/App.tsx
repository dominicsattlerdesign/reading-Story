import { useEffect, useState } from 'preact/hooks';
import { Buehne } from './ui/Buehne';
import { Startseite } from './ui/Startseite';
import { Doppelseite } from './ui/Doppelseite';
import { Buchende } from './ui/Buchende';
import { einfuehrungGesehen } from './ui/Einfuehrung';
import { Elternbereich } from './ui/Elternbereich';
import { Umblaettern } from './ui/Umblaettern';
import { Starttor } from './ui/Starttor';
import { musik } from './ui/musik';
import { laden, speichern, hatFortschritt, neuerSpielstand, type Spielstand } from './engine/speicher';
import { seiten, seiteMitId } from './inhalt';
import { seiteZuruecksetzen } from './engine/logik';

type Ansicht = 'start' | 'buch' | 'ende';

/** Nur beim Entwickeln: ?seite=s05&raetsel=kisten springt direkt zu einer Seite (und einem Raetsel) */
const testSeite = import.meta.env.DEV ? new URLSearchParams(location.search).get('seite') : null;

export function App() {
  const [stand, setStand] = useState<Spielstand>(() => (testSeite ? { ...laden(), seite: testSeite } : laden()));
  const [ansicht, setAnsicht] = useState<Ansicht>(testSeite ? 'buch' : 'start');
  const [elternOffen, setElternOffen] = useState(false);
  // Einfuehrung: beim allerersten Start auf der ersten Seite, oder wenn sie im Elternbereich gewuenscht wird
  const [einfuehrung, setEinfuehrung] = useState(() => !einfuehrungGesehen() && !testSeite);
  // laufendes Umblaettern: Hintergrund der alten und der neuen Doppelseite
  const [blatt, setBlatt] = useState<{ alt: string; neu: string; rueckwaerts?: boolean } | null>(null);
  // zaehlt hoch, wenn eine Seite neu gestartet wird: dann beginnt auch die Oberflaeche frisch (Text offen, keine Blasen)
  const [neustarts, setNeustarts] = useState(0);

  // jeden Stand sofort sichern
  useEffect(() => speichern(stand), [stand]);

  const seite = seiteMitId(stand.seite) ?? seiten[0];
  const vorige = seiten[seiten.indexOf(seite) - 1];
  // erst nach dem Start-Knopf darf der Browser Ton abspielen
  const [tor, setTor] = useState(!testSeite);

  // jede Szene hat ihre Musik; beim Umblaettern blendet sie weich zur naechsten ueber
  useEffect(() => musik.spiele(ansicht !== 'buch' ? 'titel_zuhause' : seite.musik ?? null), [ansicht, seite.id]);

  return (
    <Buehne>
      {ansicht === 'start' ? (
        <Startseite
          kannWeiterlesen={hatFortschritt(stand)}
          weiterlesen={() => setAnsicht('buch')}
          vonVorne={() => {
            setStand({ ...neuerSpielstand(), seite: seiten[0].id });
            setAnsicht('buch');
          }}
          oeffneEltern={() => setElternOffen(true)}
        />
      ) : ansicht === 'ende' ? (
        <Buchende zumAnfang={() => setAnsicht('start')} />
      ) : (
        <Doppelseite
          key={`${seite.id}-${neustarts}`}
          blaettert={!!blatt}
          seite={seite}
          stand={stand}
          aendern={setStand}
          zurStartseite={() => setAnsicht('start')}
          buchZu={() => setAnsicht('ende')}
          einfuehrung={einfuehrung && !blatt && (seite.id === seiten[0].id || einfuehrungGesehen())}
          einfuehrungFertig={() => setEinfuehrung(false)}
          oeffneEltern={() => setElternOffen(true)}
          weiterZu={(id) => {
            const neu = seiteMitId(id);
            if (neu) setBlatt({ alt: seite.hintergrund, neu: neu.hintergrund });
            setStand((s) => ({ ...s, seite: id }));
          }}
          neuStarten={() => {
            setStand((s) => seiteZuruecksetzen(s, seite));
            setNeustarts((n) => n + 1);
          }}
          zurueck={
            vorige &&
            (() => {
              setBlatt({ alt: seite.hintergrund, neu: vorige.hintergrund, rueckwaerts: true });
              setStand((s) => ({ ...s, seite: vorige.id }));
            })
          }
        />
      )}
      {ansicht === 'buch' && blatt && <Umblaettern key={blatt.neu} alt={blatt.alt} neu={blatt.neu} rueckwaerts={blatt.rueckwaerts} fertig={() => setBlatt(null)} />}
      {tor && (
        <Starttor
          start={() => {
            musik.entsperren();
            window.setTimeout(() => setTor(false), 700);
          }}
        />
      )}
      {elternOffen && (
        <Elternbereich
          einfuehrungZeigen={() => {
            setEinfuehrung(true);
            setAnsicht('buch');
          }}
          fortschrittLoeschen={() => {
            setStand(neuerSpielstand());
            setAnsicht('start');
          }}
          schliessen={() => setElternOffen(false)}
        />
      )}
    </Buehne>
  );
}
