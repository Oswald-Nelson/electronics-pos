import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './components/ToastProvider'

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </BrowserRouter>
);
