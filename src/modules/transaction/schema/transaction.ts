import { Schema, model } from "mongoose";
import { ITransaction } from "../types";

export enum PaymentMode {
  CASH = "CASH",
  CHEQUE = "CHEQUE",
  BANK_TRANSFER = "BANK_TRANSFER",
  OTHERS = "OTHERS",
}

const transaction = new Schema<ITransaction>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "User" },
    billId: { type: Schema.Types.ObjectId, ref: "Bill" },
    paymentMode: {
      type: String,
      enum: Object.values(PaymentMode),
    },
    amount: { type: Number },
    paidOn: { type: Date },
  },
  { timestamps: true }
);

export const TransactionModel = model<ITransaction>("transaction", transaction);
