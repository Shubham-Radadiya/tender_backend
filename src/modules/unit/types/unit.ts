import { Types } from "mongoose";
import { isUndefined, omitBy } from "lodash";

export interface IUnit {
  _id?: string;
  name: string;
  address?: string;
  email?: string;
}
export class Unit implements IUnit {
  _id?: string;
  name: string;

  constructor(input: IUnit) {
    this._id = input._id || new Types.ObjectId().toString();
    this.name = input.name;
  }

  toJSON(): Unit {
    return omitBy(this, isUndefined) as Unit;
  }
}
