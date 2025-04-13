import { User } from ".";
import { UserModel } from "./schema";

export const getUser = async (role?: string) => {
  const filter = role ? { role } : {};
  const user = await UserModel.find(filter);
  return user ? user.map((item) => new User(item)) : null;
};
