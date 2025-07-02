import { ITenderNotice } from "./types";
import { TenderNoticeModel } from "./schema";

/**
 * Update a Tender Notice document by its ID.
 *
 * @param id - The ID of the Tender Notice to update.
 * @param update
 * @returns
 */
export const updateTenderNotice = async (
  id: string,
  update: Partial<ITenderNotice>
) => {
  return await TenderNoticeModel.findByIdAndUpdate(id, update, { new: true });
};
