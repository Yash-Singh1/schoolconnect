import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { z } from "zod";

import { createTRPCRouter, ee, protectedProcedure } from "../trpc";
import { registerSchedule } from "../utils/registerSchedule";

export const eventsRouter = createTRPCRouter({
  // Gets all events sourced from the school and student's classes
  all: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
        take: z.number().int().min(0).optional(),
        upOnly: z.boolean().default(false),
        includeSource: z.boolean().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Query all events in the school
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
        include: {
          School: !!input.includeSource,
        },
      });

      // Query all events in the classes the user is in
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
        include: {
          Class: !!input.includeSource,
        },
        ...(input.take ? { take: input.take } : {}),
      });

      // Two pointers sorting, runs in O(n) without logarithmic factor
      // Here we combine the two sorted arrays into one sorted array
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

  onCreate: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
        classId: z.string().min(1).optional(),
        schoolId: z.string().min(1).optional(),
        userId: z.string().min(1).optional(),
      }),
    )
    .subscription(({ input }) => {
      let key = "";
      if (input.classId) {
        key = `class:${input.classId}`;
      } else if (input.schoolId) {
        key = `school:${input.schoolId}`;
      } else if (input.userId) {
        key = `user:${input.userId}`;
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You must provide a classId, schoolId, or userId",
        });
      }

      return observable<Event>((emit) => {
        void (async () => {
          const onEvent = (data: Event) => emit.next(data);
          const listener = await ee.on(`event:${key}`, onEvent);
          return () => {
            ee.off(listener);
          };
        })();
      });
    }),

  // Creates an event, requires a name, description, start, and end
  // Also registers a QStash job to send a notification to all students
  create: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
        title: z.string().min(1),
        content: z.string().min(1),
        start: z.date(),
        end: z.date(),
        classId: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Make sure user is a teacher or admin
      if (ctx.user.role !== "teacher" && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be a teacher or admin to create an event",
        });
      }

      const dbInput = {
        name: input.title,
        description: input.content,
        start: input.start,
        end: input.end,
        ...(input.classId
          ? {
              classId: input.classId,
            }
          : {
              schoolId: ctx.user.schoolId,
            }),
      };

      // Ensure the user is an admin if they are creating a school event
      if (input.classId) {
        // Make sure the class exists and the user owns it
        const classFound = await ctx.prisma.class.findFirst({
          where: {
            id: input.classId,
          },
          include: {
            members: {
              select: {
                id: true,
              },
            },
          },
        });

        // If the class doesn't exist, throw an error
        if (!classFound) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Class not found",
          });
        }

        // If the class isn't in the same school as the user, throw an error
        if (classFound.schoolId !== ctx.user.schoolId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You can only create events for classes in your school",
          });
        }

        // If the user doesn't own the class and they aren't admin, throw an error
        if (classFound.ownerId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You can only create events for classes you own",
          });
        }

        ee.emit(`event:class:${input.classId}`, dbInput);
        for (const member of classFound.members) {
          ee.emit(`event:user:${member.id}`, dbInput);
        }
      } else if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be an admin to create a school-wide event",
        });
      } else {
        const schoolFound = await ctx.prisma.school.findUnique({
          where: {
            id: ctx.user.schoolId,
          },
          include: {
            members: {
              select: {
                id: true,
              },
            },
          },
        });

        if (!schoolFound) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "School not found",
          });
        }

        ee.emit(`event:school:${ctx.user.schoolId}`, dbInput);
        for (const member of schoolFound.members) {
          ee.emit(`event:user:${member.id}`, dbInput);
        }
      }

      // Create the event in the database
      const event = await ctx.prisma.event.create({
        data: dbInput,
      });

      // Schedule notifications to be sent out when event starts
      const schedule = await registerSchedule(input.start, event.id);

      // If the schedule was successfully created, update the event with the schedule ID
      if ("scheduleId" in schedule) {
        await ctx.prisma.event.update({
          where: {
            id: event.id,
          },
          data: {
            scheduleId: schedule.scheduleId,
          },
        });
      }

      return event;
    }),
});
