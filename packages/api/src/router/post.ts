import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getUserFromId } from "../utils/getUserFromId";
import { uploadImage } from "../utils/uploadImage";

export const postRouter = createTRPCRouter({
  // Gets all posts, allows taking specific amount and filtering by class
  all: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
        classId: z.string().min(1).optional(),
        take: z.number().int().min(0).optional(),
        upOnly: z.boolean().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      const posts = await ctx.prisma.post.findMany({
        ...(input.classId
          ? {
              where: {
                classId: input.classId,
              },
            }
          : {}),
        where: {
          classId: input.classId || {},
          createdAt: input.upOnly
            ? {
                gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
              }
            : {},
        },
        ...(input.take ? { take: input.take } : {}),
        orderBy: {
          createdAt: "desc",
        },
      });
      const authors = await Promise.all(
        posts.map((post) => getUserFromId(post.authorId, ctx)),
      );
      return posts.map((post, idx) => ({
        ...post,
        author: authors[idx]!,
      }));
    }),

  // Creates a post, requires a tittle, content, class, and image
  create: protectedProcedure
    .input(
      z.object({
        token: z.string().min(1),
        classId: z.string().min(1),
        title: z.string().min(1),
        content: z.string().min(1),
        image: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "teacher") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Role is not permitted to create posts",
        });
      }
      const { classId, title, content, image } = input;
      let imageOutput = null;
      if (image) imageOutput = await uploadImage(image);
      await ctx.prisma.post.create({
        data: {
          classId,
          createdAt: new Date(),
          title,
          content,
          authorId: ctx.user.id,
          ...(imageOutput ? { image: imageOutput.data.url } : {}),
        },
      });
    }),
});
