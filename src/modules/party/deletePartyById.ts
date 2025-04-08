import { PartyModel } from "./schema";

/**
 * will delete party
 * @param _id
 */
export const deletePartyById = async (_id: string) => {
  await PartyModel.findByIdAndDelete(_id);
};
