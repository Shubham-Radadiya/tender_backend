import { Schema, model } from "mongoose";
import { ITender } from "../types";

export enum TenderStatus {
  GM_PENDING = "GM_PENDING",
  GM_ACCEPTED = "GM_ACCEPTED",
  GM_DECLINED = "GM_DECLINED",
  GM_APPROVED = "GM_APPROVED",
  TM_COMPLETED = "TM_COMPLETED",
}

const tender = new Schema<ITender>(
  {
    tenderNo: { type: String },
    name: { type: String },
    tenderType: { type: String, default: "GEM" },
    createdDate: { type: Date },
    lastDate: { type: Date },
    category: { type: Schema.Types.ObjectId, ref: "category" },
    department: { type: Schema.Types.ObjectId, ref: "department" },
    nameOfWork: { type: String },
    providedBy: { type: String },
    items: [
      {
        description: { type: String },
        quantity: { type: Number },
        unit: { type: String },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "user" }, // Tender Manager
    status: {
      type: String,
      enum: Object.values(TenderStatus),
      default: TenderStatus.GM_PENDING,
    },
    // assignedTo: { type: Schema.Types.ObjectId, ref: "user" }, // Group Manager
    companyAssigned: { type: Schema.Types.ObjectId, ref: "user" }, // Company Manager
    history: [
      {
        action: String,
        by: { type: Schema.Types.ObjectId, ref: "user" },
        date: Date,
      },
    ],
    declineReason: { type: String },
  },
  { timestamps: true }
);

export const TenderModel = model<ITender>("tender", tender);
