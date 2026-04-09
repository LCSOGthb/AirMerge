import { createRoot } from "react-dom/client";
import React from "react";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import * as Sentry from "@sentry/react";

// Only enable PII sending if explicitly opted in via environment variable
const SENTRY_SEND_PII = process.env.REACT_APP_SENTRY_SEND_PII === "true";

Sentry.init({
  dsn: "https://ea94094f4f9d059f512a93c7d8ba3aca@o4509151884148736.ingest.us.sentry.io/4509826175401984",
  sendDefaultPii: SENTRY_SEND_PII,
});

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

reportWebVitals();
