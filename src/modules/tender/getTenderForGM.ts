import { Tender } from ".";
import { TenderModel } from "./schema";

export const getTenderForGM = async () => {
  const tender = await TenderModel.find({ status: "GM_PENDING" })
    .populate("category")
    .populate("department")
    .lean();
  return tender ? tender.map((item) => new Tender(item)) : null;
};
