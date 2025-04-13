import { Department } from ".";
import { DepartmentModel } from "./schema";

export const getDepartment = async () => {
  const department = await DepartmentModel.find();
  return department ? department.map((item) => new Department(item)) : null;
};
