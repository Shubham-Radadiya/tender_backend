import { User } from ".";
import { UserModel } from "./schema";

export const getUser = async (role?: string, adminApprove?: boolean) => {
  const filter = role
    ? {
        role,
        // "companyDetails.adminApprove": adminApprove,
      }
    : {};
  const user = await UserModel.find(filter);
  return user ? user.map((item) => new User(item)) : null;
};
