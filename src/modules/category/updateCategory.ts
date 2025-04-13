import { Category } from ".";
import { CategoryModel } from "./schema";

/**
 *
 * @param category
 * @returns update category record
 */
export const updateCategory = async (category: Category) => {
  await CategoryModel.findByIdAndUpdate(category._id, category.toJSON());
  return category;
};
