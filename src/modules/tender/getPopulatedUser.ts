import { omit } from "lodash";
import path from "path";
import { IUser, User } from ".";
import { UserModel } from "./schema";

/**
 *
 * @param _id user id
 * @returns return populated account
 */
export const getPopulatedUser = async (_id: string) => {
  const user: IUser = await UserModel.findById(_id).select("-password")
    // .populate({
    //   path: "profilePic",
    // })
    // .populate({
    //   path: "userPlan",
    //   populate:[
    //    { path:"fullPlan"}
    //   ]
    // })
    .lean();
  return user ? new User(user) : null;
};
