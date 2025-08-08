import { Schema, model } from "mongoose";
import { IUnit } from "../types";

const unit = new Schema<IUnit>(
  {
    name: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const UnitModel = model<IUnit>("unit", unit);
