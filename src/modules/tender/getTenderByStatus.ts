import { Tender } from ".";
import { TenderModel } from "./schema";

export const getTenderByStatus = async (status: string) => {
  const tender = await TenderModel.find({ status })
    .populate("category")
    .populate("department")
    .lean();
  return tender ? tender.map((item) => new Tender(item)) : null;
};
