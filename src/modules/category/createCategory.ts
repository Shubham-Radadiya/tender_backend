import { Category } from ".";
import { CategoryModel } from "./schema";

/**
 * Create a new category record
 * @param category - Category object
 * @returns Created category
 */
export const createCategory = async (category: Category) => {
  const newCategory = await CategoryModel.create(category.toJSON());
  return new Category(newCategory.toObject());
};
