import { Category } from ".";
import { CategoryModel } from "./schema";

export const getCategory = async () => {
  const category = await CategoryModel.find();
  return category ? category.map((item) => new Category(item)) : null;
};
