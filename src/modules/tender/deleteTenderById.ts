import { TenderModel } from "./schema";

/**
 * will delete tender
 * @param _id
 */
export const deleteTenderById = async (_id: string) => {
  await TenderModel.findByIdAndDelete(_id);
};
