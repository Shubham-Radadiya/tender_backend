import { TenderNoticeModel } from "./schema";
import { TenderNotice } from "./types";

/**
 * Create a new tenderNotice record
 * @param tenderNotice - TenderNotice object
 * @returns Created tenderNotice
 */
export const createTenderNotice = async (tenderNotice: TenderNotice) => {
  const newTenderNotice = await TenderNoticeModel.create(tenderNotice.toJSON());
  return new TenderNotice(newTenderNotice.toObject());
};
