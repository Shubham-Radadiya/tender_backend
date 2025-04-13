import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import { SHA256 } from "crypto-js";
import {
  createDepartment,
  deleteDepartmentById,
  getDepartment,
  getDepartmentById,
  IDepartment,
  Department,
  updateDepartment,
} from "../../modules/department";

export default class Controller {
  private readonly createDepartmentSchema = Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    link: Joi.string().required(),
  });

  private readonly updateDepartmentSchema = Joi.object({
    name: Joi.string().optional(),
    address: Joi.string().optional(),
    link: Joi.string().optional(),
  });

  protected readonly getDepartment = async (req: Request, res: Response) => {
    try {
      const departmentId = req.params.id;
      if (departmentId) {
        const department = await getDepartmentById(departmentId);
        res.status(200).json({ message: "Department Listed", department });
        return;
      }
      const departmentList = await getDepartment();
      res.status(200).json({ message: "Department Listed", departmentList });
      return;
    } catch (error) {
      console.log("Error in getDepartment", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly createDepartment = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const payloadValue: IDepartment = await this.createDepartmentSchema
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

      const newDepartment = await createDepartment(
        new Department({ ...payloadValue })
      );
      res.status(201).json(newDepartment);
      return;
    } catch (error) {
      console.log("Error in createDepartment", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly updateDepartment = async (req: Request, res: Response) => {
    try {
      const departmentId = req.params.id;
      const payload = req.body;

      const payloadValue: IDepartment = await this.updateDepartmentSchema
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
      const existingDepartment = await getDepartmentById(departmentId);
      if (!existingDepartment) {
        res.status(404).json({ message: "Department not found" });
        return;
      }

      const updated = await updateDepartment(
        new Department({ ...existingDepartment, ...payloadValue })
      );
      res.status(200).json(updated);
      return;
    } catch (error) {
      console.log("Error in updateDepartment", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };

  protected readonly deleteDepartment = async (req: Request, res: Response) => {
    try {
      const departmentId = req.params.id;
      const existingDepartment = await getDepartmentById(departmentId);
      if (!existingDepartment) {
        res.status(404).json({ message: "Department not found" });
        return;
      }

      await deleteDepartmentById(departmentId);
      res.status(200).json({ message: "Department deleted successfully" });
      return;
    } catch (error) {
      console.log("Error in deleteDepartment", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };
}
