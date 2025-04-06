import { Types } from "mongoose";
import { isUndefined, omitBy } from "lodash";
import { IParty } from "../../party/types";

export interface IPartyWork {
  _id?: string;
  partyId: string | IParty; // or IParty if populated
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  total: number;
  billUpload: string;
  reminderDate: Date;
  isPaid: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PartyWork implements IPartyWork {
  _id?: string;
  partyId: string | IParty;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  total: number;
  billUpload: string;
  reminderDate: Date;
  isPaid: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input: IPartyWork) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.partyId =
      typeof input.partyId === "string" ? input.partyId : input.partyId._id;
    this.description = input.description;
    this.quantity = input.quantity;
    this.unit = input.unit;
    this.rate = input.rate;
    this.amount = input.amount;
    this.total = input.total;
    this.billUpload = input.billUpload;
    this.reminderDate = input.reminderDate;
    this.isPaid = input.isPaid;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): IPartyWork {
    return omitBy(this, isUndefined) as IPartyWork;
  }
}
