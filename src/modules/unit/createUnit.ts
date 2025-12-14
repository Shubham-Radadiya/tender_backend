import { Unit } from ".";
import { UnitModel } from "./schema";

/**
 * Create a new party record
 * @param party - Party object
 * @returns Created party
 */
export const createUnit = async (party: Unit) => {
  const newParty = await UnitModel.create(party.toJSON());
  return new Unit(newParty.toObject());
};
