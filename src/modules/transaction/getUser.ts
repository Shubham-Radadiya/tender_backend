import { User } from ".";
import { UserModel } from "./schema";

export const getUser = async () => {
  const user = await UserModel.find();
  return user ? user.map((item) => new User(item)) : null;
};
