import { Department } from ".";
import { DepartmentModel } from "./schema";

/**
 * Create a new department record
 * @param department - Department object
 * @returns Created department
 */
export const createDepartment = async (department: Department) => {
  const newDepartment = await DepartmentModel.create(department.toJSON());
  return new Department(newDepartment.toObject());
};
