import { Types } from "mongoose";
import { isUndefined, omitBy } from "lodash";
import { PaymentMode } from "../schema";
import { IUser } from "../../user";
import { IBill } from "../../bill";

export interface ITransaction {
  _id?: string;
  companyId: string | IUser; // or IUser if populated
  billId: string | IBill; // or IBill if populated
  paymentMode: PaymentMode;
  amount: number;
  paidOn: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Transaction implements ITransaction {
  _id?: string;
  companyId: string | IUser;
  billId: string | IBill;
  paymentMode: PaymentMode;
  amount: number;
  paidOn: Date;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input: ITransaction) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.companyId =
      typeof input.companyId === "string"
        ? input.companyId
        : input.companyId._id;
    this.billId =
      typeof input.billId === "string" ? input.billId : input.billId._id;
    this.paymentMode = input.paymentMode;
    this.amount = input.amount;
    this.paidOn = input.paidOn;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): ITransaction {
    return omitBy(this, isUndefined) as ITransaction;
  }
}
