import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const eventsRouter = createTRPCRouter({
  // Gets all events sourced from the school and student's classes
  all: protectedProcedure
    .input(
      z.object({
        token: z.string(),
        take: z.number().int().min(0).optional(),
        upOnly: z.boolean().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      const schoolEvents = await ctx.prisma.event.findMany({
        where: {
          schoolId: ctx.user.schoolId,
          end: input.upOnly
            ? {
                gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
              }
            : {},
        },
        orderBy: {
          start: "desc",
        },
        ...(input.take ? { take: input.take } : {}),
      });
      const classEvents = await ctx.prisma.event.findMany({
        where: {
          Class: {
            members: {
              some: {
                id: ctx.user.id,
              },
            },
          },
          end: input.upOnly
            ? {
                gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
              }
            : {},
        },
        orderBy: {
          start: "desc",
        },
        ...(input.take ? { take: input.take } : {}),
      });

      // Two pointers sorting, runs in O(n) without logarithmic factor
      const events = [];
      let classI = 0;
      for (let schoolI = 0; schoolI < schoolEvents.length; schoolI++) {
        while (
          classI < classEvents.length &&
          classEvents[classI]!.start.getTime() <
            schoolEvents[schoolI]!.start.getTime()
        ) {
          events.push(classEvents[classI]);
          classI++;
        }
        events.push(schoolEvents[schoolI]);
      }

      return events;
    }),
});
