import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { bootstrapDB } from './lib/db';
import { initEmailJS } from './services/emailService';

// Initialise EmailJS (idempotent — safe to call multiple times)
initEmailJS();

// Seed / restore demo data
bootstrapDB();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
