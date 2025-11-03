import { Schema, model } from "mongoose";
import { ITender } from "../types";

export enum TenderStatus {
  GM_PENDING = "GM_PENDING",
  GM_ACCEPTED = "GM_ACCEPTED",
  GM_DECLINED = "GM_DECLINED",
  GM_APPROVED = "GM_APPROVED",
  CM_PENDING = "CM_PENDING",
  CM_ACCEPTED = "CM_ACCEPTED",
  CM_DECLINED = "CM_DECLINED",
  TM_PENDING = "TM_PENDING",
  TM_COMPLETED = "TM_COMPLETED",
  SELECT_STATUS = "SELECT_STATUS",
  JUNIOR_ENGINEER = "JUNIOR_ENGINEER",
  ASSOCIATIVE_ENGINEER = "ASSOCIATIVE_ENGINEER",
  EXECUTIVE_ENGINEER = "EXECUTIVE_ENGINEER",
  OTHER = "OTHER",
  DAYS_COUNT_PENDING = "DAYS_COUNT_PENDING",
  GM_QUTATION_PENDING = "GM_QUTATION_PENDING",
  TENDER_NOTICE_PENDING = "TENDER_NOTICE_PENDING",
  TENDER_RECEIPT_PENDING = "TENDER_RECEIPT_PENDING",
}

const tender = new Schema<ITender>(
  {
    // tenderNo: { type: String },
    srNo: { type: String, default: null },
    name: { type: String },
    tenderType: { type: String, default: "GEM" },
    createdDate: { type: Date },
    // lastDate: { type: Date },
    category: { type: Schema.Types.ObjectId, ref: "category" },
    department: { type: Schema.Types.ObjectId, ref: "department" },
    nameOfWork: { type: String },
    providedBy: { type: String },
    isNoticeGenerated: { type: Boolean, default: false },
    tender_notice_number: { type: String, default: null },
    tender_notice_date: { type: Date, default: null },
    due_date: { type: Date, default: null },

    tenderNotice: [
      {
        fileName: { type: String },
        days: { type: Number },
        itemName: { type: String },
        quantity: { type: Number },
        unit: { type: String },
        rate: { type: Number },
        amount: { type: Number },
      },
    ],
    items: [
      {
        description: { type: String },
        quantity: { type: Number },
        unit: { type: Schema.Types.ObjectId, ref: "unit" },
        parItemRate: { type: Number, default: 0 },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "user" }, // Tender Manager
    status: {
      type: String,
      enum: Object.values(TenderStatus),
      default: TenderStatus.SELECT_STATUS,
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
    partyData: [
      {
        id: { type: Schema.Types.ObjectId, required: true },
        type: { type: String, enum: ["user", "party"], required: true },
      },
    ],
    declineReason: { type: String },
  },
  { timestamps: true }
);

export const TenderModel = model<ITender>("tender", tender);
