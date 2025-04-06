import { Schema, model } from "mongoose";
import { IPartyWork } from "../types";

const partyWork = new Schema<IPartyWork>(
  {
    partyId: { type: Schema.Types.ObjectId, ref: "Party" },
    description: { type: String },
    quantity: { type: Number },
    unit: { type: String },
    rate: { type: Number },
    amount: { type: Number },
    total: { type: Number },
    billUpload: { type: String }, // path or link
    reminderDate: { type: Date },
    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PartyWorkModel = model<IPartyWork>("partyWork", partyWork);
