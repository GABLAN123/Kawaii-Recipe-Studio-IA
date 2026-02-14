
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("🚀 Iniciando Recipe Studio...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("❌ No se encontró el elemento root");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("✅ React montado con éxito");
  } catch (error) {
    console.error("❌ Error al montar la aplicación:", error);
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #ff6b6b; font-family: sans-serif;">
          <p>Hubo un error al iniciar la app. Por favor, recarga la página.</p>
          <small style="opacity: 0.5;">${error}</small>
        </div>
      `;
    }
  }
}
