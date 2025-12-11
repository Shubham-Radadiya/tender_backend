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

    createdAt: Joi.date()
      .optional()
      .default(() => new Date()),
    updatedAt: Joi.date().optional(),
  });

  private readonly updateWorkOrderSchema = Joi.object({
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

    amount: Joi.number().when("fileName", {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),

    rate: Joi.number().when("fileName", {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required(),
    }),

    fileName: Joi.string().optional().trim(),

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
    res: Response
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
      }

      if (req.file) {
        payload.fileName = req.file.filename;
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
        new WorkOrder({ ...payloadValue })
      );
      // const adminDetails = await getUser(UserRole.ADMIN);
      // await sendNotification(
      //   adminDetails?.[0]._id.toString(),
      //   NotificationType.WorkOrder_CREATED,
      //   `Tender Manager created this workOrder ${newWorkOrder.email || ""}`
      // );

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
      }
      if (req.file) {
        payload.fileName = req.file.filename;
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

      const updated = await updateWorkOrder(
        new WorkOrder({ ...existingWorkOrder, ...payloadValue })
      );
      res.status(200).json(updated);
      return;
    } catch (error) {
      console.log("Error in updateWorkOrder", error);
      res.status(500).json({ message: error.message });
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
