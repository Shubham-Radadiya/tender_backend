import { Unit } from ".";
import { UnitModel } from "./schema";

/**
 *
 * @param _id party id
 * @returns relevant party record | null
 */
export const getUnitById = async (_id: string) => {
  const party = await UnitModel.findById(_id);
  return party ? new Unit(party) : null;
};
