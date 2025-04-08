import { Bill } from ".";
import { BillModel } from "./schema";

/**
 *
 * @param _id bill id
 * @returns relevant bill record | null
 */
export const getBillById = async (_id: string) => {
  const bill = await BillModel.findById(_id);
  return bill ? new Bill(bill) : null;
};
