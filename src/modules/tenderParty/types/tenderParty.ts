import { Types } from "mongoose";
import { isUndefined, omitBy } from "lodash";

export interface ITenderParty {
  _id?: string;
  name: string;
  address?: string;
  email?: string;
}

export interface IPartyOrUser {
  id: string;
  type: "user" | "party";
}

export class TenderParty implements ITenderParty {
  _id?: string;
  name: string;
  email: string;
  address?: string;

  constructor(input: ITenderParty) {
    this._id = input._id || new Types.ObjectId().toString();
    this.name = input.name;
    this.email = input.email;
    this.address = input.address;
  }

  toJSON(): TenderParty {
    return omitBy(this, isUndefined) as TenderParty;
  }
}
