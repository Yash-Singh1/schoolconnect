import type { NextApiRequest, NextApiResponse } from "next";

function handler(_req: NextApiRequest, res: NextApiResponse<string>) {
  return res.json("pong");
}

export default handler;
