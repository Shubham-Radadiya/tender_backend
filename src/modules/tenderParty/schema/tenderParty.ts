import { Schema, model } from "mongoose";
import { ITenderParty } from "../types";

const tenderParty = new Schema<ITenderParty>(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
    // createdBy: { type: Schema.Types.ObjectId, ref: "user" },
  },
  {
    timestamps: true,
  }
);

export const TenderPartyModel = model<ITenderParty>("tenderParty", tenderParty);
