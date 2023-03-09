// Test handler for working with QStash scheduling

import type { NextApiRequest, NextApiResponse } from "next";
import { verifySignature } from "@upstash/qstash/nextjs";

function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("api route hit");
  res.status(200).json({ name: "John Doe" });
}

export default verifySignature(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
