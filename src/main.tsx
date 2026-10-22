import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './styles/fonts.css';
import './styles/app.css';
import { App } from './app/App';
import { requestReload } from './app/updateReload';
import { trackEvent } from './lib/analytics';

registerSW({ immediate: true, onNeedReload: requestReload });
/** Report crashes (message only, cut short) so problems on real devices show up */
window.addEventListener('error', (e) => {
  trackEvent('js-error', { message: String(e.message).slice(0, 100) });
});
window.addEventListener('unhandledrejection', (e) => {
  trackEvent('js-error', { message: String(e.reason).slice(0, 100) });
});
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
