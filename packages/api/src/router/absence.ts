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
        dateTill: z.date(),
        reason: z.string().min(1).optional(),
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
          dateTill: input.dateTill,
          ...(input.reason ? { reason: input.reason } : {}),
        },
      });
    }),
});
