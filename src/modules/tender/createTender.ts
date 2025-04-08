import { Tender } from ".";
import { TenderModel } from "./schema";

/**
 * Create a new tender record
 * @param tender - Tender object
 * @returns Created tender
 */
export const createTender = async (tender: Tender) => {
  const newTender = await TenderModel.create(tender.toJSON());
  return new Tender(newTender.toObject());
};
