import { User } from ".";
import { UserModel } from "./schema";

/**
 * Create a new user record
 * @param user - User object
 * @returns Created user
 */
export const createUser = async (user: User) => {
  const newUser = await UserModel.create(user.toJSON());
  return new User(newUser.toObject());
};
