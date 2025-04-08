import { Party } from ".";
import { PartyModel } from "./schema";

/**
 *
 * @param party
 * @returns update party record
 */
export const updateParty = async (party: Party) => {
  await PartyModel.findByIdAndUpdate(party._id, party.toJSON());
  return party;
};
