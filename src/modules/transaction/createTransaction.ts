import { Transaction } from ".";
import { TransactionModel } from "./schema";

/**
 * Create a new transaction record
 * @param transaction - Transaction object
 * @returns Created transaction
 */
export const createTransaction = async (transaction: Transaction) => {
  const newTransaction = await TransactionModel.create(transaction.toJSON());
  return new Transaction(newTransaction.toObject());
};
