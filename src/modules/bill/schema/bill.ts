import { Schema, model } from "mongoose";
import { IBill } from "../types";

export enum BillStatus {
  SAVED = "SAVED",
  PAID = "PAID",
}

const bill = new Schema<IBill>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "user" },
    tenderId: { type: Schema.Types.ObjectId, ref: "Tender" },
    amount: { type: Number },
    taxPercent: { type: Number },
    additionalCharges: { type: Number },
    total: { type: Number },
    invoiceNumber: { type: String },
    address: { type: String },
    subject: { type: String },
    from: { type: String },
    status: {
      type: String,
      enum: Object.values(BillStatus),
      default: BillStatus.SAVED,
    },
  },
  { timestamps: true }
);

export const BillModel = model<IBill>("bill", bill);
