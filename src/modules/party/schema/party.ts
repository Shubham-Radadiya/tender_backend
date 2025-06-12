import { Schema, model } from "mongoose";
import { IParty } from "../types";

const party = new Schema<IParty>(
  {
    name: {
      type: String,
    },
    mobileNo: {
      type: String,
    },
    gstNo: {
      type: String,
    },
    panNo: {
      type: String,
    },
    address: {
      type: String,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "user" },
  },
  {
    timestamps: true,
  }
);

export const PartyModel = model<IParty>("party", party);
