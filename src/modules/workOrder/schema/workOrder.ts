import { Schema, model } from "mongoose";
import { IWorkOrder } from "../types";

const workOrder = new Schema<IWorkOrder>(
  {
    tenderId: { type: Schema.Types.ObjectId, ref: "Tender" },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    quantity: {
      type: Number,
    },
    unit: {
      type: String,
    },
    rate: {
      type: Number,
    },
    fileName: {
      type: String,
    },
    amount: {
      type: Number,
    },
    invoiceNumber: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const WorkOrderModel = model<IWorkOrder>("workOrder", workOrder);
