import { Tender } from ".";
import { TenderModel } from "./schema";

export const getTender = async () => {
  const tender = await TenderModel.find();
  return tender ? tender.map((item) => new Tender(item)) : null;
};
