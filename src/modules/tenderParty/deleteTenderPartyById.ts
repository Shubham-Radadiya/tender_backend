import { TenderPartyModel } from "./schema";

/**
 * will delete party
 * @param _id
 */
export const deleteTenderPartyById = async (_id: string) => {
  await TenderPartyModel.findByIdAndDelete(_id);
};
