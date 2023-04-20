// Backend router for managing classes

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { type Class } from "@acme/db";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getUserFromId } from "../utils/getUserFromId";
import { uploadImage } from "../utils/uploadImage";

export const classRouter = createTRPCRouter({
  // Gets all classes for a certain user, entire school for admin
  all: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
      }),
    )
    .query(async ({ ctx }) => {
      let classes;

      // Different dependingn on role
      if (ctx.user.role === "student") {
        // For students get all classes they are in
        classes = await ctx.prisma.class.findMany({
          where: {
            schoolId: ctx.user.schoolId,
            members: {
              some: {
                id: ctx.user.id,
              },
            },
          },
          include: {
            owner: true,
          },
        });
      } else if (ctx.user.role === "teacher") {
        // For teachers get all classes they own
        classes = await ctx.prisma.class.findMany({
          where: {
            ownerId: ctx.user.id,
            schoolId: ctx.user.schoolId,
          },
          include: {
            owner: true,
          },
        });
      } else if (ctx.user.role === "admin") {
        // For admins get all classes in the school
        classes = await ctx.prisma.class.findMany({
          where: {
            schoolId: ctx.user.schoolId,
          },
          include: {
            owner: true,
          },
        });
      } else {
        // If not a student, teacher, or admin, throw an unauthorized error
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Role is not permitted to view classes",
        });
      }

      // Return the classes
      return classes;
    }),

  // Get a specific class by the class id
  get: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
        classId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Ensure that the user is a student, teacher, or admin
      if (
        ctx.user.role === "student" ||
        ctx.user.role === "teacher" ||
        ctx.user.role === "admin"
      ) {
        // Get the class
        const classFound: Class = (await ctx.prisma.class.findFirst({
          where: {
            id: input.classId,
          },
        })) as Class;

        // Return the class with the owner's name
        return {
          ...classFound,
          owner: (await getUserFromId(classFound.ownerId, ctx))!.name,
        };
      } else {
        // Otherwise throw an unauthorized error
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Role is not permitted to view classes",
        });
      }
    }),

  // Get the owner of a class
  getOwner: protectedProcedure
    .input(z.object({ token: z.string().min(1), classId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.user.findFirst({
        where: {
          classesOwned: {
            some: {
              id: input.classId,
            },
          },
        },
      });
    }),

  // Create a class, requires image, name, and description
  create: protectedProcedure
    .input(
      z.object({
        image: z.string().min(1),
        name: z.string().min(1),
        description: z.string().min(1),
        token: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role === "student" || ctx.user.role === "parent") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Role is not permitted to create classes",
        });
      }

      const { image, name, description } = input;

      const imageOutput = await uploadImage(image);

      const newClass = await ctx.prisma.class.create({
        data: {
          name,
          description,
          schoolId: ctx.user.schoolId,
          ownerId: ctx.user.id,
          banner: imageOutput.data.url,
        },
      });
      return newClass.id;
    }),
});
