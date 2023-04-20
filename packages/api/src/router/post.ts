import { Expo } from "expo-server-sdk";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { z } from "zod";

import { type Post } from "@acme/db";

import { createTRPCRouter, ee, protectedProcedure } from "../trpc";
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

          ...(input.classId
            ? {}
            : {
                class: {
                  OR: [
                    {
                      ownerId: ctx.user.id,
                    },
                    {
                      members: {
                        some: {
                          id: ctx.user.id,
                        },
                      },
                    },
                  ],
                },
              }),
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

  onPost: protectedProcedure
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

      return observable<Post>((emit) => {
        void (async () => {
          const onPost = (data: Post) => emit.next(data);
          const listener = await ee.on(`post:${key}`, onPost);
          return () => {
            ee.off(listener);
          };
        })();
      });
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

      const classFound = await ctx.prisma.class.findUnique({
        where: {
          id: classId,
        },
        include: {
          members: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!classFound) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Class not found",
        });
      }

      // Upload image if provided
      let imageOutput = null;
      if (image) imageOutput = await uploadImage(image);

      const dbInput = {
        classId,
        createdAt: new Date(),
        title,
        content,
        authorId: ctx.user.id,
        ...(imageOutput ? { image: imageOutput.data.url } : {}),
      };

      // Create post in database
      const newPost = await ctx.prisma.post.create({
        data: dbInput,
      });

      ee.emit(`post:class:${classId}`, newPost);
      ee.emit(`post:school:${ctx.user.schoolId}`, newPost);
      ee.emit(`post:user:${ctx.user.id}`, newPost);
      for (const member of classFound.members) {
        ee.emit(`post:user:${member.id}`, newPost);
      }

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
