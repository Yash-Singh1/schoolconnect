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
      // Query all posts in the class
      const posts = await ctx.prisma.post.findMany({
        where: {
          // Filter by class if classId is provided
          classId: input.classId || {},

          // Filter by date if upOnly is true
          createdAt: input.upOnly
            ? {
                gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
              }
            : {},
        },

        // Take the specified amount of posts
        ...(input.take ? { take: input.take } : {}),

        // Order by date
        orderBy: {
          createdAt: "desc",
        },

        // Include the author
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
      // Destructure input
      const { classId, title, content, image } = input;
      
      // Upload image if provided
      let imageOutput = null;
      if (image) imageOutput = await uploadImage(image);

      // Create post in database
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

      // Send push notifications to all devices in the class
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

      // Initialize Expo client
      const expo = new Expo();

      // Prepare messages
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

      // Chunk messages and send
      // Tickets are the result, we don't need them
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
