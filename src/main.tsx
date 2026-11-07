import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/figtree/400.css';
import '@fontsource/figtree/500.css';
import '@fontsource/figtree/600.css';
import '@fontsource/figtree/700.css';
import '@fontsource/figtree/800.css';
import '@fontsource/newsreader/400.css';
import '@fontsource/newsreader/500.css';
import '@fontsource/newsreader/400-italic.css';
import '@fontsource/amiri/arabic-400.css';
import '@fontsource/amiri/arabic-700.css';
import './styles.css';
import App from './App';
import Admin from './screens/Admin';

createRoot(document.getElementById('root')!).render(<StrictMode>{location.pathname.replace(/\/$/, '') === '/admin' ? <Admin /> : <App />}</StrictMode>);
