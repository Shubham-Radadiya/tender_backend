import { Schema, model } from "mongoose";
import { IUser } from "../types";

export enum UserRole {
  ADMIN = "ADMIN",
  TENDER_MANAGER = "TENDER_MANAGER",
  GROUP_MANAGER = "GROUP_MANAGER",
  COMPANY_MANAGER = "COMPANY_MANAGER",
  BANK_MANAGER = "BANK_MANAGER",
}

const CompanyDetailsSchema = new Schema(
  {
    companyName: String,
    businessEmail: String,
    aadharNumber: String,
    panNumber: String,
    userName: String,
    companyPhone: String,
    gstUsername: String,
    gstNumber: String,
    ifscCode: String,
    website: String,
    annualTenderCap: Number,
  },
  { _id: false }
);

const user = new Schema<IUser>(
  {
    firstName: { type: String },
    lastName: { type: String },
    dob: { type: Date },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    profile: { type: String },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    companyDetails: {
      type: CompanyDetailsSchema,
      default: undefined, // So it stays empty unless filled
    },
    managedCompanyManagers: [
      {
        type: Schema.Types.ObjectId,
        ref: "user", // Field for Group_manager and Bank_Manager.
      },
    ],
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

export const UserModel = model<IUser>("user", user);
