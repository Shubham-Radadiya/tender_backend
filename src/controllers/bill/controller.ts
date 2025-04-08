import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import { SHA256 } from "crypto-js";
import { createBill, deleteBillById, getBill, getBillById, IBill, Bill, updateBill } from "../../modules/bill";

export default class Controller {
  private readonly createBillSchema = Joi.object({
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

  private readonly updateBillSchema = Joi.object({
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

  protected readonly getBill = async (req: Request, res: Response) => {
    try {
      const billId = req.params.id;
      if (billId) {
        const bill = await getBillById(billId)
        res.status(200).json({ message: "Bill Listed", bill });
        return;
      }
      const billList = await getBill()
      res.status(200).json({ message: "Bill Listed", billList });
      return;
    } catch (error) {
      console.log("Error in getBill", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  }

  protected readonly createBill = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const payloadValue: IBill = await this.createBillSchema
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

      const newBill = await createBill(new Bill({ ...payloadValue }));
      res.status(201).json(newBill);
      return;
    } catch (error) {
      console.log("Error in createBill", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly updateBill = async (req: Request, res: Response) => {
    try {
      const billId = req.params.id;
      const payload = req.body;

      const payloadValue: IBill = await this.updateBillSchema
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
      const existingBill = await getBillById(billId);
      if (!existingBill) {
        res.status(404).json({ message: "Bill not found" });
        return;
      }

      const updated = await updateBill(
        new Bill({ ...existingBill, ...payloadValue })
      );
      res.status(200).json(updated);
      return;
    } catch (error) {
      console.log("Error in updateBill", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };

  protected readonly deleteBill = async (req: Request, res: Response) => {
    try {
      const billId = req.params.id;
      const existingBill = await getBillById(billId);
      if (!existingBill) {
        res.status(404).json({ message: "Bill not found" });
        return;
      }

      await deleteBillById(billId);
      res.status(200).json({ message: "Bill deleted successfully" });
      return;
    } catch (error) {
      console.log("Error in deleteBill", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };
}
