import { Types } from "mongoose";
import { isUndefined, omitBy } from "lodash";
import { TenderStatus } from "../schema";
import { IUser } from "../../user";
import { ICategory } from "../../category";
import { IDepartment } from "../../department";
import { IPartyOrUser } from "../../tenderParty";

export interface ITender {
  _id?: string;
  tenderNo: string;
  tenderType: string;
  name: string;
  createdDate: Date;
  isNoticeGenerated: boolean;
  lastDate: Date;
  category: string | ICategory;
  department: string | IDepartment;
  nameOfWork: string;
  providedBy: string;
  tenderNotice: {
    fileName: string;
    days: number;
    itemName: string;
    quantity: number;
    unit: string;
    rate: number;
    tender_notice_number: String;
    tender_notice_date: Date;
    due_date: Date;
    amount: number;
  };
  items: {
    description: string;
    quantity: number;
    unit: string;
    parItemRate?: number;
  }[];
  createdBy: string | IUser;
  status: TenderStatus;
  workOrderStatus: boolean;
  juniorEngineerCount: number;
  // assignedTo?: string | IUser;
  companyAssigned?: string | IUser;
  history?: {
    action: string;
    by: string | IUser;
    date: Date;
  }[];
  declineReason: string;
  createdAt?: Date;
  updatedAt?: Date;
  partyData?: IPartyOrUser[];
  srNo?: string;
}

export class Tender implements ITender {
  _id?: string;
  tenderNo: string;
  tenderType: string;
  name: string;
  createdDate: Date;
  lastDate: Date;
  isNoticeGenerated: boolean;
  category: string | ICategory;
  department: string | IDepartment;
  nameOfWork: string;
  providedBy: string;
  tenderNotice: {
    fileName: string;
    days: number;
    itemName: string;
    quantity: number;
    unit: string;
    rate: number;
    tender_notice_number: String;
    tender_notice_date: Date;
    due_date: Date;
    amount: number;
  };
  items: {
    description: string;
    quantity: number;
    unit: string;
    parItemRate?: number;
  }[];
  createdBy: string | IUser;
  status: TenderStatus;
  juniorEngineerCount: number;
  workOrderStatus: boolean;
  // assignedTo?: string | IUser;
  companyAssigned?: string | IUser;
  history?: {
    action: string;
    by: string | IUser;
    date: Date;
  }[];
  declineReason: string;
  createdAt?: Date;
  updatedAt?: Date;
  partyData?: IPartyOrUser[];
  srNo?: string;

  constructor(input: ITender) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.tenderNo = input.tenderNo;
    this.tenderType = input.tenderType;
    this.name = input.name;
    this.isNoticeGenerated = input.isNoticeGenerated ?? false;
    this.createdDate = input.createdDate;
    this.lastDate = input.lastDate;
    this.category = input.category;
    this.department = input.department;
    this.nameOfWork = input.nameOfWork;
    this.providedBy = input.providedBy;
    this.tenderNotice = input.tenderNotice;
    this.items = input.items;
    this.createdBy = input.createdBy;
    this.status = input.status;
    this.workOrderStatus = input.workOrderStatus || false;
    this.juniorEngineerCount = input.juniorEngineerCount || 0;
    // this.assignedTo = input.assignedTo;
    this.companyAssigned = input.companyAssigned;
    this.history = input.history
      ? input.history.map((h) => ({
          action: h.action,
          by: h.by,
          date: h.date,
        }))
      : [];
    this.declineReason = input.declineReason;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
    this.partyData = input.partyData || [];
    this.srNo =
      input.srNo || Math.floor(1000 + Math.random() * 9000).toString();
  }

  toJSON(): ITender {
    return omitBy(this, isUndefined) as ITender;
  }
}
