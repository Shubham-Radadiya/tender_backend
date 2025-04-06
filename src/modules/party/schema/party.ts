import { Schema, model } from "mongoose";
import { IParty } from "../types";

const party = new Schema<IParty>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "User" },
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String },
    email: { type: String },
    gstNumber: { type: String },
    panNumber: { type: String },
    address: { type: String },
    additionalInfo: { type: String },
  },
  { timestamps: true }
);

export const PartyModel = model<IParty>("party", party);
