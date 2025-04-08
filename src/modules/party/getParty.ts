import { Party } from ".";
import { PartyModel } from "./schema";

export const getParty = async () => {
  const party = await PartyModel.find();
  return party ? party.map((item) => new Party(item)) : null;
};
