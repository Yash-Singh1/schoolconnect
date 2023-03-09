import { TRPCError, initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";

import { prisma } from "@acme/db";

import { getGitHubUser } from "./utils/getGitHubUser";

// Helper function for generating context
const createInnerTRPCContext = (req: CreateNextContextOptions["req"]) => {
  return {
    prisma,
    search: req.query,
    body: req.body,
  };
};

/**
 * The context of a tRPC request is data that is available to all routes
 * We usually put in things like our database client, user session, etc. in here
 * This function initializes the context for each request
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req } = opts;

  return createInnerTRPCContext(req);
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

function isTokened(input: unknown): input is { token: string } {
  return !!(
    input &&
    Object.hasOwn(input, "token") &&
    typeof (input as Record<string, unknown>).token === "string"
  );
}

/**
 * Reusable middleware that enforces users are logged in before running the procedure
 * TODO: Provider agnostic authentication, use custom auth token
 */
const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  let input;
  if (ctx.search["input"]) {
    input = (
      JSON.parse(ctx.search["input"] as string) as { 0: { json: unknown } }
    )[0].json;
    if (!isTokened(input)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Missing token parameter",
      });
    }
  } else {
    input = (ctx.body as { 0: { json: { token: string } } })[0].json;
  }
  const { token } = input;
  // MIGRATE: Switch token to custom auth token
  const userFound = await ctx.prisma.user.findFirst({
    where: {
      accounts: {
        some: {
          provider: "github",
          // access_token: token,
        },
      },
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
    return next({
      ctx: {
        ...ctx,
        user: userFound,
      },
    });
  }
  // if (userFound) {
  //   const userInfo = await getGitHubUser(token);
  //   if (userInfo.email) {
  //     return next({
  //       ctx: {
  //         ...ctx,
  //         user: userFound,
  //         github: userInfo,
  //       },
  //     });
  //   }
  //   throw new TRPCError({
  //     code: "UNAUTHORIZED",
  //     message: "GitHub email not found",
  //   });
  // }
  throw new TRPCError({
    code: "UNAUTHORIZED",
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
