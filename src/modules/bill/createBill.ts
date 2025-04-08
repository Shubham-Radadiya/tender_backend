import { Bill } from ".";
import { BillModel } from "./schema";

/**
 * Create a new bill record
 * @param bill - Bill object
 * @returns Created bill
 */
export const createBill = async (bill: Bill) => {
  const newBill = await BillModel.create(bill.toJSON());
  return new Bill(newBill.toObject());
};
