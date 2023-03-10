import { TRPCError } from "@trpc/server";
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

  // Edit the Social Media of a school
  editSocial: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
        social: z
          .string()
          .min(1)
          .regex(
            /^https:\/\/(www\.facebook\.com\/people\/.*?\/(\d)+?\/?|www\.instagram\.com\/.*?\/?|twitter\.com\/.*?\/?)(\?.*?)?(#.*?)?$/,
            {
              message: "Invalid Social Media URL. Note: Only Facebook, Instagram, and Twitter are supported."
            }
          ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { social } = input;
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Role is not permitted to edit social media",
        });
      }
      await ctx.prisma.school.update({
        where: {
          id: ctx.user.schoolId,
        },
        data: {
          social,
        },
      });
    }),
});
