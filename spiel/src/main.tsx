import { render } from 'preact';
// nur der lateinische Zeichensatz (enthaelt ae, oe, ue, ss) – spart Ladezeit
import '@fontsource/andika/latin-400.css';
import '@fontsource/andika/latin-700.css';
import './styles.css';
import { App } from './App';

render(<App />, document.getElementById('app')!);
