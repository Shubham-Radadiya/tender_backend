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
  private readonly createMultipleTenderQuotationSchema = Joi.array().items(
    Joi.object({
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
    })
  );

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
      const { companyAssigned, quotations } = req.body;

      if (
        !companyAssigned ||
        !Array.isArray(quotations) ||
        quotations.length === 0
      ) {
        return res.status(422).json({
          message:
            "`companyAssigned` and non-empty `quotations` array are required.",
        });
      }

      if (
        authUser.role !== UserRole.ADMIN &&
        authUser.role !== UserRole.GROUP_MANAGER
      ) {
        return res.status(403).json({
          message: "You do not have permission to create quotations.",
        });
      }

      const validatedQuotations: ITenderQuotation[] =
        await this.createMultipleTenderQuotationSchema.validateAsync(
          quotations
        );

      const tenderId = validatedQuotations[0].tenderId;
      if (validatedQuotations.some((q) => q.tenderId !== tenderId)) {
        return res.status(400).json({
          message: "All quotations must belong to the same tender.",
        });
      }

      const tender = await TenderModel.findById(tenderId);
      if (!tender) {
        return res.status(404).json({ message: "Tender not found." });
      }

      const createdQuotations = [];

      for (const q of validatedQuotations) {
        if (tender.tenderType === "LTD") {
          const missing = [];
          if (!q.termsAndConditions) missing.push("termsAndConditions");
          if (!q.form) missing.push("form");
          if (!q.to) missing.push("to");
          if (!q.refOne) missing.push("refOne");
          if (!q.refTwo) missing.push("refTwo");

          if (missing.length > 0) {
            return res.status(422).json({
              message: `Missing fields for LTD tender: ${missing.join(", ")}`,
            });
          }
        } else {
          delete q.termsAndConditions;
          delete q.form;
          delete q.to;
          delete q.refOne;
          delete q.refTwo;
        }
      }

      const assignedCompanyQuotations = validatedQuotations.filter(
        (q) => q.companyId?.toString() === companyAssigned.toString()
      );

      if (assignedCompanyQuotations.length > 0) {
        const maxExistingAmount = Math.max(
          ...assignedCompanyQuotations.map(
            (q) =>
              q.itemRates?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0
          )
        );

        for (const q of validatedQuotations) {
          const totalAmount =
            q.itemRates?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0;

          if (totalAmount < maxExistingAmount) {
            return res.status(422).json({
              message: `Quotation amount (${totalAmount}) cannot be less than previous max (${maxExistingAmount}) for assigned company.`,
            });
          }
        }
      }

      for (const q of validatedQuotations) {
        const created = await createTenderQuotation(
          new TenderQuotation({ ...q })
        );
        const populated = await getPopulatedTenderQuotationById(created._id);
        createdQuotations.push(populated);
      }

      tender.companyAssigned = companyAssigned;
      await tender.save();

      return res.status(201).json({
        message: "Quotations created successfully.",
        quotations: createdQuotations,
      });
    } catch (error) {
      console.error("Error in createTenderQuotations", error);
      return res.status(500).json({ message: error.message });
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
