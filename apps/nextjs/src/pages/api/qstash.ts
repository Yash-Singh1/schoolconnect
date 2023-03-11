// Test handler for working with QStash scheduling

import type { NextApiRequest, NextApiResponse } from "next";
import { Expo } from "expo-server-sdk";
import { verifySignature } from "@upstash/qstash/nextjs";

import { prisma } from "@acme/db";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ error: string } | { success: true }>,
) {
  const eventId = req.body as string;
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
    },
  });

  if (event) {
    await fetch(`https://qstash.upstash.io/v1/schedules/${event.scheduleId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
      },
    });
  } else {
    return res.status(404).json({ error: "Event not found" });
  }

  const receivingDevices = [
    ...(await prisma.device.findMany({
      where: {
        user: {
          schoolId: event.schoolId!,
        },
      },
    })),
  ];

  const school = await prisma.school.findFirst({
    where: {
      id: event.schoolId!,
    },
    select: {
      name: true,
    },
  });

  const expo = new Expo();

  const messages = [];
  for (const receivingDevice of receivingDevices) {
    if (!Expo.isExpoPushToken(receivingDevice.pushToken)) {
      await prisma.device.delete({
        where: {
          id: receivingDevice.id,
        },
      });
      continue;
    }

    messages.push({
      to: receivingDevice.pushToken,
      sound: "default" as const,
      title: event.name,
      subtitle: `Sent by ${school!.name}`,
      body: event.description,
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

  res.status(200).json({ success: true });
}

export default verifySignature(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
