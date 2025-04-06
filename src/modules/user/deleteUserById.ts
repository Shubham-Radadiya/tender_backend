import { UserModel } from "./schema";

/**
 * will delete user
 * @param _id
 */
export const deleteUserById = async (_id: string) => {
  await UserModel.findByIdAndDelete(_id);
};
