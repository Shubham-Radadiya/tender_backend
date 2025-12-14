import { Types } from "mongoose";
import { isUndefined, omitBy } from "lodash";

export interface ITenderParty {
  _id?: string;
  name: string;
  address?: string;
  email?: string;
  type?: "party" | "user";
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
  type?: "party" | "user";

  constructor(input: ITenderParty) {
    this._id = input._id || new Types.ObjectId().toString();
    this.name = input.name;
    this.email = input.email;
    this.address = input.address;
    this.type = input.type || "party";
  }

  toJSON(): TenderParty {
    return omitBy(this, isUndefined) as TenderParty;
  }
}
