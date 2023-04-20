// Backend router for managing users

import { TRPCError } from "@trpc/server";
import * as bcrypt from "bcryptjs";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

// This router contains procedures related to user information
export const userRouter = createTRPCRouter({
  // Receives information on a user
  self: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
        userId: z.string().min(1).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // If a userId is provided, then we are viewing another user
      if (input.userId) {
        // Make sure user is staff
        if (ctx.user.role === "student" || ctx.user.role === "parent") {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Role is not permitted to view another user",
          });
        }

        // Give information on that user
        return await ctx.prisma.user.findUnique({
          where: {
            id: input.userId,
          },
        });
      }

      // Otherwise, we are looking for information on ourself
      return ctx.user;
    }),

  // Changes the name of the user
  setName: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
        name: z.string().min(3),
        userId: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Make sure user is not a student
      if (ctx.user.role === "student") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Role is not permitted to change name",
        });
      }

      // If a userId is provided, then we are changing another user's name
      // In this case, we need to make sure the user is admin
      if (input.userId && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Role is not permitted to change another user's name",
        });
      }

      // Change the name in the database
      await ctx.prisma.user.update({
        where: {
          id: input.userId || ctx.user.id,
        },
        data: {
          name: input.name,
        },
      });
    }),

  // Changes the password of the user
  setPassword: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Change the password in the database
      await ctx.prisma.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          password: await bcrypt.hash(input.password, 10),
        },
      });
    }),

  // Updates a user
  update: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
        userId: z.string().min(1),
        name: z.string().optional(),
        email: z.string().email().optional(),
        role: z.enum(["student", "teacher", "admin", "parent"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Make sure user is admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Role is not permitted to modify users",
        });
      }

      // Make sure user exists
      const userFound = await ctx.prisma.user.findUnique({
        where: {
          id: input.userId,
        },
      });

      // Throw error if user does not exist
      if (!userFound) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "The user you are trying to modify does not exist",
        });
      }

      // Update the user in the database
      await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          ...(input.name ? { name: input.name } : {}),
          /* We can't allow email modifications for users with accounts, as auth depends on the email */
          ...(input.email && userFound.pending ? { email: input.email } : {}),
          ...(input.role ? { role: input.role } : {}),
        },
      });
    }),

  // Get a list of all linked accounts for the user
  linkedAccounts: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(async ({ ctx }) => {
      // Initialize an object with all providers set to false
      const linked = {
        github: false,
        facebook: false,
        google: false,
      };

      // Get all accounts for the user
      const accounts = await ctx.prisma.account.findMany({
        where: {
          userId: ctx.user.id,
        },
      });

      // Set the providers to true if the user has an account for that provider
      for (const account of accounts) {
        linked[account.provider as keyof typeof linked] = true;
      }

      return linked;
    }),

  // Deletes the user
  delete: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
        userId: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Make sure user is admin if we are deleting another user
      if (ctx.user.role !== "admin" && input.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Role is not permitted to delete other's account",
        });
      }

      // Delete the user from the database
      // Effects are not cascaded, so we can have archives of deleted users
      await ctx.prisma.user.delete({
        where: {
          id: input.userId || ctx.user.id,
        },
      });
    }),

  // Registers a device for push notifications, unregisters previous users of device also
  registerDevice: protectedProcedure
    .input(z.object({ token: z.string().min(1), device: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Make sure device is not already registered to another user
      const deviceFound = await ctx.prisma.device.findFirst({
        where: {
          pushToken: input.device,
        },
      });

      // If device is already registered to another user, change registration to new user
      if (deviceFound) {
        if (deviceFound.userId !== ctx.user.id) {
          await ctx.prisma.device.update({
            where: {
              id: deviceFound.id,
            },
            data: {
              userId: ctx.user.id,
            },
          });
        } else {
          // If device is already registered to the user, do nothing
        }
      } else {
        // If device is not registered, register it
        await ctx.prisma.device.create({
          data: {
            pushToken: input.device,
            userId: ctx.user.id,
          },
        });
      }
    }),

  // Unregisters a device for push notifications
  unregisterDevice: protectedProcedure
    .input(z.object({ token: z.string().min(1), device: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Make sure device is registered to the user
      const deviceFound = await ctx.prisma.device.findFirst({
        where: {
          pushToken: input.device,
        },
      });

      // If device is registered to the user, unregister it from database
      if (deviceFound) {
        await ctx.prisma.device.delete({
          where: {
            id: deviceFound.id,
          },
        });
      }
    }),

  // Checks if a device is registered
  devicePresent: protectedProcedure
    .input(z.object({ token: z.string().min(1), device: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      // Make sure device is registered to the user
      const deviceFound = await ctx.prisma.device.findFirst({
        where: {
          pushToken: input.device,
        },
      });

      // If device is registered to the user, return true
      if (deviceFound) {
        return true;
      }

      // If device is not registered to the user, return false
      return false;
    }),

  // Creates a new pending user
  createPending: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
        email: z.string().email(),
        name: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Make sure user is admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Role is not permitted to create pending users",
        });
      }

      // Make sure user doesn't already exist
      const userFound = await ctx.prisma.user.findFirst({
        where: {
          email: input.email,
        },
      });
      if (userFound) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already exists",
        });
      }

      // Create the user in the database
      await ctx.prisma.user.create({
        data: {
          email: input.email,
          ...(input.name ? { name: input.name } : {}),
          schoolId: ctx.user.schoolId,
          pending: true,
        },
      });
    }),

  // This procedure gets the children of a user
  children: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
        userId: z.string().min(1).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Make sure user is admin if we are querying another user
      if (input.userId && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Role is not permitted to query children of another user",
        });
      }

      // Return the children of the user from the database
      return (
        await ctx.prisma.user.findUniqueOrThrow({
          where: {
            id: input.userId || ctx.user.id,
          },
          include: {
            children: true,
          },
        })
      ).children;
    }),

  // This procedure adds a user as a child of another user
  addChild: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
        userId: z.string().min(1),
        childEmail: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Make sure user is admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Role is not permitted to add children to another user",
        });
      }

      // Make sure child exists
      const child = await ctx.prisma.user.findUniqueOrThrow({
        where: {
          email: input.childEmail,
        },
      });

      // Update user in database to add child
      await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          children: {
            connect: {
              id: child.id,
            },
          },
        },
      });
    }),

  // This procedure removes a user as a child of another user
  removeChild: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
        childId: z.string().min(1),
        userId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Make sure user is admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Role is not permitted to remove children from another user",
        });
      }

      // Update user in database to remove child
      await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          children: {
            disconnect: {
              id: input.childId,
            },
          },
        },
      });
    }),
});
