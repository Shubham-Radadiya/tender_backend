import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import { UserRole } from "../../modules/user/schema";
import {
  createWorkOrder,
  deleteWorkOrderById,
  getWorkOrder,
  getWorkOrderById,
  IWorkOrder,
  updateWorkOrder,
  WorkOrder,
} from "../../modules/workOrder";
import { WorkOrderModel } from "../../modules/workOrder/schema";
import {
  generateInvoiceNumber,
  resolveCompanyName,
} from "../../helper/generateInvoiceNumber";
import { sendNotification } from "../../helper/sendNotification";
import { NotificationType } from "../../modules/notification/schema";
import { getUser } from "../../modules/user";
import { getIO } from "../../socket";

export default class Controller {
  private readonly createWorkOrderSchema = Joi.object({
    tenderId: Joi.string().required().trim(),
    title: Joi.string().trim().when("fileName", {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required(),
    }),

    description: Joi.string().trim().when("fileName", {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required(),
    }),

    quantity: Joi.number().when("fileName", {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required(),
    }),

    unit: Joi.string().when("fileName", {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required(),
    }),

    rate: Joi.number().when("fileName", {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required(),
    }),

    amount: Joi.number().when("fileName", {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),

    fileName: Joi.string().optional().trim(),
    originalFileName: Joi.string().optional().trim(),
    invoiceNumber: Joi.string().optional(),

    dueDate: Joi.date().optional(),
    workOrderNumber: Joi.string().optional(),
    workOrderCreateDate: Joi.date().optional().default(() => new Date()),

    createdAt: Joi.date()
      .optional()
      .default(() => new Date()),
    updatedAt: Joi.date().optional(),
  });

  private readonly updateWorkOrderSchema = Joi.object({
    tenderId: Joi.string().required().trim(),
    title: Joi.string().trim().optional(),

    description: Joi.string().trim().optional(),

    quantity: Joi.number().optional(),

    unit: Joi.string().optional(),

    amount: Joi.number().optional(),

    rate: Joi.number().optional(),
    invoiceNumber: Joi.string().optional(),

    fileName: Joi.string().optional().trim(),
    originalFileName: Joi.string().optional().trim(),
    workOrderCreateDate: Joi.date().optional(),
    dueDate: Joi.date().optional(),
    workOrderNumber: Joi.string().optional(),

    updatedAt: Joi.date()
      .optional()
      .default(() => new Date()),
  });

  protected readonly getWorkOrder = async (req: Request, res: Response) => {
    try {
      const workOrderId = req.params.id;

      if (workOrderId) {
        const workOrder = await getWorkOrderById(workOrderId);
        res.status(200).json({ message: "WorkOrder Details", workOrder });
        return;
      }
      const data = await getWorkOrder();
      res.status(200).json({
        message: "WorkOrder Listed",
        data,
      });
      return;
    } catch (error) {
      console.log("Error in getWorkOrder", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly getWorkOrderByTenderId = async (
    req: Request,
    res: Response,
  ) => {
    try {
      const tenderId = req.params.tenderId;
      console.log("tenderId", tenderId);

      if (!tenderId) {
        res.status(422).json({ message: "Invalid request body" });
        return;
      }
      const workOrder = await WorkOrderModel.findOne({ tenderId });
      res.status(200).json({ message: "WorkOrder Details", workOrder });
      return;
    } catch (error) {
      console.log("Error in getWorkOrder", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly createWorkOrder = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const user = req.authUser;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
        return;
      }

      if (req.file) {
        payload.fileName = `/uploads/${req.file.filename}`;
        payload.originalFileName = req.file.originalname;
      }

      const payloadValue: IWorkOrder = await this.createWorkOrderSchema
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
        user.role !== UserRole.COMPANY_MANAGER &&
        user.role !== UserRole.TENDER_MANAGER
      ) {
        res.status(422).json({ message: "Unauthorize Request." });
        return;
      }
      const newWorkOrder = await createWorkOrder(
        new WorkOrder({ ...payloadValue, isBillGenerated: false }),
      );

      const io = getIO();
      io.emit("workOrder:created", newWorkOrder);

      res.status(201).json(newWorkOrder);
      return;
    } catch (error) {
      console.log("Error in createWorkOrder", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly updateWorkOrder = async (req: Request, res: Response) => {
    try {
      const workOrderId = req.params.id;
      const user = req.authUser;
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
        return;
      }
      if (req.file) {
        payload.fileName = `/uploads/${req.file.filename}`;
        payload.originalFileName = req.file.originalname;
      }

      const payloadValue: IWorkOrder = await this.updateWorkOrderSchema
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
        user.role !== UserRole.COMPANY_MANAGER
      ) {
        res.status(422).json({ message: "Unauthorize Request." });
        return;
      }

      const existingWorkOrder = await getWorkOrderById(workOrderId);
      if (!existingWorkOrder) {
        res.status(404).json({ message: "WorkOrder not found" });
        return;
      }

      const existingData = existingWorkOrder.toObject();
      existingData.tenderId =
        typeof existingWorkOrder.tenderId === "object"
          ? existingWorkOrder.tenderId._id
          : existingWorkOrder.tenderId;

      const updated = await updateWorkOrder(
        new WorkOrder({ ...existingData, ...payloadValue }),
      );

      const io = getIO();
      io.emit("workOrder:updated", updated);

      res.status(200).json(updated);
      return;
    } catch (error) {
      console.log("Error in updateWorkOrder", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };

  private readonly markBillGeneratedSchema = Joi.object({
    invoiceNumber: Joi.string().optional().trim(),
    invoiceDate: Joi.alternatives().try(Joi.date(), Joi.string()).optional(),
  });

  protected readonly markBillGenerated = async (req: Request, res: Response) => {
    try {
      const workOrderId = req.params.id;
      const user = req.authUser;

      if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.COMPANY_MANAGER &&
        user.role !== UserRole.TENDER_MANAGER
      ) {
        res.status(422).json({ message: "Unauthorize Request." });
        return;
      }

      const payload = await this.markBillGeneratedSchema
        .validateAsync(req.body ?? {})
        .catch((e) => {
          res.status(422).json({ message: e.message });
          return null;
        });
      if (!payload) return;

      const existingWorkOrder = await getWorkOrderById(workOrderId);
      if (!existingWorkOrder) {
        res.status(404).json({ message: "WorkOrder not found" });
        return;
      }

      const existingData =
        typeof (existingWorkOrder as any).toObject === "function"
          ? (existingWorkOrder as any).toObject()
          : existingWorkOrder;

      let invoiceNumber = existingData.invoiceNumber || undefined;
      if (!invoiceNumber) {
        const companyAssigned =
          typeof existingData.tenderId === "object"
            ? existingData.tenderId?.companyAssigned
            : null;
        const companyName =
          companyAssigned && typeof companyAssigned === "object"
            ? resolveCompanyName(companyAssigned)
            : resolveCompanyName(user);

        invoiceNumber = await generateInvoiceNumber(user, { companyName });
      }

      let invoiceDate: Date;
      if (payload.invoiceDate) {
        invoiceDate = new Date(payload.invoiceDate);
        if (Number.isNaN(invoiceDate.getTime())) {
          res.status(422).json({ message: "Invalid invoice date." });
          return;
        }
      } else if (existingData.invoiceDate) {
        invoiceDate = new Date(existingData.invoiceDate);
      } else {
        invoiceDate = new Date();
      }

      const updated = await WorkOrderModel.findByIdAndUpdate(
        workOrderId,
        {
          $set: {
            isBillGenerated: true,
            invoiceNumber,
            invoiceDate,
          },
        },
        { new: true },
      );

      if (!updated) {
        res.status(404).json({ message: "WorkOrder not found" });
        return;
      }

      const bankManagerDetails = await getUser(UserRole.BANK_MANAGER);
      if (bankManagerDetails?.[0]?._id) {
        await sendNotification(
          bankManagerDetails[0]._id.toString(),
          NotificationType.WorkOrder_CREATED,
          `Bill generated for work order ${updated.title || ""}`,
        );
      }

      const io = getIO();
      io.emit("workOrder:updated", updated);

      res.status(200).json({
        message: "Bill generated successfully",
        workOrder: updated,
      });
      return;
    } catch (error: any) {
      console.log("Error in markBillGenerated", error);
      res.status(400).json({
        message: error?.message || "Failed to register bill for payment",
        error: error?.message,
      });
      return;
    }
  };

  protected readonly deleteWorkOrder = async (req: Request, res: Response) => {
    try {
      const workOrderId = req.params.id;
      const user = req.authUser;
      if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.COMPANY_MANAGER
      ) {
        res.status(422).json({ message: "Unauthorize Request." });
        return;
      }

      const existingWorkOrder = await getWorkOrderById(workOrderId);
      if (!existingWorkOrder) {
        res.status(404).json({ message: "WorkOrder not found" });
        return;
      }

      const io = getIO();
      io.emit("workOrder:deleted", workOrderId);

      await deleteWorkOrderById(workOrderId);
      res.status(200).json({ message: "WorkOrder deleted successfully" });
      return;
    } catch (error) {
      console.log("Error in deleteWorkOrder", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };
}
