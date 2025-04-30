import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import { SHA256 } from "crypto-js";
import {
  createTender,
  deleteTenderById,
  getTender,
  getTenderById,
  // getTenderForGM,
  ITender,
  Tender,
  updateTender,
} from "../../modules/tender";
import {
  createTenderQuotation,
  deleteTenderQuotationById,
  getTenderQuotationById,
  ITenderQuotation,
  TenderQuotation,
  updateTenderQuotation,
} from "../../modules/tenderQuotation";
import { getUserById } from "../../modules/user";

export default class Controller {
  private readonly createTenderQuotationSchema = Joi.object({
    tenderId: Joi.string().required(),
    companyId: Joi.string().required(),
    quotationNumber: Joi.number().required(),
    tenderFee: Joi.number().required(),
    emd: Joi.number().required(),
    receipts: Joi.array().items(Joi.string()).default([]),
    itemRates: Joi.array()
      .items(
        Joi.object({
          itemId: Joi.string().required(),
          rate: Joi.number().required(),
          amount: Joi.number().optional(),
        })
      )
      .required(),
  });

  private readonly updateTenderQuotationSchema = Joi.object({
    tenderId: Joi.string(),
    companyId: Joi.string(),
    quotationNumber: Joi.number(),
    tenderFee: Joi.number(),
    emd: Joi.number(),
    receipts: Joi.array().items(Joi.string()),
    itemRates: Joi.array().items(
      Joi.object({
        itemId: Joi.string().required(),
        rate: Joi.number().required(),
        amount: Joi.number(),
      })
    ),
  });

  protected readonly createTenderQuotation = async (
    req: Request,
    res: Response
  ) => {
    try {
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
      const payloadValue: ITenderQuotation =
        await this.createTenderQuotationSchema
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
      let totalSpend = 0;
      payloadValue.itemRates.map((item) => {
        totalSpend += item.amount;
      });
      const companyData = await getUserById(payloadValue?.companyId.toString());

      if (totalSpend > companyData.companyDetails.annualTenderCap) {
        res.status(422).json({
          message: `You Can Only Spend ${companyData.companyDetails.annualTenderCap}`,
        });
        return;
      }
      const newQuotation = await createTenderQuotation(
        new TenderQuotation({ ...payloadValue })
      );
      res.status(201).json(newQuotation);
      return;
    } catch (error) {
      console.log("Error in createTenderQuotation ", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly updateTenderQuotation = async (
    req: Request,
    res: Response
  ) => {
    try {
      const tenderQuotationId = req.params.id;
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
      const payloadValue: Partial<ITender> =
        await this.updateTenderQuotationSchema
          .validateAsync(payload)
          .then((value) => value)
          .catch((e) => {
            console.log(e);
            res.status(422).json(isError(e) ? e : { message: e.message });
            return null;
          });

      if (!payloadValue) return;

      const existingTenderQuotation = await getTenderQuotationById(
        tenderQuotationId
      );
      if (!existingTenderQuotation) {
        res.status(404).json({ message: "Tender Quotation not found" });
        return;
      }

      const mergedTenderQuotation = {
        ...existingTenderQuotation,
        ...payloadValue,
      };

      const updatedTenderQuotation = await updateTenderQuotation(
        new TenderQuotation(mergedTenderQuotation)
      );
      res.status(200).json(updatedTenderQuotation);
      return;
    } catch (error) {
      console.log("Error in update Tender Quotation", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };

  protected readonly deleteTenderQuotation = async (
    req: Request,
    res: Response
  ) => {
    try {
      const tenderQuotationId = req.params.id;

      const existingTenderQuotation = await getTenderQuotationById(
        tenderQuotationId
      );
      if (!existingTenderQuotation) {
        res.status(404).json({ message: "Tender Quotation not found" });
        return;
      }

      await deleteTenderQuotationById(tenderQuotationId);
      res
        .status(200)
        .json({ message: "Tender Quotation deleted successfully" });
      return;
    } catch (error) {
      console.log("Error in deleteTenderQuotation", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };
}
