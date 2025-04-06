import { Image } from ".";
import { ImageModel } from "./schema";

/**
 * function for save image in database
 * @param image
 * @returns image itself
 */
export const saveImageToDb = async (image: Image) => {
  await new ImageModel(image.toJSON()).save();
  return image;
};
