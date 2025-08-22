import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const container = document.getElementById('root')!;

// Create root only once to avoid HMR issues
const root = createRoot(container);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
