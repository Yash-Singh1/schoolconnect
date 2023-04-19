// Typings for the response from the Imgbb API
interface ImageData {
  id: string;
  title: string;
  url_viewer: string;
  url: string;
  display_url: string;
  width: string;
  height: string;
  size: string;
  time: string;
  expiration: string;
  image: {
    filename: string;
    name: string;
    mime: string;
    extension: string;
    url: string;
  };
  thumb: {
    filename: string;
    name: string;
    mime: string;
    extension: string;
    url: string;
  };
  medium: {
    filename: string;
    name: string;
    mime: string;
    extension: string;
    url: string;
  };
  delete_url: string;
}

export interface ImgbbApiResponse {
  data: ImageData;
  success: boolean;
  status: number;
}

/**
 * Uploads an image to imgbb.com
 * Makes use of base64 encoded images, as that is easiest to transfer over API
 * @see https://api.imgbb.com/
 * TODO: Error validation for promise rejection and response status
 */
export async function uploadImage(image: string) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  const urlencoded = new URLSearchParams();
  urlencoded.append("image", image);

  const imageOutput: ImgbbApiResponse = (await (
    await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
        redirect: "follow",
      },
    )
  ).json()) as ImgbbApiResponse;

  return imageOutput;
}
