import { User } from ".";
import { UserModel } from "./schema";

export const getUser = async (role?: string, adminApprove?: boolean) => {
  const filter = role
    ? {
      role,
      // "companyDetails.adminApprove": adminApprove,
    }
    : {};
  const user = await UserModel.find(filter);
  return user ? user.map((item) => new User(item)) : null;
};

export const searchUser = async (search?: string) => {
  try {
    const query = search
      ? {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
        ],
      }
      : {};
    const users = await UserModel.find(query);
    return users.map((user) => new User(user));
  } catch (error) {
    console.error("Error searching for users:", error);
    throw new Error("Failed to search users. Please try again later.");
  }
};
