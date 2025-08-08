import { Unit } from ".";
import { UserModel } from "../user/schema";
import { UnitModel } from "./schema";

export const getUnit = async () => {
  const units = await UnitModel.find().lean();
  return {
    data: units.map((unit) => new Unit(unit)),
  };
};
