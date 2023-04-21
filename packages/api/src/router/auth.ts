// Backend router for managing authentication

import { TRPCError } from "@trpc/server";
import * as bcrypt from "bcryptjs";
import { AuthorizationCode, type AccessToken } from "simple-oauth2";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  weaklyProtectedProcedure,
} from "../trpc";
import { getGitHubUser } from "../utils/getGitHubUser";

// Retrieve authentication token given client-side temporary code
async function retrieveAuthToken(code: string) {
  // Configure API client
  const client = new AuthorizationCode({
    client: {
      id: process.env.GITHUB_CLIENT_ID!,
      secret: process.env.GITHUB_CLIENT_SECRET!,
    },
    auth: {
      tokenHost: "https://github.com",
      tokenPath: "/login/oauth/access_token",
      authorizePath: "/login/oauth/authorize",
    },
  });

  /**
   * Exchange temporary code for access token
   * @see https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#2-users-are-redirected-back-to-your-site-by-github
   */
  const accessToken: AccessToken = await client.getToken({
    code,
    redirect_uri: "exp://10.0.0.62:19000",
  });

  const userInfo = await getGitHubUser(
    accessToken.token.access_token as string,
  );

  return { userInfo, accessToken };
}

// Generate a new session token using random strings
function generateNextSession() {
  return {
    // Generate random string
    sessionToken: [1, 2, 3]
      .map(() => Math.random().toString(36).substring(2, 15))
      .join(""),

    // Set the expiry to 1 year from now
    expires: new Date(new Date().setMonth(new Date().getMonth() + 12)),
  };
}

