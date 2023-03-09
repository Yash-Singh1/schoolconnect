import { authRouter } from "./router/auth";
import { classRouter } from "./router/class";
import { eventsRouter } from "./router/events";
import { postRouter } from "./router/post";
import { schoolRouter } from "./router/school";
import { userRouter } from "./router/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  school: schoolRouter,
  user: userRouter,
  class: classRouter,
  post: postRouter,
  events: eventsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
