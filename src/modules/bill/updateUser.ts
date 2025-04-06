import { User } from ".";
import { UserModel } from "./schema";

/**
 *
 * @param user
 * @returns update user record
 */
export const updateUser = async (user: User) => {
  await UserModel.findByIdAndUpdate(user._id, user.toJSON());
  return user;
};
