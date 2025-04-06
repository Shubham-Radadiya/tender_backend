import { User } from ".";
import { UserModel } from "./schema";

/**
 *
 * @param _id user id
 * @returns relevant user record | null
 */
export const getUserById = async (_id: string) => {
  const user = await UserModel.findById(_id);
  return user ? new User(user) : null;
};
