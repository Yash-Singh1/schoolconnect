import { applyWSSHandler } from "@trpc/server/adapters/ws";
import ws from "ws";

import { appRouter, createTRPCContext } from "@acme/api";

const port = parseInt(process.env["PORT"] || "3001", 10);

const wss = new ws.Server({
  port,
});

const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext: createTRPCContext,
});

wss.on("connection", (ws) => {
  console.log(`++ Connection (${wss.clients.size})`);
  ws.once("close", () => {
    console.log(`-- Connection (${wss.clients.size})`);
  });
});
console.log(`✅ WebSocket Server listening on ws://localhost:${port}`);

process.on("SIGTERM", () => {
  console.log("SIGTERM");
  handler.broadcastReconnectNotification();
  wss.close();
});
