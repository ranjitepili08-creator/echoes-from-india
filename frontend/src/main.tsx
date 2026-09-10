import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 🔒 STRICT MOBILE VIEWPORT LOCK: Prevent Pinch-to-Zoom, Gesture Zoom, and Double-Tap Zoom
if (typeof document !== 'undefined') {
  // Prevent iOS Safari gesture zooming
  document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('gestureend', (e) => e.preventDefault(), { passive: false });

  // Prevent double-tap to zoom
  let lastTouchEndTime = 0;
  document.addEventListener(
    'touchend',
    (e) => {
      const now = Date.now();
      if (now - lastTouchEndTime <= 300) {
        e.preventDefault();
      }
      lastTouchEndTime = now;
    },
    { passive: false }
  );

  // Prevent Ctrl/Cmd + scroll wheel zoom on touchpads
  document.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    },
    { passive: false }
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
