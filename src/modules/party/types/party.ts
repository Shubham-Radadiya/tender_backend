import { Types } from "mongoose";
import { isUndefined, omitBy } from "lodash";
import { IUser } from "../../user";

export interface IParty {
  _id?: string;
  companyId: string | IUser; // or IUser if you're populating
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  gstNumber: string;
  panNumber: string;
  address: string;
  additionalInfo: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Party implements IParty {
  _id?: string;
  companyId: string | IUser;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  gstNumber: string;
  panNumber: string;
  address: string;
  additionalInfo: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input: IParty) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.companyId = input.companyId;
    this.firstName = input.firstName;
    this.lastName = input.lastName;
    this.phone = input.phone;
    this.email = input.email;
    this.gstNumber = input.gstNumber;
    this.panNumber = input.panNumber;
    this.address = input.address;
    this.additionalInfo = input.additionalInfo;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): IParty {
    return omitBy(this, isUndefined) as IParty;
  }
}
