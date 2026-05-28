import { Types } from "mongoose";
import { isUndefined, omitBy } from "lodash";
import { ITender } from "../../tender";

export interface IWorkOrder {
  _id?: string;
  tenderId: string | ITender;
  title?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  rate?: number;
  fileName?: string;
  amount?: number;
  invoiceNumber?: String;
  invoiceDate?: Date;
  originalFileName?: string;
  dueDate?: Date;
  workOrderNumber?: string;
  workOrderCreateDate?: Date;
  isBillGenerated?: boolean;
  createdAt: Date;
  updatedAt: Date;
  departmentName?: string;
  companyName?: string;
}

export class WorkOrder implements IWorkOrder {
  _id?: string;
  tenderId: string | ITender;
  title?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  rate?: number;
  fileName?: string;
  amount?: number;
  invoiceNumber?: String;
  invoiceDate?: Date;
  originalFileName?: string;
  dueDate?: Date;
  workOrderNumber?: string;
  workOrderCreateDate?: Date;
  isBillGenerated?: boolean;
  createdAt: Date;
  updatedAt: Date;
  departmentName?: string;
  companyName?: string;
  constructor(input: IWorkOrder) {
    this._id = input._id || new Types.ObjectId().toString();
    this.tenderId = input.tenderId;
    this.title = input.title;
    this.description = input.description;
    this.quantity = input.quantity;
    this.unit = input.unit;
    this.rate = input.rate;
    this.fileName = input.fileName;
    this.originalFileName = input.originalFileName;
    this.amount = input.amount;
    this.invoiceNumber = input.invoiceNumber;
    this.invoiceDate = input.invoiceDate;
    this.dueDate = input.dueDate;
    this.workOrderNumber = input.workOrderNumber;
    this.workOrderCreateDate = input.workOrderCreateDate;
    this.isBillGenerated = input.isBillGenerated ?? false;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
    this.departmentName = input.departmentName;
    this.companyName = input.companyName;
  }

  toJSON(): WorkOrder {
    return omitBy(this, isUndefined) as WorkOrder;
  }
}
