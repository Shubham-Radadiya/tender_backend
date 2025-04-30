import { User } from ".";
import { generateOTP } from "../../helper/utils";
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

/**
 *  otpExpiry is 10 minutes.
 * @param email
 * @returns
 */
export const createOTPAndUpdateUser = async (email: string) => {
  return await UserModel.findOneAndUpdate(
    { email },
    {
      $set: {
        otp: generateOTP(),
        otpExpiry: Date.now() + 10 * 60 * 1000,
      },
    },
    { new: true }
  );
};
