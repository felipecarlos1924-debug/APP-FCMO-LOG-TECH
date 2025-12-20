import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("FCMO LOG TECH: Iniciando montagem do sistema...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("FCMO LOG TECH: Erro fatal - Elemento raiz não encontrado no DOM.");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("FCMO LOG TECH: Sistema montado com sucesso.");
  } catch (err) {
    console.error("FCMO LOG TECH: Falha na renderização inicial:", err);
  }
}