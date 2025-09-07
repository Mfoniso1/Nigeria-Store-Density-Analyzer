import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 🔑 Check the API key from Vercel/Vite
console.log("Google API Key (from Vite env):", import.meta.env.VITE_GOOGLE_API_KEY);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
