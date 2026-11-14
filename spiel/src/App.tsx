import { useEffect, useState } from 'preact/hooks';
import { Buehne } from './ui/Buehne';
import { Startseite } from './ui/Startseite';
import { Doppelseite } from './ui/Doppelseite';
import { Elternbereich } from './ui/Elternbereich';
import { laden, speichern, zuruecksetzen, hatFortschritt, neuerSpielstand, type Spielstand } from './engine/speicher';
import { vorleser } from './engine/vorlesen';
import { seiten, seiteMitId } from './inhalt';

type Ansicht = 'start' | 'buch';

export function App() {
  const [stand, setStand] = useState<Spielstand>(() => laden());
  const [ansicht, setAnsicht] = useState<Ansicht>('start');
  const [elternOffen, setElternOffen] = useState(false);

  // Einstellungen an den Vorleser weitergeben und jeden Stand sofort sichern
  useEffect(() => {
    vorleser.einstellen(stand.einstellungen.tempo, stand.einstellungen.stimme);
    speichern(stand);
  }, [stand]);

  const seite = seiteMitId(stand.seite) ?? seiten[0];

  const oeffne = (id: string) => {
    setStand((s) => ({ ...s, seite: id }));
    setAnsicht('buch');
  };

  return (
    <Buehne>
      {ansicht === 'start' ? (
        <Startseite
          kannWeiterlesen={hatFortschritt(stand)}
          weiterlesen={() => oeffne(seite.id)}
          vonVorne={() => {
            setStand((s) => ({ ...zuruecksetzen(s), seite: seiten[0].id }));
            setAnsicht('buch');
          }}
          oeffneEltern={() => setElternOffen(true)}
        />
      ) : (
        <Doppelseite
          key={seite.id}
          seite={seite}
          stand={stand}
          zurStartseite={() => {
            vorleser.stopp();
            setAnsicht('start');
          }}
          oeffneEltern={() => setElternOffen(true)}
        />
      )}
      {elternOffen && (
        <Elternbereich
          einstellungen={stand.einstellungen}
          aendern={(e) => setStand((s) => ({ ...s, einstellungen: { ...s.einstellungen, ...e } }))}
          fortschrittLoeschen={() => {
            setStand((s) => ({ ...neuerSpielstand(), einstellungen: s.einstellungen }));
            setAnsicht('start');
          }}
          schliessen={() => setElternOffen(false)}
        />
      )}
    </Buehne>
  );
}
