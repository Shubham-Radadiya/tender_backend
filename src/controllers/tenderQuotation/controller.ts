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
import { TenderModel } from "../../modules/tender/schema";
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

      const existingQuotations = await getTenderQuotationsByTenderId(
        payloadValue.tenderId.toString()
      );

      if (existingTender.companyAssigned) {
        const companyAssignedId = existingTender.companyAssigned.toString();

        const assignedCompanyQuotations = existingQuotations.filter(
          (q) =>
            typeof q.companyId !== "string" &&
            q.companyId._id?.toString() === companyAssignedId
        );

        if (assignedCompanyQuotations.length > 0) {
          let highestAssignedAmount = 0;

          for (const quotation of assignedCompanyQuotations) {
            let sum = 0;
            quotation.itemRates.forEach((item) => {
              sum += item.amount || 0;
            });
            if (sum > highestAssignedAmount) {
              highestAssignedAmount = sum;
            }
          }

          if (totalQuotationAmount < highestAssignedAmount) {
            return res.status(422).json({
              message: `Quotation amount (${totalQuotationAmount}) cannot be less than previously submitted amount (${highestAssignedAmount}) by the assigned company`,
            });
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
      const { companyAssigned, quotation: quotationPayloads } = req.body;

      if (
        !companyAssigned ||
        !Array.isArray(quotationPayloads) ||
        quotationPayloads.length === 0
      ) {
        return res.status(422).json({
          message:
            "`companyAssigned` and non-empty `quotation` array are required in the payload.",
        });
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

      const validatedPayloads: Partial<ITenderQuotation>[] = [];
      for (const quotation of quotationPayloads) {
        const validated = await this.updateTenderQuotationSchema.validateAsync(
          quotation
        );
        validatedPayloads.push(validated);
      }

      const assignedCompanyQuotations = validatedPayloads.filter(
        (q) => q.companyId?.toString() === companyAssigned.toString()
      );
      if (assignedCompanyQuotations.length > 0) {
        const winningQuotation = assignedCompanyQuotations.reduce(
          (max, curr) => {
            const currTotal =
              curr.itemRates?.reduce(
                (sum, item) => sum + (item.amount || 0),
                0
              ) || 0;
            const maxTotal =
              max.itemRates?.reduce(
                (sum, item) => sum + (item.amount || 0),
                0
              ) || 0;
            return currTotal > maxTotal ? curr : max;
          }
        );

        const winningTotal =
          winningQuotation.itemRates?.reduce(
            (sum, item) => sum + (item.amount || 0),
            0
          ) || 0;

        for (const q of validatedPayloads) {
          console.log("qTotal", q);
          const qTotal =
            q.itemRates?.reduce((sum, item) => sum + (item.amount || 0), 0) ||
            0;
          console.log(
            "qTotal < winningTotal",
            qTotal < winningTotal,
            qTotal,
            winningTotal
          );
          if (qTotal < winningTotal) {
            return res.status(422).json({
              message: `Quotation ${q.quotationId} amount (${qTotal}) cannot be less than the highest quotation of the assigned company (${winningTotal})`,
            });
          }
        }
      }

      const updatedQuotations = [];

      for (const validatedQuotation of validatedPayloads) {
        const { quotationId, ...updateData } = validatedQuotation;

        if (!quotationId) {
          return res
            .status(422)
            .json({ message: "Each quotation must include a quotationId." });
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
          ...validatedQuotation,
        };

        const updated = await updateTenderQuotation(
          new TenderQuotation(mergedQuotation)
        );
        const populated = await getPopulatedTenderQuotationById(updated._id);
        updatedQuotations.push(populated);
      }

      const tender = await TenderModel.findById(tenderId);
      if (!tender) {
        return res.status(404).json({ message: "Tender not found." });
      }

      tender.companyAssigned = companyAssigned;
      await tender.save();

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
