import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import {
  createTender,
  deleteTenderById,
  getTender,
  getTenderById,
  getTenderByStatus,
  ITender,
  Tender,
  updateTender,
} from "../../modules/tender";
import { Status } from "../../modules/tender/schema";
import { getTenderQuotationsByTenderId } from "../../modules/tenderQuotation";
import { NotificationType } from "../../modules/notification/schema/notification";
import { sendNotification } from "../../helper/sendNotification";
import { getGM, getTM } from "../../modules/user";

export default class Controller {
  private readonly createTenderSchema = Joi.object({
    tenderNo: Joi.string().required(),
    name: Joi.string().required(),
    createdDate: Joi.date().required(),
    lastDate: Joi.date().required(),
    category: Joi.string().required(),
    department: Joi.string().required(),
    nameOfWork: Joi.string().required(),
    providedBy: Joi.string().required(),
    items: Joi.array()
      .items(
        Joi.object({
          description: Joi.string().required(),
          quantity: Joi.number().required(),
          unit: Joi.string().required(),
        })
      )
      .required(),
  });

  private readonly updateTenderSchema = Joi.object({
    tenderNo: Joi.string(),
    name: Joi.string(),
    createdDate: Joi.date(),
    lastDate: Joi.date(),
    category: Joi.string(),
    department: Joi.string(),
    nameOfWork: Joi.string(),
    providedBy: Joi.string(),
    items: Joi.array().items(
      Joi.object({
        description: Joi.string().required(),
        quantity: Joi.number().required(),
        unit: Joi.string().required(),
      })
    ),
  });

  private readonly tenderGotToSchema = Joi.object({
    companyAssigned: Joi.string().required(),
  });

  private readonly tenderAcceptedSchema = Joi.object({
    status: Joi.string().valid("GM_ACCEPTED", "GM_DECLINED").required(),
    declineReason: Joi.when("status", {
      is: "GM_DECLINED",
      then: Joi.string().required().messages({
        "any.required": "Reason is required when status is DECLINED",
      }),
      otherwise: Joi.optional(),
    }),
  });

