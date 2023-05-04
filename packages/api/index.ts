// Entry point file for the API

import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";

import { type AppRouter } from "./src/root";

export {
  appRouter,
  type AppRouter,
  UploadRouter,
  type UploadRouterType,
} from "./src/root";
export { createTRPCContext } from "./src/trpc";

/**
 * Inference helpers for input types
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;
