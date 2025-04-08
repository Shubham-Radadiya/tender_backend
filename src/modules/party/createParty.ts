import { Party } from ".";
import { PartyModel } from "./schema";

/**
 * Create a new party record
 * @param party - Party object
 * @returns Created party
 */
export const createParty = async (party: Party) => {
  const newParty = await PartyModel.create(party.toJSON());
  return new Party(newParty.toObject());
};
