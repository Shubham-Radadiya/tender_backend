import { CategoryModel } from "./schema";

/**
 * will delete category
 * @param _id
 */
export const deleteCategoryById = async (_id: string) => {
  await CategoryModel.findByIdAndDelete(_id);
};
