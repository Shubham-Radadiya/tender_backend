import { Transaction } from ".";
import { TransactionModel } from "./schema";

export const getTransaction = async () => {
  const transaction = await TransactionModel.find();
  return transaction ? transaction.map((item) => new Transaction(item)) : null;
};
