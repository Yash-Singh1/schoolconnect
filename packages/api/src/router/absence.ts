import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const absenceRouter = createTRPCRouter({
  // Report an absence for a student
  reportAbsence: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
        userId: z.string().min(1),
        period: z.number().int().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "parent") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Role is not permitted to report absence",
        });
      }

      // See if the reported child is a child of the parent
      const parentReporting = await ctx.prisma.user.findFirst({
        where: {
          id: ctx.user.id,
          children: {
            some: {
              id: input.userId,
            },
          },
        },
      });

      if (!parentReporting) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Parent is not permitted to report absence for this student",
        });
      }

      await ctx.prisma.absence.create({
        data: {
          userId: ctx.user.id,
          date: new Date(),
          ...(input.period ? { period: input.period } : {}),
        },
      });
    }),

  // Gets all unapproved absences
  unapproved: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Role is not permitted to view unapproved absences",
        });
      }
      return await ctx.prisma.absence.findMany({
        where: {
          approvedSchool: false,
          user: {
            schoolId: ctx.user.schoolId,
          },
        },
      });
    }),

  // Approves an absence
  approve: protectedProcedure
    .input(z.object({ token: z.string().min(1), absenceId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Role is not permitted to approve absence",
        });
      }
      await ctx.prisma.absence.update({
        where: {
          id: input.absenceId,
        },
        data: {
          approvedSchool: true,
        },
      });
    }),
});
