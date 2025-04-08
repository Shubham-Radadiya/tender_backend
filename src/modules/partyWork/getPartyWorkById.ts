import { PartyWork } from ".";
import { PartyWorkModel } from "./schema";

/**
 *
 * @param _id partyWork id
 * @returns relevant partyWork record | null
 */
export const getPartyWorkById = async (_id: string) => {
  const partyWork = await PartyWorkModel.findById(_id);
  return partyWork ? new PartyWork(partyWork) : null;
};
