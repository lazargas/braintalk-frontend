import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "@remix-run/react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/lib/integration/react.js";
import { store, persistor } from "./store";
import { AnimatePresence } from "framer-motion";

// Import CSS files as URLs, not as modules
import globalStylesUrl from "./styles/global.css?url";
import authStylesUrl from "./styles/auth.css?url";
import dashboardStylesUrl from "./styles/dashboard.css?url";

export function links() {
  return [
    { rel: "stylesheet", href: globalStylesUrl },
    { rel: "stylesheet", href: authStylesUrl },
    { rel: "stylesheet", href: dashboardStylesUrl },
  ];
}

// Simple loading component to show while Redux is rehydrating
function LoadingComponent() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#121212" /* Keep dark background for loading */,
        color: "#E0E0E0" /* Light text for dark background */,
      }}
    >
      <div
        style={{
          width: "50px",
          height: "50px",
          border: "5px solid #333333",
          borderTop: "5px solid #556B2F" /* Olive color for spinner */,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "20px",
        }}
      ></div>
      <h2>Loading Braintalk...</h2>
      <p>Please wait while we set things up</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Braintalk - Grok AI with Celebrity Voice TTS</title>
        <Meta />
        <Links />
      </head>
      <body>
        <Provider store={store}>
          {typeof window !== "undefined" && persistor ? (
            <PersistGate loading={<LoadingComponent />} persistor={persistor}>
              <AnimatePresence mode="wait">
                <Outlet key={location.pathname} />
              </AnimatePresence>
            </PersistGate>
          ) : (
            <AnimatePresence mode="wait">
              <Outlet key={location.pathname} />
            </AnimatePresence>
          )}
        </Provider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
