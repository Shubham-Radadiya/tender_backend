import { Department } from ".";
import { DepartmentModel } from "./schema";

/**
 *
 * @param department
 * @returns update department record
 */
export const updateDepartment = async (department: Department) => {
  await DepartmentModel.findByIdAndUpdate(department._id, department.toJSON());
  return department;
};
