import { UnitModel } from "./schema";

/**
 * will delete party
 * @param _id
 */
export const deleteUnitById = async (_id: string) => {
  await UnitModel.findByIdAndDelete(_id);
};
