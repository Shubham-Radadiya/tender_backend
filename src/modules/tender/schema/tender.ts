import { Schema, model } from "mongoose";
import { ITender } from "../types";

export enum Status {
  GM_PENDING = "GM_PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
  TM_COMPLETED = "TM_COMPLETED",
  CM_WORKING = "CM_WORKING",
}

const tender = new Schema<ITender>(
  {
    tenderNumber: { type: String },
    name: { type: String },
    createdDate: { type: Date },
    submissionDeadline: { type: Date },
    category: { type: String },
    department: {
      name: { type: String },
      address: { type: String },
      website: { type: String },
    },
    nameOfWork: { type: String },
    providedBy: { type: String },
    items: [
      {
        description: { type: String },
        quantity: { type: Number },
        unit: { type: String },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }, // Tender Manager
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.GM_PENDING,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" }, // Group Manager
    companyAssigned: { type: Schema.Types.ObjectId, ref: "User" }, // Company Manager
    history: [
      {
        action: String,
        by: { type: Schema.Types.ObjectId, ref: "User" },
        date: Date,
      },
    ],
  },
  { timestamps: true }
);

export const TenderModel = model<ITender>("tender", tender);