  protected readonly getTender = async (req: Request, res: Response) => {
    try {
      const tenderId = req.params.id;
      if (tenderId) {
        const tender = await getTenderById(tenderId);
        res.status(200).json({ message: "Tender Listed", tender });
        return;
      }
      const tenderList = await getTender();
      res.status(200).json({ message: "Tender Listed", tenderList });
      return;
    } catch (error) {
      console.log("Error in getTender", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly getTenderForGM = async (req: Request, res: Response) => {
    try {
      const tenderList = await getTenderByStatus("GM_PENDING");
      res.status(200).json({ message: "Tender List For GM", tenderList });
      return;
    } catch (error) {
      console.log("Error in getTender", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly getTenderByStatus = async (req: Request, res: Response) => {
    try {
      const status = req.query.status
      if (!status) {
        res.status(422).json({ message: "Status is required" });
        return;
      }
      const tenderList = await getTenderByStatus(status.toString());
      res.status(200).json({ message: "Tender List For GM", tenderList });
      return;
    } catch (error) {
      console.log("Error in getTenderByStatus", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly createTender = async (req: Request, res: Response) => {
    try {
      const userId = req.authUser._id;
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
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

      const newTender = await createTender(
        new Tender({
          ...payloadValue,
          createdBy: userId,
          status: Status.GM_PENDING,
          history: [{
            action: "Tender created and assigned to Group Manager",
            by: userId,
            date: new Date()
          }]
        })
      );

      const gmData = await getGM()
      // Send notification to GM
      await sendNotification(
        gmData._id,
        newTender._id!,
        NotificationType.TENDER_CREATED,
        `New tender "${payloadValue.name}" has been created and assigned to you`
      );

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
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
      const payloadValue: Partial<ITender> = await this.updateTenderSchema
        .validateAsync(payload)
        .then((value) => value)
        .catch((e) => {
          res.status(422).json(isError(e) ? e : { message: e.message });
          return
        });

      if (!payloadValue) return;

      const existingTender = await getTenderById(tenderId);
      if (!existingTender) {
        res.status(404).json({ message: "Tender not found" });
        return;
      }

      const mergedTender = {
        ...existingTender,
        ...payloadValue,
      };

      const updated = await updateTender(new Tender(mergedTender));

      // Send notification to TM based on status
      const tmId = existingTender.createdBy as string;
      let notificationType: NotificationType;
      let message: string;

      switch (payloadValue.status) {
        case Status.GM_ACCEPTED:
          notificationType = NotificationType.TENDER_ACCEPTED;
          message = `Tender "${existingTender.name}" has been accepted by GM`;
          break;
        case Status.GM_DECLINED:
          notificationType = NotificationType.TENDER_DECLINED;
          message = `Tender "${existingTender.name}" has been declined by GM`;
          break;
        case Status.GM_APPROVED:
          notificationType = NotificationType.TENDER_APPROVED;
          message = `Tender "${existingTender.name}" has been approved by GM`;
          break;
        default:
          res.status(200).json(updated);
          return
      }

      // await sendNotification(tmId, existingTender._id!, notificationType, message);

      res.status(200).json(updated);
      return
    } catch (error) {
      console.log("Error in updateTender", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };

  protected readonly tenderGotTo = async (req: Request, res: Response) => {
    try {
      const tenderId = req.params.id;
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
      const payloadValue: Partial<ITender> = await this.tenderGotToSchema
        .validateAsync(payload)
        .then((value) => value)
        .catch((e) => {
          console.log(e);
          res.status(422).json(isError(e) ? e : { message: e.message });
          return null;
        });

      if (!payloadValue) return;

      const existingTender = await getTenderById(tenderId);
      if (!existingTender) {
        res.status(404).json({ message: "Tender not found" });
        return;
      }

      const mergedTender = {
        ...existingTender,
        ...payloadValue,
        history: [
          ...(existingTender.history || []),
          {
            action: `Winning company ${payloadValue.companyAssigned} assigned by Group Manager`,
            by: req.authUser._id,
            date: new Date()
          }
        ]
      };

      const updated = await updateTender(new Tender(mergedTender));
      res.status(200).json(updated);
      return;
    } catch (error) {
      console.log("Error in Tender Got To", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };

  protected readonly tenderAccepted = async (req: Request, res: Response) => {
    try {
      const tenderId = req.params.id;
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
      const payloadValue: Partial<ITender> = await this.tenderAcceptedSchema
        .validateAsync(payload)
        .then((value) => value)
        .catch((e) => {
          console.log(e);
          res.status(422).json(isError(e) ? e : { message: e.message });
          return null;
        });

      if (!payloadValue) return;

      const existingTender = await getTenderById(tenderId);
      if (!existingTender) {
        res.status(404).json({ message: "Tender not found" });
        return;
      }

      const action = payloadValue?.status === "GM_ACCEPTED"
        ? "Tender accepted by Group Manager"
        : `Tender declined by Group Manager. Reason: ${payloadValue?.declineReason}`;

      const mergedTender = {
        ...existingTender,
        status: payloadValue?.status,
        declineReason:
          payloadValue?.status === "GM_DECLINED"
            ? payloadValue?.declineReason
            : "",
        history: [
          ...(existingTender.history || []),
          {
            action,
            by: req.authUser._id,
            date: new Date()
          }
        ]
      };

      const updated = await updateTender(new Tender(mergedTender));

      const getTMData = await getTM()
      const notificationType = payloadValue?.status === "GM_ACCEPTED" ? NotificationType.TENDER_ACCEPTED : NotificationType.TENDER_DECLINED
      await sendNotification(
        getTMData._id,
        existingTender._id,
        notificationType,
        action
      );

      res.status(200).json(updated);
      return;
    } catch (error) {
      console.log("Error in Tender Accepted", error);
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

  protected readonly approveTender = async (req: Request, res: Response) => {
    try {
      const tenderId = req.params.id;

      // Get the tender
      const existingTender = await getTenderById(tenderId);
      if (!existingTender) {
        res.status(404).json({ message: "Tender not found" });
        return;
      }

      // Verify tender is in GM_ACCEPTED state
      if (existingTender.status !== Status.GM_ACCEPTED) {
        res.status(400).json({
          message: "Tender must be in GM_ACCEPTED state before approval"
        });
        return;
      }

      // Verify that a company has been assigned
      if (!existingTender.companyAssigned) {
        res.status(400).json({
          message: "A winning company must be assigned before approval"
        });
        return;
      }

      // Get all quotations for this tender
      const quotations = await getTenderQuotationsByTenderId(tenderId);
      if (quotations.length === 0) {
        res.status(400).json({
          message: "At least one quotation must exist before approval"
        });
        return;
      }

      // Update tender status to GM_APPROVED
      const updatedTender = await updateTender(
        new Tender({
          ...existingTender,
          status: Status.GM_APPROVED,
          history: [
            ...(existingTender.history || []),
            {
              action: `Tender approved and assigned to company ${existingTender.companyAssigned}`,
              by: req.authUser._id,
              date: new Date(),
            },
          ],
        })
      );

      const getTMData = await getTM()
      await sendNotification(
        getTMData._id,
        existingTender._id,
        NotificationType.TENDER_APPROVED,
        `Tender approved by the Group Manager`
      );

      res.status(200).json({
        message: "Tender approved successfully",
        tender: updatedTender
      });
      return;
    } catch (error) {
      console.log("Error in approveTender", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };
}
