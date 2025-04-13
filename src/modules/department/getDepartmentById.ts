import { Department } from ".";
import { DepartmentModel } from "./schema";

/**
 *
 * @param _id department id
 * @returns relevant department record | null
 */
export const getDepartmentById = async (_id: string) => {
  const department = await DepartmentModel.findById(_id);
  return department ? new Department(department) : null;
};
