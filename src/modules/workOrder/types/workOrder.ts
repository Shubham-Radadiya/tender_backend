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
  originalFileName?: string;
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
  originalFileName?: string;

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
  }

  toJSON(): WorkOrder {
    return omitBy(this, isUndefined) as WorkOrder;
  }
}
