import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Toaster } from "sonner";
import { SocketProvider } from "./context/SocketContext.jsx";
import { WebRTCProvider } from "./context/WebRTCContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SocketProvider>
      <WebRTCProvider>
        <App />
        <Toaster closeButton />
      </WebRTCProvider>
    </SocketProvider>
  </StrictMode>
);