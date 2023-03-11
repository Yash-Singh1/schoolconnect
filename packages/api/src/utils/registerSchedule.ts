// Schedule a QStash to publish notifications for an event at a specific time

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import "dayjs/locale/en";

dayjs.locale("en");
dayjs.extend(utc);
dayjs.extend(timezone);

type QStashResponse =
  | {
      scheduleId: string;
    }
  | {
      error: string;
    };

export async function registerSchedule(
  time: Date,
  postId: string,
): Promise<QStashResponse> {
  console.log("Registering schedule for", postId, "at", time);

  // QStash uses UTC time for cron jobs
  const dayTime = dayjs(time).utc();

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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await fetch(
    `https://qstash.upstash.io/v1/publish/https://schoolconnect-mu.vercel.app/api/qstash`,
    {
      method: "POST",
      body: `"${postId}"`,
      headers: myHeaders,
    },
  ).then((res) => res.json());
}
