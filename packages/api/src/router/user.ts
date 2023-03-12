import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

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
      if (input.userId) {
        if (ctx.user.role === "student" || ctx.user.role === "parent") {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Role is not permitted to view another user",
          });
        }
        return await ctx.prisma.user.findUnique({
          where: {
            id: input.userId,
          },
        });
      }
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
      if (ctx.user.role === "student") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Role is not permitted to change name",
        });
      }
      if (input.userId && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Role is not permitted to change another user's name",
        });
      }
      await ctx.prisma.user.update({
        where: {
          id: input.userId || ctx.user.id,
        },
        data: {
          name: input.name,
        },
      });
    }),

  // Set the email of a user

  // Get a list of all linked accounts for the user
  linkedAccounts: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(async ({ ctx }) => {
      const linked = {
        github: false,
        facebook: false,
        google: false,
      };
      const accounts = await ctx.prisma.account.findMany({
        where: {
          userId: ctx.user.id,
        },
      });
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
      if (ctx.user.role !== "admin" && input.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Role is not permitted to delete other's account",
        });
      }
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
      const deviceFound = await ctx.prisma.device.findFirst({
        where: {
          pushToken: input.device,
        },
      });

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
        }
      } else {
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
      const deviceFound = await ctx.prisma.device.findFirst({
        where: {
          pushToken: input.device,
        },
      });

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
      const deviceFound = await ctx.prisma.device.findFirst({
        where: {
          pushToken: input.device,
        },
      });
      if (deviceFound) {
        return true;
      }
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
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Role is not permitted to create pending users",
        });
      }
      await ctx.prisma.user.create({
        data: {
          email: input.email,
          ...(input.name ? { name: input.name } : {}),
          schoolId: ctx.user.schoolId,
          pending: true,
        },
      });
    }),
});
