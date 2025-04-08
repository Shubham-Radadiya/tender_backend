import { TransactionModel } from "./schema";

/**
 * will delete transaction
 * @param _id
 */
export const deleteTransactionById = async (_id: string) => {
  await TransactionModel.findByIdAndDelete(_id);
};
