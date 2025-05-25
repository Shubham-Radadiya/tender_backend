import { Types } from "mongoose";
import { isUndefined, omitBy } from "lodash";

export interface IParty {
  _id?: string;
  name: string;
  mobileNo: string;
  gstNo?: string;
  panNo?: string;
  address?: string;
  createdBy: string | Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Party implements IParty {
  _id?: string;
  name: string;
  mobileNo: string;
  gstNo?: string;
  panNo?: string;
  address?: string;
  createdBy: string | Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input: IParty) {
    this._id = input._id || new Types.ObjectId().toString();
    this.name = input.name;
    this.mobileNo = input.mobileNo;
    this.gstNo = input.gstNo;
    this.panNo = input.panNo;
    this.address = input.address;
    this.createdBy = input.createdBy;
    this.createdAt = input.createdAt || new Date(); // Default to current timestamp
    this.updatedAt = input.updatedAt;
  }

  toJSON(): IParty {
    return omitBy(this, isUndefined) as IParty;
  }
}
