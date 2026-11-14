import { useEffect, useState } from 'preact/hooks';
import { Buehne } from './ui/Buehne';
import { Startseite } from './ui/Startseite';
import { Doppelseite } from './ui/Doppelseite';
import { Elternbereich } from './ui/Elternbereich';
import { laden, speichern, hatFortschritt, neuerSpielstand, type Spielstand } from './engine/speicher';
import { seiten, seiteMitId } from './inhalt';

type Ansicht = 'start' | 'buch';

export function App() {
  const [stand, setStand] = useState<Spielstand>(() => laden());
  const [ansicht, setAnsicht] = useState<Ansicht>('start');
  const [elternOffen, setElternOffen] = useState(false);

  // jeden Stand sofort sichern
  useEffect(() => speichern(stand), [stand]);

  const seite = seiteMitId(stand.seite) ?? seiten[0];

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
      ) : (
        <Doppelseite
          key={seite.id}
          seite={seite}
          stand={stand}
          zurStartseite={() => setAnsicht('start')}
          oeffneEltern={() => setElternOffen(true)}
        />
      )}
      {elternOffen && (
        <Elternbereich
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
