import { Party } from ".";
import { PartyModel } from "./schema";

/**
 *
 * @param _id party id
 * @returns relevant party record | null
 */
export const getPartyById = async (_id: string) => {
  const party = await PartyModel.findById(_id);
  return party ? new Party(party) : null;
};
