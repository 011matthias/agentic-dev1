import { createRoot } from 'react-dom/client';
import App from './App';
import { MuteToggle } from './kernel';
import './styles.css';

// No StrictMode on purpose: it double-invokes effects in dev, which would
// double-fire the discussion timer and the measurement events.
// MuteToggle sits outside App so it stays mounted (and reachable) across every
// route, including mid-pass and reveal screens.
createRoot(document.getElementById('root')!).render(
  <>
    <MuteToggle />
    <App />
  </>,
);

// Register the service worker in production only. In dev it would cache the
// Vite HMR server and serve stale modules, so it stays off until a real build.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline support is a progressive enhancement; ignore failures */
    });
  });
}
