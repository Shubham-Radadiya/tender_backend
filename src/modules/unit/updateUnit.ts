import { Unit } from ".";
import { UnitModel } from "./schema";

/**
 *
 * @param party
 * @returns update party record
 */
export const updateUnit = async (party: Unit) => {
  await UnitModel.findByIdAndUpdate(party._id, party.toJSON());
  return party;
};
