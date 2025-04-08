import { Transaction } from ".";
import { TransactionModel } from "./schema";

/**
 *
 * @param transaction
 * @returns update transaction record
 */
export const updateTransaction = async (transaction: Transaction) => {
  await TransactionModel.findByIdAndUpdate(transaction._id, transaction.toJSON());
  return transaction;
};
