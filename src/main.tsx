import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './styles/fonts.css';
import './styles/app.css';
import { App } from './app/App';
import { requestReload } from './app/updateReload';

registerSW({ immediate: true, onNeedReload: requestReload });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
