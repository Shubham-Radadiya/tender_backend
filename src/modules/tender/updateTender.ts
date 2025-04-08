import { Tender } from ".";
import { TenderModel } from "./schema";

/**
 *
 * @param tender
 * @returns update tender record
 */
export const updateTender = async (tender: Tender) => {
  await TenderModel.findByIdAndUpdate(tender._id, tender.toJSON());
  return tender;
};
