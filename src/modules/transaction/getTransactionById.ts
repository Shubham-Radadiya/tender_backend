import { Transaction } from ".";
import { TransactionModel } from "./schema";

/**
 *
 * @param _id transaction id
 * @returns relevant transaction record | null
 */
export const getTransactionById = async (_id: string) => {
  const transaction = await TransactionModel.findById(_id);
  return transaction ? new Transaction(transaction) : null;
};
