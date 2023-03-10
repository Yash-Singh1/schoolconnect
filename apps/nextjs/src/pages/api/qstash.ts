// Test handler for working with QStash scheduling

import type { NextApiRequest, NextApiResponse } from "next";
import { verifySignature } from "@upstash/qstash/nextjs";

import { appRouter } from "@acme/api";

function handler(req: NextApiRequest, res: NextApiResponse) {
  res.json({ message: "Hello World" });
}

export default verifySignature(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
