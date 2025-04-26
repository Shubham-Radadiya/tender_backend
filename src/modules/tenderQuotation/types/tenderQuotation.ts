import { Types } from "mongoose";
import { isUndefined, omitBy } from "lodash";
import { ITender } from "../../tender/types";
import { IUser } from "../../user";

export interface IItemRate {
  itemId: string;
  rate: number;
  amount?: number;
}

export interface ITenderQuotation {
  _id?: string;
  tenderId: string | ITender;
  companyId: string | IUser;
  quotationNumber: number;
  tenderFee: number;
  emd: number;
  receipts: string[];
  itemRates: IItemRate[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class TenderQuotation implements ITenderQuotation {
  _id?: string;
  tenderId: string | ITender;
  companyId: string | IUser;
  quotationNumber: number;
  tenderFee: number;
  emd: number;
  receipts: string[];
  itemRates: IItemRate[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input: ITenderQuotation) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();

    this.tenderId = input.tenderId;
    this.companyId = input.companyId;
    this.quotationNumber = input.quotationNumber;
    this.tenderFee = input.tenderFee;
    this.emd = input.emd;
    this.receipts = input.receipts || [];
    this.itemRates = input.itemRates.map((item) => ({
      itemId: item.itemId,
      rate: item.rate,
      amount: item.amount,
    }));
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): ITenderQuotation {
    return omitBy(this, isUndefined) as ITenderQuotation;
  }
}
