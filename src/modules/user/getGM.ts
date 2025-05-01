import { User } from ".";
import { UserModel, UserRole } from "./schema";

export const getGM = async () => {
  const user = await UserModel.findOne({
    role: UserRole.GROUP_MANAGER
  });
  return user ? new User(user) : null;
};
