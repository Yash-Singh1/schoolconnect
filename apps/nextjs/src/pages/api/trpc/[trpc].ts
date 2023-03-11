// Define the backend API handler for tRPC
// Note: We are using the Next.js API Routes to host the backend for the mobile app

import { createNextApiHandler } from "@trpc/server/adapters/next";

import { appRouter, createTRPCContext } from "@acme/api";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
});
