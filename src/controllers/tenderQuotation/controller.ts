import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import {
  getTenderById,
  // getTenderForGM,
  ITender,
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
  });

  private readonly updateTenderQuotationSchema = Joi.object({
    tenderId: Joi.string().optional(),
    companyId: Joi.string().optional(),
    quotationNumber: Joi.number().optional(),
    tenderFee: Joi.number().optional(),
    emd: Joi.number().optional(),
    receipts: Joi.array().items(Joi.string()).optional(),
    itemRates: Joi.array().items(
      Joi.object({
        itemId: Joi.string().optional(),
        rate: Joi.number().optional(),
        amount: Joi.number().optional(),
      }).optional()
    ),
  });

  protected readonly createTenderQuotation = async (
    req: Request,
    res: Response
  ) => {
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

      if (existingTender.status !== TenderStatus.GM_ACCEPTED) {
        res.status(400).json({
          message: "Tender must be ACCEPTED By GM.",
        });
        return;
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

      if (totalQuotationAmount > companyData.companyDetails.annualTenderCap) {
        res.status(422).json({
          message: `Quotation amount (${totalQuotationAmount}) exceeds company's annual tender cap (${companyData.companyDetails.annualTenderCap})`,
        });
        return;
      }

      // Get existing quotations for this tender
      const existingQuotations = await getTenderQuotationsByTenderId(
        payloadValue.tenderId.toString()
      );

      // If this is not the first quotation, check against winning company's quotation
      if (existingQuotations.length > 0) {
        // Find winning company's quotation
        const winningCompanyQuotation = existingQuotations.find(
          (q) =>
            q.companyId.toString() ===
            existingTender.companyAssigned?.toString()
        );

        if (winningCompanyQuotation) {
          // Calculate winning company's total amount
          let winningCompanyTotal = 0;
          winningCompanyQuotation.itemRates.forEach((item) => {
            winningCompanyTotal += item.amount || 0;
          });

          // If current company is not the winning company, validate their quotation amount
          if (
            payloadValue.companyId.toString() !==
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

  protected readonly updateTenderQuotation = async (
    req: Request,
    res: Response
  ) => {
    try {
      const authUser = req.authUser;
      const tenderQuotationId = req.params.id;
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
      const payloadValue: Partial<ITenderQuotation> =
        await this.updateTenderQuotationSchema
          .validateAsync(payload)
          .then((value) => value)
          .catch((e) => {
            console.log(e);
            res.status(422).json(isError(e) ? e : { message: e.message });
            return null;
          });

      if (!payloadValue) return;

      if (
        authUser.role !== UserRole.ADMIN &&
        authUser.role !== UserRole.GROUP_MANAGER &&
        authUser.role !== UserRole.TENDER_MANAGER
      ) {
        res.status(422).json({ message: "Not have permission to change." });
        return;
      }

      const existingTenderQuotation: any = await getTenderQuotationById(
        tenderQuotationId
      );
      if (!existingTenderQuotation) {
        res.status(404).json({ message: "Tender Quotation not found" });
        return;
      }

      // if (payloadValue?.companyId.toString()) {
      //   if (
      //     existingTenderQuotation?.companyId.toString() !==
      //     payloadValue?.companyId.toString()
      //   ) {
      //     res.status(404).json({ message: "Mis-Match Company Id." });
      //     return;
      //   }
      // }
      const mergedTenderQuotation = {
        ...existingTenderQuotation,
        ...payloadValue,
      };

      if (payloadValue.itemRates) {
        const companyData = await getUserById(mergedTenderQuotation.companyId);
        let totalQuotationAmount = 0;
        payloadValue.itemRates.forEach((item) => {
          totalQuotationAmount += item.amount || 0;
        });

        if (totalQuotationAmount > companyData.companyDetails.annualTenderCap) {
          res.status(422).json({
            message: `Quotation amount (${totalQuotationAmount}) exceeds company's annual tender cap (${companyData.companyDetails.annualTenderCap})`,
          });
          return;
        }
      }

      const updatedTenderQuotation = await updateTenderQuotation(
        new TenderQuotation(mergedTenderQuotation)
      );
      if (
        authUser.role !== UserRole.TENDER_MANAGER &&
        payloadValue?.tenderFee &&
        payloadValue?.receipts
      ) {
        const tenderDetails = await getTenderById(
          existingTenderQuotation.tenderId
        );
        await sendNotification(
          tenderDetails.companyAssigned,
          tenderDetails._id,
          NotificationType.TENDER_APPROVED_BY_TM,
          `New Tender ${tenderDetails.name} has been created and assigned to you`
        );
      }
      const populatedTQ = await getPopulatedTenderQuotationById(
        updatedTenderQuotation._id
      );
      res.status(200).json({ updatedTenderQuotation: populatedTQ });
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
