import { User } from ".";
import { UserModel, UserRole } from "./schema";

export const getTM = async () => {
  const user = await UserModel.findOne({
    role: UserRole.TENDER_MANAGER
  });
  return user ? new User(user) : null;
};
