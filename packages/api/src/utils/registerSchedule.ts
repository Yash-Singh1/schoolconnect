import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import "dayjs/locale/en";

dayjs.locale("en");
dayjs.extend(utc);
dayjs.extend(timezone);

export async function registerSchedule(
  time: Date,
  postId: string,
) {
  // QStash uses UTC time for cron jobs
  time = dayjs(time).utc().toDate();

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Upstash-Content-Based-Deduplication", "true");
  myHeaders.append("Upstash-Retries", "0");
  // TODO: Authentication token

  // Convert date to cron expression format
  myHeaders.append(
    "Upstash-Cron",
    `${time.getMinutes()} ${time.getHours()} ${time.getDate()} ${
      time.getMonth() + 1
    } *`,
  );

  return (
    (
      await fetch(
        `https://qstash.upstash.io/v1/publish/https://schoolconnect-mu.vercel.app/https://schoolconnect-mu.vercel.app/api/qstash`,
        {
          method: "POST",
          body: `"${postId}"`,
          headers: myHeaders,
        },
      )
    ).status < 400
  );
}
