import { Image } from ".";
import { ImageModel } from "./schema";

/**
 *
 * @param _id
 * @returns relevant image
 */
export const getImageById = async (_id: string) => {
  const image = await ImageModel.findById(_id);
  return image ? new Image(image) : null;
};
