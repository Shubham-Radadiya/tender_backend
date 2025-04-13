import { Category } from ".";
import { CategoryModel } from "./schema";

/**
 *
 * @param _id category id
 * @returns relevant category record | null
 */
export const getCategoryById = async (_id: string) => {
  const category = await CategoryModel.findById(_id);
  return category ? new Category(category) : null;
};
