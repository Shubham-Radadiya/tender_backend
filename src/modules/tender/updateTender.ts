import { Tender } from ".";
import { TenderModel } from "./schema";
import { stripTenderName } from "./stripTenderName";

/**
 *
 * @param tender
 * @returns update tender record
 */
export const updateTender = async (tender: Tender) => {
  await TenderModel.findByIdAndUpdate(tender._id, {
    ...stripTenderName(tender.toJSON()),
    $unset: { name: "" },
  });
  return tender;
};
