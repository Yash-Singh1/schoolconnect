// QStash handler for sending notifications on event

import type { NextApiRequest, NextApiResponse } from "next";
import { Expo } from "expo-server-sdk";
import { verifySignature } from "@upstash/qstash/nextjs";

import { prisma } from "@acme/db";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ error: string } | { success: true }>,
) {
  // Search for the event for which we are sending the notifications
  const eventId = req.body as string;
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
    },
  });

  // If the event exists, we delete the schedule to make sure it doesn't get triggered again
  if (event) {
    await fetch(`https://qstash.upstash.io/v1/schedules/${event.scheduleId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
      },
    });
  } else {
    // The event was not found, so we return with an error
    return res.status(404).json({ error: "Event not found" });
  }

  // Get all the devices of users in the school
  const receivingDevices = [
    ...(await prisma.device.findMany({
      where: {
        user: {
          schoolId: event.schoolId!,
        },
      },
    })),
  ];

  // Request information about the school
  const school = await prisma.school.findFirst({
    where: {
      id: event.schoolId!,
    },
    select: {
      name: true,
    },
  });

  // Initialize Expo client
  const expo = new Expo();

  // Push notifications to all devices
  const messages = [];
  for (const receivingDevice of receivingDevices) {
    // If the device has an invalid push token, we delete it
    if (!Expo.isExpoPushToken(receivingDevice.pushToken)) {
      await prisma.device.delete({
        where: {
          id: receivingDevice.id,
        },
      });
      continue;
    }

    // Otherwise, we push the message into the array
    messages.push({
      to: receivingDevice.pushToken,
      sound: "default" as const,
      title: event.name,
      subtitle: `Sent by ${school!.name}`,
      body: event.description,
    });
  }

  // The expo-server-sdk requires that we send the notifications in chunks
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  for (const chunk of chunks) {
    try {
      tickets.push(...(await expo.sendPushNotificationsAsync(chunk)));
    } catch (error) {
      console.error(error);
    }
  }

  // Return with success
  res.status(200).json({ success: true });
}

// The verifySignature middleware verifies that the request is coming from QStash
// This can prevent hackers from sending fake requests to ping notifications to your users
export default verifySignature(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
