import { Schema, model } from "mongoose";
import { IParty } from "../types";

const party = new Schema<IParty>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNo: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\+\d{1,3}\d{7,15}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid phone number in E.164 format!`,
      },
    },
    gstNo: {
      type: String,
      required: false,
      validate: {
        validator: function (v) {
          return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/.test(
            v
          );
        },
        message: (props) => `${props.value} is not a valid GST number!`,
      },
    },
    panNo: {
      type: String,
      required: false,
      validate: {
        validator: function (v) {
          return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid PAN number!`,
      },
    },
    address: {
      type: String,
      required: false,
      trim: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "user" },
  },
  {
    timestamps: true,
  }
);

export const PartyModel = model<IParty>("party", party);
