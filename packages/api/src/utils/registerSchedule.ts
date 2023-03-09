export async function registerSchedule(
  time: Date,
  postId: string,
  destination: string,
) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Upstash-Content-Based-Deduplication", "true");
  myHeaders.append("Upstash-Retries", "0");
  myHeaders.append(
    "Upstash-Cron",
    `${time.getMinutes()} ${time.getHours()} ${time.getDate()} ${
      time.getMonth() + 1
    } ${time.getDay()}`,
  );

  return (
    (
      await fetch(
        `https://qstash.upstash.io/v1/publish/https://schoolconnect-mu.vercel.app/${destination}`,
        {
          method: "POST",
          body: `"${postId}"`,
          headers: myHeaders,
        },
      )
    ).status < 400
  );
}
