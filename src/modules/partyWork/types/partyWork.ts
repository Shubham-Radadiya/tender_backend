import { Types } from "mongoose";
import { isUndefined, omitBy } from "lodash";
import { IParty } from "../../party/types";
import { ITender } from "../../tender";

export interface IPartyWork {
  _id?: string;
  partyId: string | IParty;
  tenderId: string | ITender;
  workTitle: string;
  workDescription?: string;
  dueDate: Date;
  totalAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
  status?: "progress" | "completed" | "terminated";
}

export class PartyWork implements IPartyWork {
  _id?: string;
  partyId: string | IParty;
  tenderId: string | ITender;
  workTitle: string;
  workDescription?: string;
  dueDate: Date;
  totalAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
  status?: "progress" | "completed" | "terminated";

  constructor(input: IPartyWork) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.partyId =
      typeof input.partyId === "string" ? input.partyId : input.partyId._id;
    this.tenderId =
      typeof input.tenderId === "string" ? input.tenderId : input.tenderId._id;
    this.workTitle = input.workTitle;
    this.workDescription = input.workDescription;
    this.dueDate = input.dueDate;
    this.totalAmount = input.totalAmount;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
    this.status = input.status || "progress";
  }

  toJSON(): IPartyWork {
    return omitBy(this, isUndefined) as IPartyWork;
  }
}
