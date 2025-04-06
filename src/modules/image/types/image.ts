import { isNil, isUndefined, omitBy } from "lodash";

export interface IImage {
  _id?: string;
  description?: string;
  title?: string;
  url?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Image implements IImage {
  _id?: string;
  description?: string;
  title?: string;
  url?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IImage) {
    this._id = input._id;
    this.description = input.description;
    this.title = input.title;
    this.url = input.url;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON() {
    return omitBy(this, isUndefined) as IImage;
  }

  toComparable(): IImage {
    return omitBy(this, isNil) as IImage;
  }
}
