import { User } from ".";
import { UserModel, UserRole } from "./schema";

export const checkCompanyManagers = async (companyManagerIds: string[]) => {
  const user = await UserModel.find({
    _id: { $in: companyManagerIds },
    role: UserRole.COMPANY_MANAGER,
  });
  return user ? user.map((item) => new User(item)) : null;
};
