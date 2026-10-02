import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
// Self-hosted Noto Sans. The vietnamese subset carries ẹ, ọ and the combining
// tone marks; latin-ext carries ṣ.
import '@fontsource/noto-sans/latin-400.css';
import '@fontsource/noto-sans/latin-ext-400.css';
import '@fontsource/noto-sans/vietnamese-400.css';
import '@fontsource/noto-sans/latin-600.css';
import '@fontsource/noto-sans/latin-ext-600.css';
import '@fontsource/noto-sans/vietnamese-600.css';
import '@fontsource/noto-sans/latin-700.css';
import '@fontsource/noto-sans/latin-ext-700.css';
import '@fontsource/noto-sans/vietnamese-700.css';
// Headings: Noto Serif Display. The weight file carries unicode-range for each
// subset, so only the subsets a page uses are downloaded.
import '@fontsource/noto-serif-display/600.css';
import './styles/app.css';
import { App } from './app/App';

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
