import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
// @ts-ignore
// [AI MOD] PWA SW disabled in dev to prevent stale cache
// import { registerSW } from 'virtual:pwa-register';

// if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
//   try {
//     registerSW({ immediate: true });
//   } catch (err) {
//     console.warn('Service worker registration failed:', err);
//   }
// }

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
