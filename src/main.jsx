import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// PWA-ish caching: dramatically reduces repeated data usage on TV/tablet devices.
// After the first load, assets + images are served from the local Cache Storage.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Check for updated SW occasionally (best-effort)
        setInterval(() => {
          reg.update().catch(() => {});
        }, 60 * 60 * 1000);
      })
      .catch(() => {
        // ignore
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <App />
) 