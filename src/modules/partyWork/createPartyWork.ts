import { PartyWork } from ".";
import { PartyWorkModel } from "./schema";

/**
 * Create a new partyWork record
 * @param partyWork - PartyWork object
 * @returns Created partyWork
 */
export const createPartyWork = async (partyWork: PartyWork) => {
  const newPartyWork = await PartyWorkModel.create(partyWork.toJSON());
  return new PartyWork(newPartyWork.toObject());
};
