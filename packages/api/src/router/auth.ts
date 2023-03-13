import { TRPCError } from "@trpc/server";
import * as bcrypt from "bcryptjs";
import { AuthorizationCode, type AccessToken } from "simple-oauth2";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
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
    redirect_uri: "exp://10.0.0.26:19000",
  });
  const userInfo = await getGitHubUser(
    accessToken.token.access_token as string,
  );

  return { userInfo, accessToken };
}

function generateNextSession() {
  return {
    sessionToken: [1, 2, 3]
      .map(() => Math.random().toString(36).substring(2, 15))
      .join(""),
    expires: new Date(new Date().setMonth(new Date().getMonth() + 12)),
  };
}

export const authRouter = createTRPCRouter({
  // testing protected procedure validation
  getSecretMessage: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(() => {
      return "you can see this secret message!";
    }),

  // Verification procedure, protected procedure does all the heavy lifting, so we just return true
  verify: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(() => {
      return true;
    }),

  // Signup mutation, creates user or account in database
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
      const { code, schoolId, role } = input;
      if (role === "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Admin account creation disabled within UI",
        });
      }

      const newSession = generateNextSession();

      if (input.email) {
        const userFound = await ctx.prisma.user.findFirst({
          where: {
            email: input.email,
          },
        });

        if (userFound) {
          if (userFound.password) {
            if (await bcrypt.compare(userFound.password, code)) {
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
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "User doesn't have password linked to account",
            });
          }
        } else {
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

      const { userInfo, accessToken } = await retrieveAuthToken(code);
      if (!userInfo.email) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No email found on GitHub account",
        });
      }

      let userFound = await ctx.prisma.user.findFirst({
        where: {
          email: userInfo.email,
        },
      });
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
        await ctx.prisma.session.create({
          data: {
            userId: accountFound.id,
            ...newSession,
          },
        });
      } else if (userFound) {
        const ghAccount = await ctx.prisma.account.findFirst({
          where: {
            userId: userFound.id,
            provider: "github",
          },
        });
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
        await ctx.prisma.session.create({
          data: {
            userId: userFound.id,
            ...newSession,
          },
        });
      }
      return newSession.sessionToken;
    }),

  // Login mutation, updates access token in database and searches for existing account
  login: publicProcedure
    .input(z.object({ code: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { code } = input;
      const { userInfo, accessToken } = await retrieveAuthToken(code);

      if (!userInfo.email) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No email found on GitHub account",
        });
      }

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

      const newSession = generateNextSession();

      if (userFound) {
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
        await ctx.prisma.session.create({
          data: {
            userId: userFound.id,
            ...newSession,
          },
        });
      } else {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Attempting to log into non-existent account",
        });
      }

      return newSession.sessionToken;
    }),
});
