import { Schema, model } from "mongoose";
import { IPartyWork } from "../types";

const PartyWorkSchema: Schema = new Schema(
  {
    partyId: { type: Schema.Types.ObjectId, ref: "party" },
    tenderId: { type: Schema.Types.ObjectId, ref: "tender" },
    workTitle: { type: String },
    workDescription: { type: String },
    dueDate: { type: Date },
    totalAmount: { type: Number },
    status: {
      type: String,
      enum: ["progress", "completed", "terminated"],
      default: "progress",
    },
  },
  {
    timestamps: true,
  }
);
export const PartyWorkModel = model<IPartyWork>("PartyWork", PartyWorkSchema);
