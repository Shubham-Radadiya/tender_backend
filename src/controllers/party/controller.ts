import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import { SHA256 } from "crypto-js";
import { createParty, deletePartyById, getParty, getPartyById, IParty, Party, updateParty } from "../../modules/party";

export default class Controller {
  private readonly createPartySchema = Joi.object({
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

  private readonly updatePartySchema = Joi.object({
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

  protected readonly getParty = async (req: Request, res: Response) => {
    try {
      const partyId = req.params.id;
      if (partyId) {
        const party = await getPartyById(partyId)
        res.status(200).json({ message: "Party Listed", party });
        return;
      }
      const partyList = await getParty()
      res.status(200).json({ message: "Party Listed", partyList });
      return;
    } catch (error) {
      console.log("Error in getParty", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  }

  protected readonly createParty = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
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

      const newParty = await createParty(new Party({ ...payloadValue }));
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
      const payload = req.body;

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
