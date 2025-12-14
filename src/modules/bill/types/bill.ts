import { Types } from "mongoose";
import { isUndefined, omitBy } from "lodash";
import { IUser } from "../../user";
import { ITender } from "../../tender";
import { BillStatus } from "../schema";

export interface IBill {
  _id?: string;
  companyId: string | IUser;
  workOrderId: string | ITender;
  amount: number;
  taxPercent: number;
  additionalCharges: number;
  total: number;
  invoiceNumber: string;
  address: string;
  subject: string;
  from: string;
  status: BillStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Bill implements IBill {
  _id?: string;
  companyId: string;
  workOrderId: string;
  amount: number;
  taxPercent: number;
  additionalCharges: number;
  total: number;
  invoiceNumber: string;
  address: string;
  subject: string;
  from: string;
  status: BillStatus;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input: IBill) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.companyId =
      typeof input.companyId === "string"
        ? input.companyId
        : input.companyId._id;
    this.workOrderId =
      typeof input.workOrderId === "string"
        ? input.workOrderId
        : input.workOrderId._id;
    this.amount = input.amount;
    this.taxPercent = input.taxPercent;
    this.additionalCharges = input.additionalCharges;
    this.total = input.total;
    this.invoiceNumber = input.invoiceNumber;
    this.address = input.address;
    this.subject = input.subject;
    this.from = input.from;
    this.status = input.status;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): IBill {
    return omitBy(this, isUndefined) as IBill;
  }
}
