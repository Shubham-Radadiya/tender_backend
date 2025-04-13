import { Schema, model } from "mongoose";
import { ICategory } from "../types";

const category = new Schema<ICategory>(
  {
    name: { type: String },
  },
  { timestamps: true }
);

export const CategoryModel = model<ICategory>("category", category);
