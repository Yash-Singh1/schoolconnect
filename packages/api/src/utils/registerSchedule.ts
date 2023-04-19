// Schedule a QStash to publish notifications for an event at a specific time

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import "dayjs/locale/en";

// Initialize day.js for datetime formatting
dayjs.locale("en");
dayjs.extend(utc);
dayjs.extend(timezone);

// Typings for the response from the QStash API
type QStashResponse =
  | {
      scheduleId: string;
    }
  | {
      error: string;
    };

// Helper function to register a schedule with QStash
export async function registerSchedule(
  time: Date,
  postId: string,
): Promise<QStashResponse> {
  // Log the schedule registration
  console.log("Registering schedule for", postId, "at", time);

  // QStash uses UTC time for cron jobs
  const dayTime = dayjs(time).utc();

  // Create the headers for the request
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Upstash-Content-Based-Deduplication", "true");
  myHeaders.append("Upstash-Retries", "0");
  myHeaders.append("Authorization", `Bearer ${process.env.QSTASH_TOKEN}`);

  // Convert date to cron expression format
  myHeaders.append(
    "Upstash-Cron",
    `${dayTime.get("minutes")} ${dayTime.get("hours")} ${dayTime.get("date")} ${
      dayTime.get("month") + 1
    } *`,
  );

  // Return the response from the QStash API
  return await fetch(
    `https://qstash.upstash.io/v1/publish/https://schoolconnect-mu.vercel.app/api/qstash`,
    {
      method: "POST",
      body: `"${postId}"`,
      headers: myHeaders,
    },
  ).then((res) => res.json()) as QStashResponse;
}
