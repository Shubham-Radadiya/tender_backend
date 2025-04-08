import { Bill } from ".";
import { BillModel } from "./schema";

export const getBill = async () => {
  const bill = await BillModel.find();
  return bill ? bill.map((item) => new Bill(item)) : null;
};
