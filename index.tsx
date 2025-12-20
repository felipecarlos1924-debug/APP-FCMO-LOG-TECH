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
    if (rootElement) {
      rootElement.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;">
        <h2>Erro ao carregar sistema</h2>
        <pre>${err instanceof Error ? err.message : String(err)}</pre>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">Recarregar</button>
      </div>`;
    }
  }
}