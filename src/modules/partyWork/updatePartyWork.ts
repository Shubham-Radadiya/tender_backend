import { PartyWork } from ".";
import { PartyWorkModel } from "./schema";

/**
 *
 * @param partyWork
 * @returns update partyWork record
 */
export const updatePartyWork = async (partyWork: PartyWork) => {
  await PartyWorkModel.findByIdAndUpdate(partyWork._id, partyWork.toJSON());
  return partyWork;
};
