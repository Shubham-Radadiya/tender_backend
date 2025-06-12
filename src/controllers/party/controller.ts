import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import { SHA256 } from "crypto-js";
import {
  createParty,
  deletePartyById,
  getParty,
  getPartyById,
  IParty,
  Party,
  updateParty,
} from "../../modules/party";
import { UserRole } from "../../modules/user/schema";

export default class Controller {
  private readonly createPartySchema = Joi.object({
    name: Joi.string().required().trim(),
    mobileNo: Joi.string()
      .pattern(/^\+\d{1,3}\d{7,15}$/)
      .required()
      .messages({
        "string.pattern.base":
          "Mobile number must be in E.164 format (e.g., +919876543210).",
      }),
    gstNo: Joi.string().optional(),
    // .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/)
    // .messages({
    //   "string.pattern.base": "GST number format is invalid.",
    // }),
    panNo: Joi.string().optional(),
    // .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    // .messages({
    //   "string.pattern.base": "PAN number format is invalid.",
    // }),
    address: Joi.string().optional().trim(),
    createdAt: Joi.date()
      .optional()
      .default(() => new Date()),
    updatedAt: Joi.date().optional(),
  });

  private readonly updatePartySchema = Joi.object({
    name: Joi.string().optional().trim(),
    mobileNo: Joi.string()
      .pattern(/^\+\d{1,3}\d{7,15}$/)
      .optional()
      .messages({
        "string.pattern.base":
          "Mobile number must be in E.164 format (e.g., +919876543210).",
      }),
    gstNo: Joi.string().optional(),
    // .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/)
    // .messages({
    //   "string.pattern.base": "GST number format is invalid.",
    // }),
    panNo: Joi.string().optional(),
    // .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    // .messages({
    //   "string.pattern.base": "PAN number format is invalid.",
    // }),
    address: Joi.string().optional().trim(),
    updatedAt: Joi.date()
      .optional()
      .default(() => new Date()),
  });

  protected readonly getParty = async (req: Request, res: Response) => {
    try {
      const user = req.authUser;
      const partyId = req.params.id;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      if (partyId) {
        const party = await getPartyById(partyId);
        res.status(200).json({ message: "Party Details", party });
        return;
      }
      const { partyList, totalCount } = await getParty(user._id, page, limit);
      res.status(200).json({
        message: "Party Listed",
        meta: {
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          pageSize: limit,
        },
        partyList,
      });
      return;
    } catch (error) {
      console.log("Error in getParty", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly createParty = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const user = req.authUser;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
      const payloadValue: IParty = await this.createPartySchema
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

      const newParty = await createParty(
        new Party({ ...payloadValue, createdBy: user._id })
      );
      res.status(201).json(newParty);
      return;
    } catch (error) {
      console.log("Error in createParty", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly updateParty = async (req: Request, res: Response) => {
    try {
      const partyId = req.params.id;
      const user = req.authUser;
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
      const payloadValue: IParty = await this.updatePartySchema
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

      const existingParty = await getPartyById(partyId);
      if (!existingParty) {
        res.status(404).json({ message: "Party not found" });
        return;
      }

      const updated = await updateParty(
        new Party({ ...existingParty, ...payloadValue })
      );
      res.status(200).json(updated);
      return;
    } catch (error) {
      console.log("Error in updateParty", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };

  protected readonly deleteParty = async (req: Request, res: Response) => {
    try {
      const partyId = req.params.id;
      const user = req.authUser;
      if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.COMPANY_MANAGER
      ) {
        res.status(422).json({ message: "Unauthorize Request." });
        return;
      }

      const existingParty = await getPartyById(partyId);
      if (!existingParty) {
        res.status(404).json({ message: "Party not found" });
        return;
      }

      await deletePartyById(partyId);
      res.status(200).json({ message: "Party deleted successfully" });
      return;
    } catch (error) {
      console.log("Error in deleteParty", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };
}
