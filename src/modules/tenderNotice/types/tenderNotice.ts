import { Types } from "mongoose";
import { isUndefined, omitBy } from "lodash";
import { ITender } from "../../tender/types";
import { IUser } from "../../user";
export interface ITenderNotice {
  _id?: string;
  tenderId: string | ITender;
    itemName?: string;
    quantity?: number;
    unit?: string;
    rate?: number;
    amount?: number;
    days?: number;
  createdAt?: Date;
    updatedAt?: Date;
}

export class TenderNotice implements ITenderNotice {
  _id?: string;
  tenderId: string | ITender;
    itemName?: string;
    quantity?: number;
    unit?: string;
    rate?: number;
    amount?: number;
    days?: number;
  createdAt?: Date;
    updatedAt?: Date;
  constructor(input: ITenderNotice) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();

    this.tenderId = input.tenderId;
    this.days = input.days;
    this.itemName = input.itemName;
    this.quantity = input.quantity;
    this.unit = input.unit;
    this.rate = input.rate;
    this.amount = input.amount;

  }

  toJSON(): ITenderNotice {
    return omitBy(this, isUndefined) as ITenderNotice;
  }
}
