import { Schema, model } from "mongoose";
import { IBill } from "../types";

export enum Status {
  SAVED = "SAVED",
  PAID = "PAID",
}

const bill = new Schema<IBill>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "User" },
    tenderId: { type: Schema.Types.ObjectId, ref: "Tender" },
    amount: { type: Number },
    taxPercent: { type: Number },
    additionalCharges: { type: Number },
    total: { type: Number },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.SAVED,
    },
  },
  { timestamps: true }
);

export const BillModel = model<IBill>("bill", bill);
