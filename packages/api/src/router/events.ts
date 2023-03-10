import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { type Class } from "@acme/db";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { registerSchedule } from "../utils/registerSchedule";

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

  // Creates an event, requires a name, description, start, and end
  // Also registers a QStash job to send a notification to all students
  create: protectedProcedure
    .input(
      z.object({
        token: z.string(),
        name: z.string().min(1),
        description: z.string().min(1),
        start: z.date(),
        end: z.date(),
        classId: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "teacher" && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be a teacher or admin to create an event",
        });
      }
      if (input.classId) {
        const classFound: Class | null = await ctx.prisma.class.findFirst({
          where: {
            id: input.classId,
          },
        });
        if (!classFound) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Class not found",
          });
        }
        if (classFound.schoolId !== ctx.user.schoolId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You can only create events for classes in your school",
          });
        }
        if (classFound.ownerId !== ctx.user.id) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You can only create events for classes you own",
          });
        }
      } else if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be an admin to create a school-wide event",
        });
      }
      const event = await ctx.prisma.event.create({
        data: {
          name: input.name,
          description: input.description,
          start: input.start,
          end: input.end,
          ...(input.classId
            ? {
                classId: input.classId,
              }
            : {
                schoolId: ctx.user.schoolId,
              }),
        },
      });

      await registerSchedule(input.start, input.name);

      return event;
    }),
});
