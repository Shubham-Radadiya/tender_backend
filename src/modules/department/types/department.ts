import { Types } from "mongoose";
import { isUndefined, omitBy } from "lodash";

export interface IDepartment {
  _id?: string;
  name: string;
  address: string;
  link?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Department implements IDepartment {
  _id?: string;
  name: string;
  address: string;
  link: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input: IDepartment) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.name = input.name;
    this.address = input.address;
    this.link = input.link;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): IDepartment {
    return omitBy(this, isUndefined) as IDepartment;
  }
}
