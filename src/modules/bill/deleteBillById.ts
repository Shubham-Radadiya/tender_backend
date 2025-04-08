import { BillModel } from "./schema";

/**
 * will delete bill
 * @param _id
 */
export const deleteBillById = async (_id: string) => {
  await BillModel.findByIdAndDelete(_id);
};
