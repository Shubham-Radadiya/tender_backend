import { TenderParty } from ".";
import { TenderPartyModel } from "./schema";

/**
 * Create a new party record
 * @param party - Party object
 * @returns Created party
 */
export const createTenderParty = async (party: TenderParty) => {
  const newParty = await TenderPartyModel.create(party.toJSON());
  return new TenderParty(newParty.toObject());
};
