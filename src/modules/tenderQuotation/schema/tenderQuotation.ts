import { Schema, model } from "mongoose";
import { ITenderQuotation } from "../types";

const tenderQuotation = new Schema<ITenderQuotation>(
  {
    tenderId: {
      type: Schema.Types.ObjectId,
      ref: "tender",
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    quotationNumber: {
      type: Number,
    },
    tenderFee: {
      type: Number,
    },
    emd: {
      type: Number,
    },

    termsAndConditions: {
      type: String,
    },
    form: {
      type: String,
    },
    to: {
      type: String,
    },
    refOne: {
      type: String,
    },
    refTwo: {
      type: String,
    },
    itemRates: [
      {
        itemId: {
          type: Schema.Types.ObjectId,
        },
        rate: {
          type: Number,
        },
        amount: Number,
        date: {
          type: Date,
        },
        receipt: {
          type: String,
        },
        fee: {
          type: Number,
        },
      },
    ],
  },
  { timestamps: true }
);

export const TenderQuotationModel = model<ITenderQuotation>(
  "tenderQuotation",
  tenderQuotation
);
