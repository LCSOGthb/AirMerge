import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://ea94094f4f9d059f512a93c7d8ba3aca@o4509151884148736.ingest.us.sentry.io/4509826175401984",
  sendDefaultPii: true
});

const container = document.getElementById("app");

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('No element with id "app" found in HTML.');
}

reportWebVitals();