import { model, Schema } from "mongoose";
import { IImage } from "..";
const image = new Schema<IImage>({
  description: { type: String, required: false },
  title: { type: String, required: false },
  url: { type: String, required: true },
},{ timestamps: true });

export const ImageModel = model<IImage>("image", image);
