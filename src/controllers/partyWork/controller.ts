import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import { SHA256 } from "crypto-js";
import {
  createPartyWork,
  deletePartyWorkById,
  getPartyWork,
  getPartyWorkById,
  IPartyWork,
  PartyWork,
  updatePartyWork,
} from "../../modules/partyWork";

export default class Controller {
  private readonly createPartyWorkSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    dob: Joi.date().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string()
      .min(6)
      .custom((v) => {
        return SHA256(v).toString();
      })
      .required(),
    phoneNumber: Joi.string().required(),
    profile: Joi.string().optional(),
    role: Joi.string()
      .valid(
        "ADMIN",
        "TENDER_MANAGER",
        "GROUP_MANAGER",
        "COMPANY_MANAGER",
        "BANK_MANAGER"
      )
      .required(),
    companyDetails: Joi.object({
      companyName: Joi.string(),
      businessEmail: Joi.string().email(),
      aadharNumber: Joi.string(),
      panNumber: Joi.string(),
      userName: Joi.string(),
      companyPhone: Joi.string(),
      gstUsername: Joi.string(),
      gstNumber: Joi.string(),
      ifscCode: Joi.string(),
      website: Joi.string(),
    }).optional(),
  });

  private readonly updatePartyWorkSchema = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    dob: Joi.date().optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .optional(),
    password: Joi.string().min(6).optional(),
    phoneNumber: Joi.string().optional(),
    profile: Joi.string().optional(),
    role: Joi.string()
      .valid(
        "ADMIN",
        "TENDER_MANAGER",
        "GROUP_MANAGER",
        "COMPANY_MANAGER",
        "BANK_MANAGER"
      )
      .optional(),
    companyDetails: Joi.object({
      companyName: Joi.string(),
      businessEmail: Joi.string().email(),
      aadharNumber: Joi.string(),
      panNumber: Joi.string(),
      userName: Joi.string(),
      companyPhone: Joi.string(),
      gstUsername: Joi.string(),
      gstNumber: Joi.string(),
      ifscCode: Joi.string(),
      website: Joi.string(),
    }).optional(),
  });

  protected readonly getPartyWork = async (req: Request, res: Response) => {
    try {
      const partyWorkId = req.params.id;
      if (partyWorkId) {
        const partyWork = await getPartyWorkById(partyWorkId);
        res.status(200).json({ message: "PartyWork Listed", partyWork });
        return;
      }
      const partyWorkList = await getPartyWork();
      res.status(200).json({ message: "PartyWork Listed", partyWorkList });
      return;
    } catch (error) {
      console.log("Error in getPartyWork", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly createPartyWork = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
      const payloadValue: IPartyWork = await this.createPartyWorkSchema
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

      const newPartyWork = await createPartyWork(
        new PartyWork({ ...payloadValue })
      );
      res.status(201).json(newPartyWork);
      return;
    } catch (error) {
      console.log("Error in createPartyWork", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly updatePartyWork = async (req: Request, res: Response) => {
    try {
      const partyWorkId = req.params.id;
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
      const payloadValue: IPartyWork = await this.updatePartyWorkSchema
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
      const existingPartyWork = await getPartyWorkById(partyWorkId);
      if (!existingPartyWork) {
        res.status(404).json({ message: "PartyWork not found" });
        return;
      }

      const updated = await updatePartyWork(
        new PartyWork({ ...existingPartyWork, ...payloadValue })
      );
      res.status(200).json(updated);
      return;
    } catch (error) {
      console.log("Error in updatePartyWork", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };

  protected readonly deletePartyWork = async (req: Request, res: Response) => {
    try {
      const partyWorkId = req.params.id;
      const existingPartyWork = await getPartyWorkById(partyWorkId);
      if (!existingPartyWork) {
        res.status(404).json({ message: "PartyWork not found" });
        return;
      }

      await deletePartyWorkById(partyWorkId);
      res.status(200).json({ message: "PartyWork deleted successfully" });
      return;
    } catch (error) {
      console.log("Error in deletePartyWork", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };
}
