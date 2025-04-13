import { Schema, model } from "mongoose";
import { IDepartment } from "../types";

const department = new Schema<IDepartment>(
  {
    name: { type: String },
    address: { type: String },
    link: { type: String },
  },
  { timestamps: true }
);

export const DepartmentModel = model<IDepartment>("department", department);
