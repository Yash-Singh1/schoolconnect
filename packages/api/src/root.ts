// The root router, contains subrouters of all the different parts of the API

import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";

import { absenceRouter } from "./router/absence";
import { authRouter } from "./router/auth";
import { classRouter } from "./router/class";
import { eventsRouter } from "./router/events";
import { postRouter } from "./router/post";
import { schoolRouter } from "./router/school";
import { userRouter } from "./router/user";
import { createTRPCRouter } from "./trpc";

// Create the root router by combining all the subrouters
export const appRouter = createTRPCRouter({
  auth: authRouter,
  school: schoolRouter,
  user: userRouter,
  class: classRouter,
  post: postRouter,
  events: eventsRouter,
  absence: absenceRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

// UploadThing router
const f = createUploadthing();

export const UploadRouter = {
  upload: f.fileTypes(["image"]).maxSize("128MB").onUploadComplete(console.log),
} satisfies FileRouter;

export type UploadRouterType = typeof UploadRouter;
