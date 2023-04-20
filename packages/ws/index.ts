// Development server for websockets

import { applyWSSHandler } from "@trpc/server/adapters/ws";
import ws from "ws";

import { appRouter, createTRPCContext } from "@acme/api";

// See if a production port has been specified (fallback to 3001)
const port = parseInt(process.env["PORT"] || "3001", 10);

// Create WebSocket server
const wss = new ws.Server({
  port,
});

// Create WebSocket handler with tRPC
const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext: createTRPCContext,
});

// Log connections
wss.on("connection", (ws) => {
  console.log(`++ Connection (${wss.clients.size})`);
  ws.once("close", () => {
    console.log(`-- Connection (${wss.clients.size})`);
  });
});

// Log server start
console.log(`✅ WebSocket Server listening on ws://localhost:${port}`);

// Log server shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM");
  handler.broadcastReconnectNotification();
  wss.close();
});
