import { UserModel } from "./schema";

export const updateManyUser = async (userIds: string[], fields: any) => {
  const result = await UserModel.updateMany(
    { _id: { $in: userIds } },
    { $set: fields }
  );
  return result;
};