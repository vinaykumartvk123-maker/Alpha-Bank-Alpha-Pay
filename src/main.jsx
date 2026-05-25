import { StrictMode } from "react";
import { createRoot  } from "react-dom/client";

import { AppProvider   } from "./store/AppContext";
import { RatesProvider } from "./store/RatesContext";
import App               from "./App";
import "./index.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root not found.");

createRoot(container).render(
  <StrictMode>
    {/* AppProvider: user auth, transactions, toasts, modals, dark mode */}
    <AppProvider>
      {/* RatesProvider: isolated live forex ticker — updates every 3s
          Kept separate so rate ticks don't re-render the entire auth tree */}
      <RatesProvider>
        <App />
      </RatesProvider>
    </AppProvider>
  </StrictMode>
);
