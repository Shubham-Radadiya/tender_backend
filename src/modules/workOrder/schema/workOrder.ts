import { Schema, model } from "mongoose";
import { IWorkOrder } from "../types";

const workOrder = new Schema<IWorkOrder>(
  {
    tenderId: { type: Schema.Types.ObjectId, ref: "tender" },
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
    originalFileName: {
      type: String,
    },
    amount: {
      type: Number,
    },
    invoiceNumber: {
      type: String,
    },
    dueDate: {
      type: Date,
    },
    workOrderNumber: {
      type: String,
    },
    workOrderCreateDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const WorkOrderModel = model<IWorkOrder>("workOrder", workOrder);