// Router for authentication realated procedures
export const authRouter = createTRPCRouter({
  // Testing protected procedure validation
  getSecretMessage: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(() => {
      return "You can see this secret message only if you are authenticated!";
    }),

  // Verification procedure, protected procedure does all the heavy lifting, so we just return true
  verify: weaklyProtectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(({ ctx }) => {
      return ctx.user;
    }),

  // Signup mutation, creates user or account in database
  // If the user already exists this procedure will log the user in
  signup: publicProcedure
    .input(
      z.object({
        state: z.string().min(1),
        code: z.string().min(1),
        schoolId: z.string().min(1),
        role: z.enum(["student", "teacher", "admin", "parent"]),
        email: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Destructure input
      const { code, schoolId, role } = input;

      // If the role is admin, throw an error as admin accounts cannot be created through the UI
      if (role === "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Admin account creation disabled within UI",
        });
      }

      // Generate a new session
      const newSession = generateNextSession();

      // If the user has an email, check if the email is already in use
      if (input.email) {
        // Retrieve first user in database with that email
        const userFound = await ctx.prisma.user.findFirst({
          where: {
            email: input.email,
          },
        });

        // If a match was found
        if (userFound) {
          // If the user has a password, check if the password matches and login
          if (userFound.password) {
            if (await bcrypt.compare(code, userFound.password)) {
              await ctx.prisma.session.create({
                data: {
                  ...newSession,
                  userId: userFound.id,
                },
              });
              return newSession.sessionToken;
            } else {
              throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Invalid password",
              });
            }
          } else {
            // If the user doesn't have a password, throw an error
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "User doesn't have password linked to account",
            });
          }
        } else {
          // If no match was found, create a new user with the email and password
          await ctx.prisma.user.create({
            data: {
              name: "Anonymous",
              email: input.email,
              password: await bcrypt.hash(code, 10),
              role: "student",
              schoolId,
              sessions: {
                create: {
                  ...newSession,
                },
              },
            },
          });

          return newSession.sessionToken;
        }
      }

      // Retrieve user info from GitHub
      const { userInfo, accessToken } = await retrieveAuthToken(code);

      // Ensure the user has an email linked to their GitHub account
      if (!userInfo.email) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No email found on GitHub account",
        });
      }

      // Check if the user already exists in the database
      let userFound = await ctx.prisma.user.findFirst({
        where: {
          email: userInfo.email,
        },
      });

      // Check if the user already has an account linked to their GitHub account
      const accountFound = await ctx.prisma.user.findFirst({
        where: {
          accounts: {
            some: {
              provider: "github",
              providerAccountId: userInfo.id.toString(),
            },
          },
        },
      });

      // If the user doesn't exist, create a new user
      if (!userFound && !accountFound) {
        userFound = await ctx.prisma.user.create({
          data: {
            email: userInfo.email,
            name: userInfo.name || "",
            accounts: {
              create: {
                type: "github",
                provider: "github",
                providerAccountId: userInfo.id.toString(),
                access_token: accessToken.token.access_token as string,
                scope: "user",
              },
            },
            sessions: {
              create: {
                ...newSession,
              },
            },
            role,
            schoolId,
          },
        });
      } else if (accountFound) {
        // If we found a user with an account linked to their GitHub account add a new session
        await ctx.prisma.session.create({
          data: {
            userId: accountFound.id,
            ...newSession,
          },
        });
      } else if (userFound) {
        // If we found a user with the same email, add a new session and link their GitHub account

        // Find matches for the GitHub account in the database
        const ghAccount = await ctx.prisma.account.findFirst({
          where: {
            userId: userFound.id,
            provider: "github",
          },
        });

        // If a match was found, update the access token
        if (ghAccount) {
          await ctx.prisma.account.update({
            where: {
              id: ghAccount.id,
            },
            data: {
              access_token: accessToken.token.access_token as string,
            },
          });
        } else {
          // If no match was found, link to a new GitHub account
          await ctx.prisma.user.update({
            where: {
              email: userInfo.email,
            },
            data: {
              accounts: {
                create: {
                  type: "github",
                  provider: "github",
                  providerAccountId: userInfo.id.toString(),
                  access_token: accessToken.token.access_token as string,
                  scope: "user",
                },
              },
              name: userFound.name || userInfo.name || "",
            },
          });
        }

        // Add a new session
        await ctx.prisma.session.create({
          data: {
            userId: userFound.id,
            ...newSession,
          },
        });
      }

      // Return the session token
      return newSession.sessionToken;
    }),

  // Login mutation, updates access token in database and searches for existing account
  login: publicProcedure
    .input(
      z.object({
        code: z.string().min(1),
        email: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Destructure code from input
      const { code } = input;

      // Generate a new session
      const newSession = generateNextSession();

      // If the user provided an email while loggin in
      if (input.email) {
        // Find a match for the email in the database
        const userFound = await ctx.prisma.user.findFirst({
          where: {
            email: input.email,
          },
        });

        // If no match was found, throw an error
        if (!userFound) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // If the user has a password, check if the password is correct
        if (userFound.password) {
          // If the password is correct, add a new session
          if (await bcrypt.compare(code, userFound.password)) {
            await ctx.prisma.session.create({
              data: {
                ...newSession,
                userId: userFound.id,
              },
            });

            return newSession.sessionToken;
          } else {
            // If the password is incorrect, throw an error
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Invalid password",
            });
          }
        } else {
          // If the user doesn't have a password, throw an error, because they can't login with a password
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User doesn't have password linked to account",
          });
        }
      }

      // Retrieve user info from GitHub
      const { userInfo, accessToken } = await retrieveAuthToken(code);

      // Ensure the user has an email linked to their GitHub account
      if (!userInfo.email) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No email found on GitHub account",
        });
      }

      // Find a match for the GitHub account in the database
      const userFound = await ctx.prisma.user.findFirst({
        where: {
          accounts: {
            some: {
              provider: "github",
              providerAccountId: userInfo.id.toString(),
            },
          },
        },
      });

      // If a match was found, update the access token and add a new session
      if (userFound) {
        // If the user is pending, set pending to false
        if (userFound.pending) {
          await ctx.prisma.user.update({
            where: {
              id: userFound.id,
            },
            data: {
              pending: false,
            },
          });
        }

        // Update the access token
        await ctx.prisma.account.update({
          where: {
            provider_providerAccountId: {
              provider: "github",
              providerAccountId: userInfo.id.toString(),
            },
          },
          data: {
            access_token: accessToken.token.access_token as string,
          },
        });

        // Add a new session
        await ctx.prisma.session.create({
          data: {
            userId: userFound.id,
            ...newSession,
          },
        });
      } else {
        // If no match was found, throw an error
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Attempting to log into non-existent account",
        });
      }

      // Return the session token
      return newSession.sessionToken;
    }),
});
