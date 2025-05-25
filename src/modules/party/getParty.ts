import { Party } from ".";
import { PartyModel } from "./schema";

export const getParty = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const totalCount = await PartyModel.countDocuments();
  const parties = await PartyModel.find().skip(skip).limit(limit);
  const partyList = parties ? parties.map((item) => new Party(item)) : null;

  return { partyList, totalCount };
};
