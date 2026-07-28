import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/nunito";
import "@fontsource-variable/noto-sans";
import "@fontsource-variable/roboto";
import { App } from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
