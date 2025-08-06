import { TenderParty } from ".";
import { TenderPartyModel } from "./schema";

/**
 *
 * @param party
 * @returns update party record
 */
export const updateTenderParty = async (party: TenderParty) => {
  await TenderPartyModel.findByIdAndUpdate(party._id, party.toJSON());
  return party;
};
