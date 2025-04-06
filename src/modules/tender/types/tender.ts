import { Types } from "mongoose";
import { isUndefined, omitBy } from "lodash";
import { Status } from "../schema";
import { IUser } from "../../user";

export interface ITender {
  _id?: string;
  tenderNumber: string;
  name: string;
  createdDate: Date;
  submissionDeadline: Date;
  category: string;
  department: {
    name: string;
    address: string;
    website: string;
  };
  nameOfWork: string;
  providedBy: string;
  items: {
    description: string;
    quantity: number;
    unit: string;
  }[];
  createdBy: string | IUser;
  status: Status;
  assignedTo?: string | IUser;
  companyAssigned?: string | IUser;
  history: {
    action: string;
    by: string | IUser;
    date: Date;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Tender implements ITender {
  _id?: string;
  tenderNumber: string;
  name: string;
  createdDate: Date;
  submissionDeadline: Date;
  category: string;
  department: {
    name: string;
    address: string;
    website: string;
  };
  nameOfWork: string;
  providedBy: string;
  items: {
    description: string;
    quantity: number;
    unit: string;
  }[];
  createdBy: string;
  status: Status;
  assignedTo?: string;
  companyAssigned?: string;
  history: {
    action: string;
    by: string;
    date: Date;
  }[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input: ITender) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.tenderNumber = input.tenderNumber;
    this.name = input.name;
    this.createdDate = input.createdDate;
    this.submissionDeadline = input.submissionDeadline;
    this.category = input.category;
    this.department = input.department;
    this.nameOfWork = input.nameOfWork;
    this.providedBy = input.providedBy;
    this.items = input.items;
    this.createdBy =
      typeof input.createdBy === "string"
        ? input.createdBy
        : input.createdBy._id;
    this.status = input.status;
    this.assignedTo = input.assignedTo
      ? typeof input.assignedTo === "string"
        ? input.assignedTo
        : input.assignedTo._id
      : undefined;
    this.companyAssigned = input.companyAssigned
      ? typeof input.companyAssigned === "string"
        ? input.companyAssigned
        : input.companyAssigned._id
      : undefined;
    this.history = input.history.map((h) => ({
      action: h.action,
      by: typeof h.by === "string" ? h.by : h.by._id,
      date: h.date,
    }));
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): ITender {
    return omitBy(this, isUndefined) as ITender;
  }
}
