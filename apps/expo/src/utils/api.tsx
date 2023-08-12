// Sets up the tRPC client for use in the app

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createTRPCProxyClient,
  createWSClient,
  httpBatchLink,
  splitLink,
  wsLink,
  type CreateTRPCClientOptions,
} from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";

import { type AppRouter } from "@acme/api";

/**
 * A set of typesafe hooks for consuming your API.
 */
export const api = createTRPCReact<AppRouter>();
export { type RouterInputs, type RouterOutputs } from "@acme/api";

export const getBaseUrl = (websocket = false) => {
  /**
   * Gets the IP address of your host-machine. If it cannot automatically find it,
   * you'll have to manually set it. NOTE: Port 3000 should work for most but confirm
   * you don't have anything else running on it, or you'd have to change it.
   */
  const localhostWs = "192.168.33.140";
  const localhostHttp = "192.168.33.140";
  const tunnel = false;

  console.log("Debugger host", localhostHttp);

  if (!localhostHttp) {
    return websocket
      ? "wss://schoolconnect-production.up.railway.app"
      : "https://schoolconnect-mu.vercel.app";
  }
  return `${websocket ? "ws" : tunnel ? "https" : "http"}://${
    websocket ? localhostWs : localhostHttp
  }${tunnel ? "" : websocket ? ":3001" : ":3000"}`;
};

const wsClient = createWSClient({
  url: getBaseUrl(/* websocket = */ true),
});

const clientConfiguration: CreateTRPCClientOptions<AppRouter> = {
  // superjson transformer allows data types such as Date to be serialized
  transformer: superjson,

  // The URL of the API (this is where the API is hosted)
  links: [
    splitLink({
      condition(op) {
        return op.type === "subscription";
      },
      true: wsLink({
        client: wsClient,
      }),
      false: httpBatchLink({
        url: `${getBaseUrl(/* websocket = */ false)}/api/trpc`,
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      }),
    }),
  ],
};

export const trpc = createTRPCProxyClient<AppRouter>(clientConfiguration);

/**
 * A wrapper for your app that provides the TRPC context.
 * Use only in _app.tsx
 */
export const TRPCProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [queryClient] = React.useState(() => new QueryClient());
  const [trpcClient] = React.useState(() =>
    api.createClient(clientConfiguration),
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
};
