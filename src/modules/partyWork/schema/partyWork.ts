import { Schema, model } from "mongoose";
import { IPartyWork } from "../types";

const PartyWorkSchema: Schema = new Schema(
  {
    partyId: { type: Schema.Types.ObjectId, ref: "Party", required: true },
    tenderId: { type: Schema.Types.ObjectId, ref: "Tender", required: true },
    workTitle: { type: String, required: true },
    workDescription: { type: String },
    dueDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["progress", "completed", "terminated"],
      default: "progress",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
export const PartyWorkModel = model<IPartyWork>("PartyWork", PartyWorkSchema);
