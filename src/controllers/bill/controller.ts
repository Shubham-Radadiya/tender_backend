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
import { BillStatus } from "../../modules/bill/schema";
import { UserRole } from "../../modules/user/schema";
import { getTenderById } from "../../modules/tender";
import { getTenderTitle } from "../../modules/tender/stripTenderName";
import {
  generateInvoiceNumber,
  resolveCompanyName,
} from "../../helper/generateInvoiceNumber";
import { sendNotification } from "../../helper/sendNotification";
import { getGM, getTM } from "../../modules/user";
import { NotificationType } from "../../modules/notification/schema";
import { getWorkOrderById } from "../../modules/workOrder";

export default class Controller {
  private readonly createBillSchema = Joi.object({
    companyId: Joi.string().required(),
    workOrderId: Joi.string().required(),
    amount: Joi.number().required(),
    taxPercent: Joi.number().required(),
    tdsPercent: Joi.number().optional().allow(null, ""),
    labourPercent: Joi.number().optional().allow(null, ""),
    // additionalCharges: Joi.number().required(),
    invoiceNumber: Joi.string().optional(),
    address: Joi.string().optional(),
    subject: Joi.string().optional(),
    from: Joi.string().optional(),
    status: Joi.string().optional(),
  });

  private readonly updateBillSchema = Joi.object({
    companyId: Joi.string().optional(),
    workOrderId: Joi.string().optional(),
    // amount: Joi.number().optional(),
    taxPercent: Joi.number().optional(),
    tdsPercent: Joi.number().optional().allow(null, ""),
    labourPercent: Joi.number().optional().allow(null, ""),
    // additionalCharges: Joi.number().optional(),
    total: Joi.number().optional(),
    invoiceNumber: Joi.string().optional(),
    address: Joi.string().optional(),
    subject: Joi.string().optional(),
    from: Joi.string().optional(),
    status: Joi.string().optional(),
  });

  private readonly updateBillStatusSchema = Joi.object({
    status: Joi.string().valid("SAVED", "PAID").required(),
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

  protected readonly getBillByworkOrderId = async (
    req: Request,
    res: Response
  ) => {
    try {
      const authUser = req.authUser;
      const workOrderId = req.params.workOrderId;

      if (!workOrderId) {
        res.status(422).json({ message: "workOrderId not found." });
        return;
      }
      const existingWorkOrder = await getWorkOrderById(workOrderId);
      if (!existingWorkOrder) {
        res.status(422).json({ message: "Invalid workOrderId" });
        return;
      }

      const billList = await getBillsByCompanyAndTenderId(
        authUser._id,
        workOrderId
      );
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
      const authUser = req.authUser;

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
      if (
        authUser.role !== UserRole.COMPANY_MANAGER &&
        authUser.role !== UserRole.BANK_MANAGER
      ) {
        res.status(422).json({ message: "Not have permission to generate." });
        return;
      }

      const workOrderTender = await getWorkOrderById(payload.workOrderId);
      if (!workOrderTender) {
        res.status(422).json({ message: "Invalid workOrder." });
        return;
      }
      // if (
      //   existingTender.companyAssigned.toString() !== authUser._id.toString()
      // ) {
      //   res.status(422).json({ message: "Not have permission to generate." });
      //   return;
      // }

      // right now use total Amount from payload

      // const tenderAmount = await getTenderQuotationByTenderId(payload.tenderId);
      // const totalAmount = tenderAmount?.itemRates?.reduce((sum, item) => {
      //   return sum + item?.amount;
      // }, 0);

      const totalAmount = workOrderTender.amount;
      console.log("totalAmount :", totalAmount);
      const amountData = await getBillsByCompanyAndTenderId(
        req.authUser._id,
        payload.workOrderId
      );

      const amount = Number(payloadValue.amount) || 0;
      const taxPercent = Number(payloadValue.taxPercent) || 0;
      const tdsPercent = Number(payloadValue.tdsPercent) || 0;
      const labourPercent = Number(payloadValue.labourPercent) || 0;
      const round2 = (value: number): number => {
        return Math.round((value + Number.EPSILON) * 100) / 100;
      };
      const totalBillAmount = round2(
        amountData.reduce((sum, bill) => sum + (bill?.amount || 0), 0)
      );

      const billAmount = round2(amount * (1 + taxPercent / 100 + tdsPercent / 100 + labourPercent / 100));
      if (totalBillAmount + billAmount === totalAmount) {
        // This handles both cases: if tenderId is a string OR if it is a populated object
        const tenderId =
          typeof workOrderTender.tenderId === "string"
            ? workOrderTender.tenderId
            : workOrderTender.tenderId._id.toString();
        const tender = await getTenderById(tenderId);
        const getTMData = await getTM();
        const getGMData = await getGM();

        await sendNotification(
          getTMData._id,
          NotificationType.payment_COMPLETED,
          `Payment completed for tender ${getTenderTitle(tender)} ${
            workOrderTender.title
              ? `related to work order ${workOrderTender.title}`
              : ""
          }`
        );

        await sendNotification(
          getGMData._id,
          NotificationType.payment_COMPLETED,
          `Payment completed for tender ${getTenderTitle(tender)} ${
            workOrderTender.title
              ? `related to work order ${workOrderTender.title}`
              : ""
          }`
        );
      }

      if (totalBillAmount + billAmount > totalAmount) {
        res.status(422).json({
          message: `The amount is too large you can not add more then ${
            totalAmount - totalBillAmount
          }.`,
        });
        return;
      }
      let invoiceNumber;
      if (payload?.invoiceNumber) {
        invoiceNumber = payload?.invoiceNumber;
      } else if (workOrderTender.invoiceNumber) {
        invoiceNumber = String(workOrderTender.invoiceNumber);
      } else {
        const tenderCompany =
          typeof workOrderTender.tenderId === "object"
            ? workOrderTender.tenderId?.companyAssigned
            : null;
        const companyName =
          tenderCompany && typeof tenderCompany === "object"
            ? resolveCompanyName(tenderCompany)
            : resolveCompanyName(authUser);

        invoiceNumber = await generateInvoiceNumber(authUser, { companyName });
      }

      const newBill = await createBill(
        new Bill({
          ...payloadValue,
          status: BillStatus.SAVED,
          invoiceNumber,
          amount: billAmount,
        })
      );
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

  protected readonly updateBillStatus = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      const billId = req.params.id;
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
      const payloadValue: IBill = await this.updateBillStatusSchema
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

      if (existingBill.companyId.toString() !== authUser._id.toString()) {
        res.status(422).json({ message: "Not have permission to update." });
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
