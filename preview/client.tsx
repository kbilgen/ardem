import { hydrateRoot } from "react-dom/client";
import { App, type Route } from "./App";

declare global {
  interface Window {
    __ARDEM_ROUTE__: Route;
    __ARDEM_PREFIX__: string;
  }
}

hydrateRoot(document.getElementById("root")!, <App route={window.__ARDEM_ROUTE__} prefix={window.__ARDEM_PREFIX__ ?? ""} />);
