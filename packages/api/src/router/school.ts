import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const schoolRouter = createTRPCRouter({
  // Gets all the schools in the database (for dropdown)
  all: publicProcedure.query(async ({ ctx }) => {
    const schools = await ctx.prisma.school.findMany({
      orderBy: { id: "asc" },
    });
    return schools;
  }),

  // Gets the school for the user
  get: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(async ({ ctx }) => {
      const school = await ctx.prisma.school.findUnique({
        where: {
          id: ctx.user.schoolId,
        },
      });
      return school;
    }),
});
