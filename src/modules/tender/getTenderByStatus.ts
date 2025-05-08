import { Tender } from ".";
import { TenderModel } from "./schema";

export const getTenderByStatus = async (status: string | string[]) => {
  const statusFilter = Array.isArray(status) ? { $in: status } : status;
  const tender = await TenderModel.find({ status: statusFilter })
    .populate("category")
    .populate("department")
    .lean();
  return tender ? tender.map((item) => new Tender(item)) : null;
};
