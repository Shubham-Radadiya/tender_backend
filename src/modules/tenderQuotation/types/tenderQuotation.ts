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
  quotationId?: string;
  tenderId: string | ITender;
  companyId: string | IUser;
  quotationNumber: number;
  tenderFee: number;
  emd: number;
  date?: Date;
  receipt?: string;
  fee?: number;
  itemRates: IItemRate[];
  personalDetails: {
    refNo: string;
    departmentName: string;
    location: string;
    panNo: string;
    gstNo: string;
    termsAndConditions: string[];
    quotationCreateDate?: Date;
  };
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
  quotationId?: string;
  tenderFee: number;
  emd: number;
  itemRates: IItemRate[];
  personalDetails: {
    refNo: string;
    departmentName: string;
    location: string;
    panNo: string;
    gstNo: string;
    termsAndConditions: string[];
    quotationCreateDate?: Date;
  };
  date?: Date;
  receipt?: string;
  fee?: number;
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
    this.quotationId = input.quotationId
      ? input.quotationId.toString()
      : new Types.ObjectId().toString();
    this.quotationNumber = input.quotationNumber;
    this.tenderFee = input.tenderFee;
    this.emd = input.emd;
    this.date = input.date;
    this.receipt = input.receipt;
    this.fee = input.fee;
    this.itemRates = input.itemRates.map((item) => ({
      itemId: item.itemId,
      rate: item.rate,
      amount: item.amount,
    }));
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
    this.termsAndConditions = input.termsAndConditions;
    this.personalDetails = input.personalDetails || {
      refNo: "",
      departmentName: "",
      location: "",
      panNo: "",
      gstNo: "",
      termsAndConditions: [],
      quotationCreateDate:
        input.personalDetails?.quotationCreateDate || new Date(),
    };
    this.form = input.form;
    this.to = input.to;
    this.refOne = input.refOne;
    this.refTwo = input.refTwo;
  }

  toJSON(): ITenderQuotation {
    return omitBy(this, isUndefined) as ITenderQuotation;
  }
}
