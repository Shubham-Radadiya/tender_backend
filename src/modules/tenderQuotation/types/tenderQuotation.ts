import { Types } from "mongoose";
import { isUndefined, omitBy } from "lodash";
import { ITender } from "../../tender/types";
import { IUser } from "../../user";

export interface IItemRate {
  itemId: string;
  rate: number;
  amount?: number;
  date?: Date;
  receipt?: string;
  fee?: number;
}

export interface ITenderQuotation {
  _id?: string;
  tenderId: string | ITender;
  companyId: string | IUser;
  quotationNumber: number;
  tenderFee: number;
  emd: number;
  itemRates: IItemRate[];
  createdAt?: Date;
  updatedAt?: Date;
  termsAndConditions?: string;
  form?: string;
  to?: string;
  refOne?: string;
  refTwo?: string;
}

export class TenderQuotation implements ITenderQuotation {
  _id?: string;
  tenderId: string | ITender;
  companyId: string | IUser;
  quotationNumber: number;
  tenderFee: number;
  emd: number;
  itemRates: IItemRate[];
  createdAt?: Date;
  updatedAt?: Date;
  termsAndConditions?: string;
  form?: string;
  to?: string;
  refOne?: string;
  refTwo?: string;
  constructor(input: ITenderQuotation) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();

    this.tenderId = input.tenderId;
    this.companyId = input.companyId;
    this.quotationNumber = input.quotationNumber;
    this.tenderFee = input.tenderFee;
    this.emd = input.emd;
    this.itemRates = input.itemRates.map((item) => ({
      itemId: item.itemId,
      rate: item.rate,
      amount: item.amount,
      date: item.date ? new Date(item.date) : undefined,
      receipt: item.receipt,
      fee: item.fee,
    }));
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
    this.termsAndConditions = input.termsAndConditions;
    this.form = input.form;
    this.to = input.to;
    this.refOne = input.refOne;
    this.refTwo = input.refTwo;
  }

  toJSON(): ITenderQuotation {
    return omitBy(this, isUndefined) as ITenderQuotation;
  }
}
