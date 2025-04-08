import { PartyWork } from ".";
import { PartyWorkModel } from "./schema";

export const getPartyWork = async () => {
  const partyWork = await PartyWorkModel.find();
  return partyWork ? partyWork.map((item) => new PartyWork(item)) : null;
};
