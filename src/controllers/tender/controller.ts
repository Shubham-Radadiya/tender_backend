import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import { SHA256 } from "crypto-js";
import { createTender, deleteTenderById, getTender, getTenderById, ITender, Tender, updateTender } from "../../modules/tender";

export default class Controller {
  private readonly createTenderSchema = Joi.object({
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

  private readonly updateTenderSchema = Joi.object({
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

  protected readonly getTender = async (req: Request, res: Response) => {
    try {
      const tenderId = req.params.id;
      if (tenderId) {
        const tender = await getTenderById(tenderId)
        res.status(200).json({ message: "Tender Listed", tender });
        return;
      }
      const tenderList = await getTender()
      res.status(200).json({ message: "Tender Listed", tenderList });
      return;
    } catch (error) {
      console.log("Error in getTender", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  }

  protected readonly createTender = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const payloadValue: ITender = await this.createTenderSchema
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

      const newTender = await createTender(new Tender({ ...payloadValue }));
      res.status(201).json(newTender);
      return;
    } catch (error) {
      console.log("Error in createTender", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly updateTender = async (req: Request, res: Response) => {
    try {
      const tenderId = req.params.id;
      const payload = req.body;

      const payloadValue: ITender = await this.updateTenderSchema
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
      const existingTender = await getTenderById(tenderId);
      if (!existingTender) {
        res.status(404).json({ message: "Tender not found" });
        return;
      }

      const updated = await updateTender(
        new Tender({ ...existingTender, ...payloadValue })
      );
      res.status(200).json(updated);
      return;
    } catch (error) {
      console.log("Error in updateTender", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };

  protected readonly deleteTender = async (req: Request, res: Response) => {
    try {
      const tenderId = req.params.id;
      const existingTender = await getTenderById(tenderId);
      if (!existingTender) {
        res.status(404).json({ message: "Tender not found" });
        return;
      }

      await deleteTenderById(tenderId);
      res.status(200).json({ message: "Tender deleted successfully" });
      return;
    } catch (error) {
      console.log("Error in deleteTender", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };
}
