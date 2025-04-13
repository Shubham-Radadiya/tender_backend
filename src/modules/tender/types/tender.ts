import { Types } from "mongoose";
import { isUndefined, omitBy } from "lodash";
import { Status } from "../schema";
import { IUser } from "../../user";
import { ICategory } from "../../category";
import { IDepartment } from "../../department";

export interface ITender {
  _id?: string;
  tenderNo: string;
  tenderType: string;
  name: string;
  createdDate: Date;
  lastDate: Date;
  category: string | ICategory;
  department: string | IDepartment;
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
  history?: {
    action: string;
    by: string | IUser;
    date: Date;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Tender implements ITender {
  _id?: string;
  tenderNo: string;
  tenderType: string;
  name: string;
  createdDate: Date;
  lastDate: Date;
  category: string | ICategory;
  department: string | IDepartment;
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
  history?: {
    action: string;
    by: string | IUser;
    date: Date;
  }[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input: ITender) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.tenderNo = input.tenderNo;
    this.tenderType = input.tenderType;
    this.name = input.name;
    this.createdDate = input.createdDate;
    this.lastDate = input.lastDate;
    this.category = input.category;
    this.department = input.department;
    this.nameOfWork = input.nameOfWork;
    this.providedBy = input.providedBy;
    this.items = input.items;
    this.createdBy = input.createdBy;
    this.status = input.status;
    this.assignedTo = input.assignedTo;
    this.companyAssigned = input.companyAssigned;
    this.history = input.history
      ? input.history.map((h) => ({
          action: h.action,
          by: h.by,
          date: h.date,
        }))
      : [];
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): ITender {
    return omitBy(this, isUndefined) as ITender;
  }
}
