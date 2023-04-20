// Backend router for managing schools

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const schoolRouter = createTRPCRouter({
  // Gets all the schools in the database (for dropdown)
  all: publicProcedure.query(async ({ ctx }) => {
    // Recieve all the schools in the database
    const schools = await ctx.prisma.school.findMany({
      orderBy: { id: "asc" },
    });

    return schools;
  }),

  // Gets the school for the user
  get: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(async ({ ctx }) => {
      // Get information on the user's school
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
          // Regex to check if the URL is valid
          .regex(
            /^https:\/\/(www\.facebook\.com\/people\/.*?\/(\d)+?\/?|www\.instagram\.com\/.*?\/?|twitter\.com\/.*?\/?)(\?.*?)?(#.*?)?$/,
            {
              message:
                "Invalid Social Media URL. Note: Only Facebook, Instagram, and Twitter are supported.",
            },
          ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { social } = input;

      // Check if the user is an admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Role is not permitted to edit social media",
        });
      }

      // Update the school's social media on the database
      await ctx.prisma.school.update({
        where: {
          id: ctx.user.schoolId,
        },
        data: {
          social,
        },
      });
    }),

  // Pending members of a school
  pending: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(async ({ ctx }) => {
      // Check if the user is an admin
      if (ctx.user.role === "admin") {
        // Get all the pending members of the school
        return await ctx.prisma.user.findMany({
          where: {
            schoolId: ctx.user.schoolId,
            pending: true,
          },
        });
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Role is not permitted to view pending members",
        });
      }
    }),

  // Invited members of a school
  invited: protectedProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(async ({ ctx }) => {
      // Check if the user is an admin
      if (ctx.user.role === "admin") {
        // Get all the invited members of the school
        return await ctx.prisma.user.findMany({
          where: {
            schoolId: ctx.user.schoolId,
            pending: false,
          },
        });
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Role is not permitted to view invited members",
        });
      }
    }),
});
