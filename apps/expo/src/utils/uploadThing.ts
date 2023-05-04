import * as ImagePicker from "expo-image-picker";
import { genUploader } from "uploadthing/client";

import type { UploadRouterType } from "@acme/api";

import { getBaseUrl } from "./api";

const uploadFiles = genUploader<UploadRouterType>();

export const uploadThing = async (
  file: ImagePicker.ImagePickerSuccessResult,
) => {
  const fileName =
    file.assets[0]!.fileName ||
    file.assets[0]!.uri.split("/").pop() ||
    "image.jpeg";

  return (
    (
      await uploadFiles(
        [
          {
            uri: file.assets[0]!.uri,
            name: fileName,
            type: `image/${fileName.split(".").pop()}`,
          },
        ],
        "upload",
        {
          url: `${getBaseUrl(/* websocket = */ false)}/api/uploadthing`,
        },
      )
    )[0] as { fileUrl: string }
  ).fileUrl;
};
