import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import {
  getTenderById,
  // getTenderForGM,
  ITender,
  Tender,
  updateTender,
} from "../../modules/tender";
import { TenderStatus } from "../../modules/tender/schema";
import {
  createTenderQuotation,
  deleteTenderQuotationById,
  getTenderQuotationById,
  ITenderQuotation,
  TenderQuotation,
  updateTenderQuotation,
  getTenderQuotationsByTenderId,
  getPopulatedTenderQuotationById,
} from "../../modules/tenderQuotation";
import { getUserById } from "../../modules/user";
import { UserRole } from "../../modules/user/schema";
import { sendNotification } from "../../helper/sendNotification";
import { NotificationType } from "../../modules/notification/schema";

export default class Controller {
  private readonly createTenderQuotationSchema = Joi.object({
    tenderId: Joi.string().required(),
    companyId: Joi.string().required(),
    itemRates: Joi.array()
      .items(
        Joi.object({
          itemId: Joi.string().required(),
          rate: Joi.number().required(),
          amount: Joi.number().optional(),
        })
      )
      .required(),
    termsAndConditions: Joi.string().optional(),
    form: Joi.string().optional(),
    to: Joi.string().optional(),
    refOne: Joi.string().optional(),
    refTwo: Joi.string().optional(),
  });

  private readonly updateTenderQuotationSchema = Joi.object({
    quotationId: Joi.string().required(),
    companyId: Joi.string().optional(),
    quotationNumber: Joi.number().optional(),
    tenderFee: Joi.number().optional(),
    emd: Joi.number().optional(),
    date: Joi.date().optional(),
    receipt: Joi.string().optional(),
    fee: Joi.number().optional(),
    itemRates: Joi.array()
      .items(
        Joi.object({
          itemId: Joi.string().optional(),
          rate: Joi.number().optional(),
          amount: Joi.number().optional(),
        })
      )
      .optional(),
  });

  protected readonly createTenderQuotation = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const authUser = req.authUser;
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

      if (
        authUser.role !== UserRole.ADMIN &&
        authUser.role !== UserRole.GROUP_MANAGER
      ) {
        res.status(422).json({ message: "Not have permission to create." });
        return;
      }

      // Check if tender exists and is in GM_ACCEPTED state
      const existingTender = await getTenderById(
        payloadValue.tenderId.toString()
      );
      if (!existingTender) {
        res.status(404).json({ message: "Tender not found" });
        return;
      }

      if (existingTender?.tenderType === "LTD") {
        const missingFields = [];

        if (!payloadValue.termsAndConditions)
          missingFields.push("termsAndConditions");
        if (!payloadValue.form) missingFields.push("form");
        if (!payloadValue.to) missingFields.push("to");
        if (!payloadValue.refOne) missingFields.push("refOne");
        if (!payloadValue.refTwo) missingFields.push("refTwo");

        if (missingFields.length > 0) {
          return res.status(422).json({
            message: `Missing required fields for LTD tender: ${missingFields.join(
              ", "
            )}`,
          });
        }
      } else {
        delete payloadValue.termsAndConditions;
        delete payloadValue.form;
        delete payloadValue.to;
        delete payloadValue.refOne;
        delete payloadValue.refTwo;
      }

      // Calculate total quotation amount
      let totalQuotationAmount = 0;
      payloadValue.itemRates.forEach((item) => {
        totalQuotationAmount += item.amount || 0;
      });

      // Get company data and check annual tender cap
      const companyData = await getUserById(payloadValue.companyId.toString());
      if (!companyData) {
        res.status(404).json({ message: "Company not found" });
        return;
      }
      // if (totalQuotationAmount > companyData.companyDetails.annualTenderCap) {
      //   res.status(422).json({
      //     message: `Quotation amount (${totalQuotationAmount}) exceeds company's annual tender cap (${companyData.companyDetails.annualTenderCap})`,
      //   });
      //   return;
      // }

      // Get existing quotations for this tender
      const existingQuotations = await getTenderQuotationsByTenderId(
        payloadValue.tenderId.toString()
      );

