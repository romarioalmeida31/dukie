'use client';

import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from '../src/App';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="app-loading" aria-label="Carregando Dukie" />;
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
