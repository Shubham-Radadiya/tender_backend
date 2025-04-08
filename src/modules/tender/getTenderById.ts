import { Tender } from ".";
import { TenderModel } from "./schema";

/**
 *
 * @param _id tender id
 * @returns relevant tender record | null
 */
export const getTenderById = async (_id: string) => {
  const tender = await TenderModel.findById(_id);
  return tender ? new Tender(tender) : null;
};
