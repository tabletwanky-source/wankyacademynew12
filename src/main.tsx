import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './i18n/config';
import App from './App.tsx';
import './index.css';

// Handle unhandled promise rejections and global errors to prevent crashes
window.addEventListener("unhandledrejection", (event) => {
  console.warn("Unhandled promise rejection:", event.reason);
});

window.addEventListener("error", (event) => {
  console.error("Global runtime error:", event.error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
