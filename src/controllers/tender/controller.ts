import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import {
  createTender,
  deleteTenderById,
  getTender,
  getTenderByCompany,
  getTenderById,
  getTenderByStatus,
  ITender,
  Tender,
  updateTender,
  updateTenderById,
} from "../../modules/tender";
import { TenderStatus } from "../../modules/tender/schema";
import { getTenderQuotationsByTenderId } from "../../modules/tenderQuotation";
import { NotificationType } from "../../modules/notification/schema/notification";
import { sendNotification } from "../../helper/sendNotification";
import { getGM, getTM, getUserById } from "../../modules/user";
import { UserRole } from "../../modules/user/schema";
import { updateNotification } from "../../modules/notification";

export default class Controller {
  private readonly createTenderSchema = Joi.object({
    tenderNo: Joi.string().required(),
    name: Joi.string().required(),
    createdDate: Joi.date().required(),
    lastDate: Joi.date().required(),
    category: Joi.string().required(),
    department: Joi.string().required(),
    isNoticeGenerated: Joi.boolean().default(false),
    nameOfWork: Joi.string().required(),
    providedBy: Joi.string().required(),
    status: Joi.string()
      .valid(...Object.values(TenderStatus))
      .default(TenderStatus.SELECT_STATUS),
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

  private readonly addTenderNoticeSchema = Joi.object({
    type: Joi.string().valid("manual", "upload").required(),
    tenderId: Joi.string().required(),
    fileName: Joi.when("type", {
      is: "upload",
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    itemName: Joi.when("type", {
      is: "manual",
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    quantity: Joi.when("type", {
      is: "manual",
      then: Joi.number().required(),
      otherwise: Joi.forbidden(),
    }),
    unit: Joi.when("type", {
      is: "manual",
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
    rate: Joi.when("type", {
      is: "manual",
      then: Joi.number().required(),
      otherwise: Joi.forbidden(),
    }),
    amount: Joi.when("type", {
      is: "manual",
      then: Joi.number().required(),
      otherwise: Joi.forbidden(),
    }),
  });

  private readonly addTenderNoticeDaysSchema = Joi.object({
    tenderId: Joi.string().required(),
    noticeIndex: Joi.number().required(),
    days: Joi.number().required(),
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
    tenderquotationId: Joi.string().optional(),
  });

  private readonly tenderAcceptedSchema = Joi.object({
    status: Joi.string()
      .valid(
        TenderStatus.GM_ACCEPTED,
        TenderStatus.GM_DECLINED,
        TenderStatus.GM_QUTATION_PENDING
      )
      .required(),
    declineReason: Joi.when("status", {
      is: "GM_DECLINED",
      then: Joi.string().required().messages({
        "any.required": "Reason is required when status is DECLINED",
      }),
      otherwise: Joi.optional(),
    }),
  });

  private readonly tenderAcceptedByCMSchema = Joi.object({
    status: Joi.string().valid("CM_ACCEPTED", "CM_DECLINED").required(),
    declineReason: Joi.when("status", {
      is: "CM_DECLINED",
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
      const user = req.authUser;
      if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.GROUP_MANAGER
      ) {
        res.status(422).json({ message: "Unauthorize Request." });
        return;
      }
      const tenderList = await getTenderByStatus([
        TenderStatus.GM_PENDING,
        TenderStatus.GM_ACCEPTED,
        TenderStatus.TM_PENDING,
        TenderStatus.GM_QUTATION_PENDING,
      ]);
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

  protected readonly getTenderForCM = async (req: Request, res: Response) => {
    try {
      const user = req.authUser;
      const id = req.authUser._id;
      if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.COMPANY_MANAGER
      ) {
        res.status(422).json({ message: "Unauthorize Request." });
        return;
      }
      const tenderList = await getTenderByCompany(id);
      res.status(200).json({ message: "Tender List For CM", tenderList });
      return;
    } catch (error) {
      console.log("Error in getTender", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly getTenderByStatus = async (
    req: Request,
    res: Response
  ) => {
    try {
      const status = req.query.status;
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
      const user = req.authUser;
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
        return;
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
      if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.TENDER_MANAGER
      ) {
        res
          .status(422)
          .json({ message: "Don't have access to generate the Tender." });
        return;
      }
      const newTender = await createTender(
        new Tender({
          ...payloadValue,
          createdBy: user._id,
          history: [
            {
              action: `Tender manager created tender '${payloadValue.name}' and assigned it to the Group Manager`,
              by: user._id,
              date: new Date(),
            },
          ],
        })
      );

      const gmData = await getGM();
      // Send notification to GM
      await sendNotification(
        gmData._id,
        newTender._id!,
        NotificationType.TENDER_CREATED,
        `New tender ${payloadValue.name} has been created and assigned to you`
      );

      const populatedTender = await getTenderById(newTender._id);
      res.status(201).json(populatedTender);
      return;
    } catch (error) {
      console.log("Error in createTender", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly addTenderNotice = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const user = req.authUser;
      const payload = req.body;

      if (!payload) {
        return res.status(422).json({ message: "Invalid request body" });
      }

      if (payload.type === "upload" && req.file) {
        payload.fileName = req.file.filename;
      }

      const payloadValue = await this.addTenderNoticeSchema
        .validateAsync(payload)
        .then((value) => value)
        .catch((e) => {
          console.log(e);
          if (isError(e)) {
            return res.status(422).json(e);
          } else {
            return res.status(422).json({ message: e.message });
          }
        });

      if (!payloadValue) return;

      if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.TENDER_MANAGER &&
        user.role !== UserRole.GROUP_MANAGER
      ) {
        return res.status(403).json({
          message: "You do not have permission to add a tender notice.",
        });
      }

      const updatedTender = await updateTenderById(payloadValue.tenderId, {
        $push: {
          tenderNotice: {
            fileName: payloadValue.fileName,
            days: payloadValue.days,
            itemName: payloadValue.itemName,
            quantity: payloadValue.quantity,
            unit: payloadValue.unit,
            rate: payloadValue.rate,
            amount: payloadValue.amount,
          },
        },
      });

      if (!updatedTender) {
        return res.status(404).json({ message: "Tender not found" });
      }

      res.status(201).json({
        message: "Tender notice added successfully",
        data: "updatedTender",
      });
    } catch (error) {
      console.log("Error in addTenderNotice", error);
      res.status(400).json({ error: error?.message });
    }
  };

  protected readonly addTenderNoticeDays = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const user = req.authUser;
      const payload = req.body;

      if (!payload) {
        return res.status(422).json({ message: "Invalid request body" });
      }

      const payloadValue = await this.addTenderNoticeDaysSchema
        .validateAsync(payload)
        .then((value) => value)
        .catch((e) => {
          console.log(e);
          return res.status(422).json({
            message: e.message,
          });
        });

      if (!payloadValue) return;

      if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.TENDER_MANAGER &&
        user.role !== UserRole.GROUP_MANAGER
      ) {
        return res.status(403).json({
          message: "You do not have permission to update days.",
        });
      }

      const updatedTender = await updateTenderById(payloadValue.tenderId, {
        $set: {
          [`tenderNotice.${payloadValue.noticeIndex}.days`]: payloadValue.days,
        },
      });

      if (!updatedTender) {
        return res.status(404).json({ message: "Tender not found" });
      }

      res.status(200).json({
        message: "Days updated successfully in Tender Notice",
        data: updatedTender,
      });
    } catch (error) {
      console.log("Error in addTenderNoticeDays", error);
      res.status(400).json({ error: error?.message });
    }
  };

  protected readonly updateTenderStatus = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const user = req.authUser;
      const { id, status } = req.body;

      if (!status || !Object.values(TenderStatus).includes(status)) {
        return res.status(422).json({ message: "Invalid or missing status." });
      }
      if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.TENDER_MANAGER
      ) {
        res
          .status(422)
          .json({ message: "Don't have access to generate the Tender." });
        return;
      }

      const existingTender = await getTenderById(id);
      if (!existingTender) {
        return res.status(404).json({ message: "Tender not found." });
      }
      existingTender.status = status;

      const updatedTender = await updateTender(new Tender(existingTender));
      res.status(200).json({
        message: "Tender status updated successfully.",
        data: updatedTender,
      });
    } catch (error) {
      console.error("Error in updateTenderStatus", error);
      res.status(500).json({ error: error?.message });
    }
  };
  s;

  protected readonly updateTender = async (
    req: Request,
    res: Response
  ): Promise<any> => {
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
          return;
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
      let notificationType: NotificationType;
      let message: string;

      switch (payloadValue.status) {
        case TenderStatus.GM_ACCEPTED:
          notificationType = NotificationType.TENDER_ACCEPTED;
          message = `Tender "${existingTender.name}" has been accepted by GM`;
          break;
        case TenderStatus.GM_DECLINED:
          notificationType = NotificationType.TENDER_DECLINED;
          message = `Tender "${existingTender.name}" has been declined by GM`;
          break;
        case TenderStatus.GM_APPROVED:
          notificationType = NotificationType.TENDER_APPROVED;
          message = `Tender "${existingTender.name}" has been approved by GM`;
          break;
        default:
          res.status(200).json(updated);
          return;
      }

      // await sendNotification(tmId, existingTender._id!, notificationType, message);

      res.status(200).json(updated);
      return;
    } catch (error) {
      console.log("Error in updateTender", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };

  protected readonly tenderGotTo = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
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

      if (
        authUser.role !== UserRole.ADMIN &&
        authUser.role !== UserRole.GROUP_MANAGER
      ) {
        res.status(422).json({ message: "Not have permission to assign." });
        return;
      }

      const existingTender = await getTenderById(tenderId);
      if (!existingTender) {
        res.status(404).json({ message: "Tender not found" });
        return;
      }

      if (!payloadValue?.companyAssigned) {
        res.status(404).json({ message: "Invalid Company Id" });
        return;
      }
      if (!payloadValue?.tenderquotationId) {
        res.status(404).json({ message: "Invalid Tender Quotation Id" });
        return;
      }
      const companyDetails = await getUserById(
        payloadValue?.companyAssigned.toString()
      );

      const mergedTender = {
        ...existingTender,
        ...payloadValue,
        history: [
          ...(existingTender.history || []),
          {
            action: `Tender '${existingTender.name}' assigned to winning company '${companyDetails.firstName} ${companyDetails.lastName}' by Group Manager`,
            by: req.authUser._id,
            date: new Date(),
          },
        ],
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
      const authUser = req.authUser;
      const tenderId = req.params.id;
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
        return;
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

      if (
        authUser.role !== UserRole.ADMIN &&
        authUser.role !== UserRole.GROUP_MANAGER
      ) {
        res.status(422).json({ message: "Not have permission to accept." });
        return;
      }

      const existingTender = await getTenderById(tenderId);
      if (!existingTender) {
        res.status(404).json({ message: "Tender not found" });
        return;
      }

      const action =
        payloadValue?.status === TenderStatus.GM_ACCEPTED ||
        TenderStatus.GM_QUTATION_PENDING
          ? `Tender '${existingTender.name}' accepted by Group Manager`
          : `Tender '${existingTender.name}' declined by Group Manager. Reason: ${payloadValue?.declineReason}`;

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
            date: new Date(),
          },
        ],
      };

      const updated = await updateTender(new Tender(mergedTender));

      const getTMData = await getTM();
      const notificationType =
        payloadValue?.status === TenderStatus.GM_ACCEPTED ||
        TenderStatus.GM_QUTATION_PENDING
          ? NotificationType.TENDER_ACCEPTED
          : NotificationType.TENDER_DECLINED;

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
      const authUser = req.authUser;
      const tenderId = req.params.id;
      const existingTender = await getTenderById(tenderId);
      if (!existingTender) {
        res.status(404).json({ message: "Tender not found" });
        return;
      }

      if (
        authUser.role !== UserRole.ADMIN &&
        authUser.role !== UserRole.GROUP_MANAGER
      ) {
        res
          .status(422)
          .json({ message: "Not have permission to approve tender." });
        return;
      }

      if (existingTender.status !== TenderStatus.GM_ACCEPTED) {
        res.status(400).json({
          message: "Tender must be in GM_ACCEPTED state before approval",
        });
        return;
      }

      if (!existingTender.companyAssigned) {
        res.status(400).json({
          message: "A winning company must be assigned before approval",
        });
        return;
      }

      const quotations = await getTenderQuotationsByTenderId(tenderId);
      if (quotations.length === 0) {
        res.status(400).json({
          message: "At least one quotation must exist before approval",
        });
        return;
      }

      if (!existingTender?.companyAssigned) {
        res.status(404).json({ message: "Invalid Company Id" });
        return;
      }
      // const companyDetails = await getUserById(
      //   existingTender?.companyAssigned.toString()
      // );

      // Update tender status to GM_APPROVED
      const updatedTender = await updateTender(
        new Tender({
          ...existingTender,
          status: TenderStatus.TM_PENDING,
          history: [
            ...(existingTender.history || []),
            {
              action: `Tender '${existingTender.name}' approved by Group Manager and assigned to Tender Manager`,
              by: req.authUser._id,
              date: new Date(),
            },
          ],
        })
      );
      // company ${companyDetails.firstName} ${companyDetails.lastName}

      const getTMData = await getTM();
      await sendNotification(
        getTMData._id,
        existingTender._id,
        NotificationType.TENDER_APPROVED,
        `Tender approved by the group manager and assigned back to you.`
      );

      res.status(200).json({
        message: "Tender approved by GM successfully and assigned back to TM.",
        tender: updatedTender,
      });
      return;
    } catch (error) {
      console.log("Error in approveTender", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };

  protected readonly passTenderToCM = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      const tenderId = req.params.id;
      const tenderDetails = await getTenderById(tenderId);
      if (!tenderDetails) {
        res.status(500).json({ message: "Invalid Tender Id." });
        return;
      }
      if (
        authUser.role !== UserRole.ADMIN &&
        authUser.role !== UserRole.TENDER_MANAGER
      ) {
        res.status(422).json({ message: "Not have permission to pass." });
        return;
      }
      const mergedTender = {
        ...tenderDetails,
        status: TenderStatus.CM_PENDING,
      };
      await updateTender(new Tender(mergedTender));
      await sendNotification(
        tenderDetails.companyAssigned,
        tenderDetails._id,
        NotificationType.TENDER_APPROVED_BY_TM,
        `New Tender ${tenderDetails.name} has been created and assigned to you`
      );
    } catch (error) {
      console.log("Error in assignTenderToCM", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };

  protected readonly tenderAcceptedByCM = async (
    req: Request,
    res: Response
  ) => {
    try {
      const authUser = req.authUser;
      const tenderId = req.params.id;
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
        return;
      }
      const payloadValue: Partial<ITender> = await this.tenderAcceptedByCMSchema
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
        authUser.role !== UserRole.COMPANY_MANAGER
      ) {
        res.status(422).json({ message: "Not have permission to accept." });
        return;
      }

      const existingTender = await getTenderById(tenderId);
      if (!existingTender) {
        res.status(404).json({ message: "Tender not found" });
        return;
      }

      const action =
        payloadValue?.status === "CM_ACCEPTED"
          ? `Tender '${existingTender.name}' accepted by Company Manager`
          : `Tender '${existingTender.name}' declined by Company Manager. Reason: ${payloadValue?.declineReason}`;

      const mergedTender = {
        ...existingTender,
        status: payloadValue?.status,
        declineReason:
          payloadValue?.status === "CM_DECLINED"
            ? payloadValue?.declineReason
            : "",
        history: [
          ...(existingTender.history || []),
          {
            action,
            by: req.authUser._id,
            date: new Date(),
          },
        ],
      };

      const updated = await updateTender(new Tender(mergedTender));

      const getTMData = await getTM();
      const notificationType =
        payloadValue?.status === "CM_ACCEPTED"
          ? NotificationType.TENDER_ACCEPTED
          : NotificationType.TENDER_DECLINED;

      await sendNotification(
        getTMData._id,
        existingTender._id,
        notificationType,
        action
      );

      res.status(200).json(updated);
      return;
    } catch (error) {
      console.log("Error in Tender Accepted By CM", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };
}
