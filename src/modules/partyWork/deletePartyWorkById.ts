import { PartyWorkModel } from "./schema";

/**
 * will delete partyWork
 * @param _id
 */
export const deletePartyWorkById = async (_id: string) => {
  await PartyWorkModel.findByIdAndDelete(_id);
};
