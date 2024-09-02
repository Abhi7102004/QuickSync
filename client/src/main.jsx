import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Toaster } from "sonner";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { SocketProvider } from "./context/SocketContext.jsx";
// import { store } from './utils/appStore.js'

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <Provider store={store}> */}
    {/* <PersistGate loading={null} persistor={persistor}> */}
    <SocketProvider>
      <App />
      <Toaster closeButton />
    </SocketProvider>
    {/* </PersistGate> */}
    {/*  </Provider> */}
  </StrictMode>
);