      // If this is not the first quotation, check against winning company's quotation
      if (existingQuotations.length > 0) {
        // Find winning company's quotation
        const winningCompanyQuotation = existingQuotations.find(
          (q) =>
            typeof q.companyId !== "string" &&
            q.companyId._id?.toString() ===
              existingTender.companyAssigned?.toString()
        );

        if (winningCompanyQuotation) {
          let winningCompanyTotal = 0;
          winningCompanyQuotation.itemRates.forEach((item) => {
            winningCompanyTotal += item.amount || 0;
          });

          if (
            payloadValue.companyId.toString() ===
            existingTender.companyAssigned?.toString()
          ) {
            if (totalQuotationAmount < winningCompanyTotal) {
              res.status(422).json({
                message: `Quotation amount (${totalQuotationAmount}) cannot be less than winning company's amount (${winningCompanyTotal})`,
              });
              return;
            }
          }
        }
      }

      // Create the quotation
      const newQuotation = await createTenderQuotation(
        new TenderQuotation({ ...payloadValue })
      );

      const populatedTQ = await getPopulatedTenderQuotationById(
        newQuotation._id
      );
      res.status(201).json({
        message: "Quotation created successfully",
        quotation: populatedTQ,
      });
      return;
    } catch (error) {
      console.log("Error in createTenderQuotation ", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly updateTenderQuotations = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const authUser = req.authUser;
      const tenderId = req.params.id;
      const payload = req.body;
      if (!Array.isArray(payload) || payload.length === 0) {
        return res
          .status(422)
          .json({ message: "Payload must be a non-empty array" });
      }

      if (
        authUser.role !== UserRole.ADMIN &&
        authUser.role !== UserRole.GROUP_MANAGER &&
        authUser.role !== UserRole.TENDER_MANAGER
      ) {
        return res.status(403).json({
          message: "You do not have permission to update quotations.",
        });
      }

      const updatedQuotations = [];

      for (const quotationPayload of payload) {
        const validatedPayload: Partial<ITenderQuotation> =
          await this.updateTenderQuotationSchema.validateAsync(
            quotationPayload
          );

        const { quotationId, ...updateData } = validatedPayload;

        if (!quotationId) {
          return res
            .status(422)
            .json({ message: "Each object must contain a quotationId" });
        }
        const existingQuotation = await getTenderQuotationById(quotationId);
        if (!existingQuotation) {
          return res.status(404).json({
            message: `Tender Quotation not found for ID ${quotationId}`,
          });
        }

        if (existingQuotation.tenderId.toString() !== tenderId) {
          return res.status(400).json({
            message: `Quotation ${quotationId} does not belong to tender ${tenderId}`,
          });
        }

        const mergedQuotation = {
          ...existingQuotation,
          ...validatedPayload,
        };

        if (validatedPayload.itemRates) {
          let totalQuotationAmount = 0;
          validatedPayload.itemRates.forEach((item) => {
            totalQuotationAmount += item.amount || 0;
          });

          const existingTender = await getTenderById(tenderId);
          const existingQuotations = await getTenderQuotationsByTenderId(
            tenderId
          );

          const winningQuotation = existingQuotations.find(
            (q) =>
              typeof q.companyId !== "string" &&
              q.companyId._id?.toString() ===
                existingTender.companyAssigned?.toString()
          );

          if (winningQuotation) {
            const isSameQuotation =
              winningQuotation._id?.toString() ===
              existingQuotation._id?.toString();
            const isSameCompany =
              existingQuotation.companyId.toString() ===
              existingTender.companyAssigned?.toString();

            let winningTotal = 0;
            winningQuotation.itemRates.forEach((item) => {
              winningTotal += item.amount || 0;
            });

            if (
              isSameCompany &&
              !isSameQuotation &&
              totalQuotationAmount < winningTotal
            ) {
              return res.status(422).json({
                message: `Quotation ${quotationId} amount (${totalQuotationAmount}) cannot be less than winning quotation amount (${winningTotal})`,
              });
            }
          }
        }

        const updated = await updateTenderQuotation(
          new TenderQuotation(mergedQuotation)
        );
        const populated = await getPopulatedTenderQuotationById(updated._id);
        updatedQuotations.push(populated);
      }

      res.status(200).json({
        message: "Tender Quotations updated successfully",
        updatedTenderQuotations: updatedQuotations,
      });
    } catch (error) {
      console.error("Error in updateTenderQuotations", error);
      res.status(500).json({ message: error.message });
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
