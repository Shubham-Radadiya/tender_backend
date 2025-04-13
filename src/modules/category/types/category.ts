import { Types } from "mongoose";
import { isUndefined, omitBy } from "lodash";

export interface ICategory {
  _id?: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Category implements ICategory {
  _id?: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input: ICategory) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.name = input.name;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): ICategory {
    return omitBy(this, isUndefined) as ICategory;
  }
}
