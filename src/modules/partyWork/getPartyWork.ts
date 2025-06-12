import { PartyWork } from ".";
import { PartyWorkModel } from "./schema";

export const getPartyWork = async (partyId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const totalCount = await PartyWorkModel.countDocuments();
  const partyWork = await PartyWorkModel.find({ partyId })
    .populate({ path: "partyId", select: "name" })
    .skip(skip)
    .limit(limit)
    .lean();

  const partyWorkList = partyWork
    ? partyWork.map((item) => new PartyWork(item))
    : null;
  return { partyWorkList, totalCount };
};
