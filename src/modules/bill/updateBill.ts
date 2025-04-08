import { Bill } from ".";
import { BillModel } from "./schema";

/**
 *
 * @param bill
 * @returns update bill record
 */
export const updateBill = async (bill: Bill) => {
  await BillModel.findByIdAndUpdate(bill._id, bill.toJSON());
  return bill;
};
