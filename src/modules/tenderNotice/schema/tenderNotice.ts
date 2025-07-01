import { Schema, model } from "mongoose";
import { ITenderNotice } from "../types";

const tenderNotice = new Schema<ITenderNotice>(
  {
    tenderId: {
      type: Schema.Types.ObjectId,
      ref: "tender",
    },
    fileName: {
      type: String,
    },
    days: {
      type: Number,
    },
    itemName: {
      type: String,
    },
    quantity: {
      type: Number,
    },
    unit: {
      type: String,
    },
    rate: {
      type: Number,
    },
    amount: {
      type: Number,
    },
  },
  { timestamps: true }
);

export const TenderNoticeModel = model<ITenderNotice>(
  "tenderNotice",
  tenderNotice
);
