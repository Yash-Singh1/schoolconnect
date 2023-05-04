// Handler for uploading files to S3

import { createNextPageApiHandler } from "uploadthing/server";

import { UploadRouter } from "@acme/api/src/root";

// Hosting the router from the API interface

const handler = createNextPageApiHandler({
  router: UploadRouter,
});

export default handler;
