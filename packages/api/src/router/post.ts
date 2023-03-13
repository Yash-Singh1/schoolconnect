import { Expo } from "expo-server-sdk";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
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
        include: {
          author: true,
        },
      });
      return posts;
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

      const receivingDevices = [
        ...(await ctx.prisma.device.findMany({
          where: {
            user: {
              classesIn: {
                some: {
                  id: classId,
                },
              },
            },
          },
        })),
        ...(await ctx.prisma.device.findMany({
          where: {
            userId: ctx.user.id,
          },
        })),
      ];

      const expo = new Expo();

      const messages = [];
      for (const receivingDevice of receivingDevices) {
        if (!Expo.isExpoPushToken(receivingDevice.pushToken)) {
          await ctx.prisma.device.delete({
            where: {
              id: receivingDevice.id,
            },
          });
          continue;
        }

        messages.push({
          to: receivingDevice.pushToken,
          sound: "default" as const,
          title: title,
          subtitle: `Sent by ${ctx.user.name}`,
          body: content,
        });
      }

      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];
      for (const chunk of chunks) {
        try {
          tickets.push(...(await expo.sendPushNotificationsAsync(chunk)));
        } catch (error) {
          console.error(error);
        }
      }
    }),
});
