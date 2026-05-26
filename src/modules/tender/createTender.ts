import { Tender } from ".";
import { TenderModel } from "./schema";
import { stripTenderName } from "./stripTenderName";

/**
 * Create a new tender record
 * @param tender - Tender object
 * @returns Created tender
 */
export const createTender = async (tender: Tender) => {
  const newTender = await TenderModel.create(stripTenderName(tender.toJSON()));
  return new Tender(newTender.toObject());
};
