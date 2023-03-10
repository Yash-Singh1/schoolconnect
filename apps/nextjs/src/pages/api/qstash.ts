// Test handler for working with QStash scheduling

import type { NextApiRequest, NextApiResponse } from "next";
import { verifySignature } from "@upstash/qstash/nextjs";

function handler(req: NextApiRequest, res: NextApiResponse) {
  res.json({ message: req.body });
}

export default verifySignature(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
