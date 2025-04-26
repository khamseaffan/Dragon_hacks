import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Auth0Provider } from "@auth0/auth0-react";
import credentials from "../credentials.json";

createRoot(document.getElementById("root")!).render(
  <Auth0Provider
    domain={credentials.domain}
    clientId={credentials.clientId}
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: credentials.audience,
    }}
  >
    <StrictMode>
      <App />
    </StrictMode>
  </Auth0Provider>
);
