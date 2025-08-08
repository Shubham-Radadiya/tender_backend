import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import {
  createUnit,
  deleteUnitById,
  getUnit,
  getUnitById,
  IUnit,
  Unit,
  updateUnit,
} from "../../modules/unit";
import { UserRole } from "../../modules/user/schema";

export default class Controller {
  private readonly createUnitSchema = Joi.object({
    name: Joi.string().required().trim(),
    createdAt: Joi.date()
      .optional()
      .default(() => new Date()),
    updatedAt: Joi.date().optional(),
  });

  private readonly updateUnitSchema = Joi.object({
    name: Joi.string().optional().trim(),
    updatedAt: Joi.date()
      .optional()
      .default(() => new Date()),
  });

  protected readonly getUnit = async (req: Request, res: Response) => {
    try {
      const { data } = await getUnit();
      res.status(200).json({
        message: "Unit Listed",
        data,
      });
      return;
    } catch (error) {
      console.log("Error in getUnit", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly createUnit = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const user = req.authUser;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
      const payloadValue: IUnit = await this.createUnitSchema
        .validateAsync(payload)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          if (isError(e)) {
            res.status(422).json(e);
            return;
          } else {
            res.status(422).json({ message: e.message });
            return;
          }
        });
      if (!payloadValue) {
        return;
      }

      if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.COMPANY_MANAGER
      ) {
        res.status(422).json({ message: "Unauthorize Request." });
        return;
      }

      const newUnit = await createUnit(new Unit({ ...payloadValue }));
      res.status(201).json(newUnit);
      return;
    } catch (error) {
      console.log("Error in createUnit", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly updateUnit = async (req: Request, res: Response) => {
    try {
      const unitId = req.params.id;
      const user = req.authUser;
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
      const payloadValue: IUnit = await this.updateUnitSchema
        .validateAsync(payload)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          if (isError(e)) {
            res.status(422).json(e);
            return;
          } else {
            res.status(422).json({ message: e.message });
            return;
          }
        });
      if (!payloadValue) {
        return;
      }

      if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.COMPANY_MANAGER
      ) {
        res.status(422).json({ message: "Unauthorize Request." });
        return;
      }

      const existingUnit = await getUnitById(unitId);
      if (!existingUnit) {
        res.status(404).json({ message: "Unit not found" });
        return;
      }

      const updated = await updateUnit(
        new Unit({ ...existingUnit, ...payloadValue })
      );
      res.status(200).json(updated);
      return;
    } catch (error) {
      console.log("Error in updateUnit", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };

  protected readonly deleteUnitById = async (req: Request, res: Response) => {
    try {
      const unitId = req.params.id;
      const user = req.authUser;
      if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.COMPANY_MANAGER
      ) {
        res.status(422).json({ message: "Unauthorize Request." });
        return;
      }

      const existingUnit = await getUnitById(unitId);
      if (!existingUnit) {
        res.status(404).json({ message: "Unit not found" });
        return;
      }

      await deleteUnitById(unitId);
      res.status(200).json({ message: "Unit deleted successfully" });
      return;
    } catch (error) {
      console.log("Error in deleteUnit", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };
}
