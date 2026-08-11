import ImageKit from "@imagekit/nodejs";

import { config } from "../types/config.js";

const client = new ImageKit({
  privateKey: config.IMAGEKIT_PRIVATE_KEY,
});

interface UploadImageParams {
  buffer: Buffer;
  fileName: string;
  folder: string;
}

export const uploadImage = async ({ buffer, fileName, folder = "Velnox" }: UploadImageParams) => {
  const result = await client.files.upload({
    file: await ImageKit.toFile(buffer),
    fileName,
    folder,
  });

  return result;
};
