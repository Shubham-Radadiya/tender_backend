import { TenderParty } from ".";
import { TenderPartyModel } from "./schema";

/**
 *
 * @param _id party id
 * @returns relevant party record | null
 */
export const getTenderPartyById = async (_id: string) => {
  const party = await TenderPartyModel.findById(_id);
  return party ? new TenderParty(party) : null;
};
