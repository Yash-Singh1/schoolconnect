// Main file for setting up tRPC procedures and context

import { type IncomingMessage } from "node:http";
import { TRPCError, initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type NodeHTTPCreateContextFnOptions } from "@trpc/server/adapters/node-http";
import superjson from "superjson";
import type ws from "ws";
import { ZodError } from "zod";

import { prisma } from "@acme/db";

import { RedisEventEmitter } from "./utils/eventEmitter";

// Helper function for generating context
const createInnerTRPCContext = () => {
  return {
    prisma,
  };
};

/**
 * The context of a tRPC request is data that is available to all routes
 * We usually put in things like our database client, user session, etc. in here
 * This function initializes the context for each request
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = (
  _opts:
    | CreateNextContextOptions
    | NodeHTTPCreateContextFnOptions<IncomingMessage, ws>,
) => {
  return createInnerTRPCContext();
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthorized) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure;

// Type guard for checking if an object has a token property
function isTokened(input: unknown): input is { token: string } {
  return !!(
    input &&
    Object.hasOwn(input, "token") &&
    typeof (input as Record<string, unknown>).token === "string"
  );
}

/**
 * Reusable middleware that enforces users are logged in before running the procedure
 */
const enforceUserIsAuthed = t.middleware(async ({ ctx, next, rawInput }) => {
  if (!isTokened(rawInput)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Missing token parameter",
    });
  }
  const { token } = rawInput;

  const userFound = await ctx.prisma.user.findFirst({
    where: {
      sessions: {
        some: {
          sessionToken: token,
          expires: {
            gte: new Date(),
          },
        },
      },
    },
  });

  if (userFound) {
    await ctx.prisma.session.update({
      where: {
        sessionToken: token,
      },
      data: {
        expires: new Date(new Date().setMonth(new Date().getMonth() + 12)),
      },
    });

    return next({
      ctx: {
        ...ctx,
        user: userFound,
      },
    });
  }

  throw new TRPCError({
    code: "NOT_FOUND",
    message: "User not found in database",
  });
});

/**
 * Protected (authorized) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use
 * this.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

export const ee = new RedisEventEmitter();
