import { Tender } from ".";
import { TenderModel } from "./schema";

export const getTender = async () => {
  const tender = await TenderModel.find()
    .populate("category")
    .populate("department")
    .lean().sort({ createdAt: -1 });
  return tender ? tender.map((item) => new Tender(item)) : null;
};
