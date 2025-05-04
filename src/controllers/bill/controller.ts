import { Response } from "express";
import { Request } from "../../request";
import Joi, { any, isError } from "joi";
import { get as _get } from "lodash";

import {
  createBill,
  deleteBillById,
  getBill,
  getBillById,
  IBill,
  Bill,
  updateBill,
  getBillsByCompanyAndTenderId,
} from "../../modules/bill";
import { getTenderQuotationByTenderId } from "../../modules/tenderQuotation";

export default class Controller {
  private readonly createBillSchema = Joi.object({
    companyId: Joi.string().required(),
    tenderId: Joi.string().required(),
    amount: Joi.number().required(),
    taxPercent: Joi.number().required(),
    additionalCharges: Joi.number().required(),
    total: Joi.number().required(),
    status: Joi.string().required(),
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
        const bill = await getBillById(billId);
        res.status(200).json({ message: "Bill Listed", bill });
        return;
      }
      const billList = await getBill();
      res.status(200).json({ message: "Bill Listed", billList });
      return;
    } catch (error) {
      console.log("Error in getBill", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly createBill = async (req: Request, res: Response) => {
    try {
      const payload = { ...req.body, companyId: req.authUser._id };

      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
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
      const tenderAmount = await getTenderQuotationByTenderId(payload.tenderId);
      const totalAmount = tenderAmount?.itemRates?.reduce((sum, item) => {
        return sum + item?.amount;
      }, 0);
      const amountData = await getBillsByCompanyAndTenderId(
        req.authUser._id,
        payload.tenderId
      );
      const totalBillAmount = amountData.reduce((sum, bill) => {
        return sum + bill?.amount;
      }, 0);

      if (totalBillAmount + payloadValue.amount > totalAmount) {
        res.status(422).json({
          message: `The amount is too large you can not add more then ${
            totalAmount - totalBillAmount
          }.`,
        });
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
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
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
