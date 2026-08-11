import ImageKit from "@imagekit/nodejs";

import { config } from "../types/config.js";

/**
 * @description
 * Initialize the ImageKit client using the private API key.
 * This client is used to securely upload, manage, and delete
 * images from the ImageKit cloud storage service.
 */
const client = new ImageKit({
  privateKey: config.IMAGEKIT_PRIVATE_KEY,
});

interface UploadImageParams {
  buffer: Buffer;
  fileName: string;
  folder: string;
}

/**
 * @description
 * Upload an image to ImageKit cloud storage.
 * Converts the image buffer into a file, uploads it to the
 * specified folder, and returns the uploaded image details
 * such as URL, file ID, and metadata.
 */
export const uploadImage = async ({ buffer, fileName, folder = "Velnox" }: UploadImageParams) => {
  const result = await client.files.upload({
    file: await ImageKit.toFile(buffer),
    fileName,
    folder,
  });

  return result;
};
