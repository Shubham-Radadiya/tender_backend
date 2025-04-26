import { Types } from "mongoose";
import { isUndefined, omitBy } from "lodash";
import { UserRole } from "../schema";

export interface ICompanyDetails {
  companyName?: string;
  businessEmail?: string;
  aadharNumber?: string;
  panNumber?: string;
  userName?: string;
  companyPhone?: string;
  gstUsername?: string;
  gstNumber?: string;
  ifscCode?: string;
  website?: string;
  annualTenderCap?: number;
}

export interface IUser {
  _id?: string;
  firstName: string;
  lastName: string;
  dob: Date;
  address: string;
  city: string;
  state: string;
  email: string;
  password: string;
  phoneNumber: string;
  profile?: string;
  role: UserRole;
  companyDetails?: ICompanyDetails; // Only for COMPANY_MANAGER
  managedCompanyManagers?: string[]; // For GROUP_MANAGER & BANK_MANAGER
  createdAt?: Date;
  updatedAt?: Date;
}

export class User implements IUser {
  _id?: string;
  firstName: string;
  lastName: string;
  dob: Date;
  address: string;
  city: string;
  state: string;
  email: string;
  password: string;
  phoneNumber: string;
  profile?: string;
  role: UserRole;
  companyDetails?: ICompanyDetails; // Only for COMPANY_MANAGER
  managedCompanyManagers?: string[]; // For GROUP_MANAGER & BANK_MANAGER
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IUser) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.firstName = input.firstName;
    this.lastName = input.lastName;
    this.dob = input.dob;
    this.address = input.address;
    this.city = input.city;
    this.state = input.state;
    this.email = input.email;
    this.password = input.password;
    this.phoneNumber = input.phoneNumber;
    this.profile = input.profile;
    this.role = input.role;
    this.companyDetails = input.companyDetails;
    this.managedCompanyManagers = input.managedCompanyManagers;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): IUser {
    return omitBy(this, isUndefined) as IUser;
  }
}
