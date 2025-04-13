import { DepartmentModel } from "./schema";

/**
 * will delete department
 * @param _id
 */
export const deleteDepartmentById = async (_id: string) => {
  await DepartmentModel.findByIdAndDelete(_id);
};
