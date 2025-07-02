import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import { UserRole } from "../../modules/user/schema";
import { ITenderNotice, TenderNotice } from "../../modules/tenderNotice/types";
import {
  createTenderNotice,
  updateTenderNotice,
} from "../../modules/tenderNotice";

export default class Controller {
  private readonly createTenderNoticeSchema = Joi.object({
    type: Joi.string().valid("upload", "manual").required(),
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
    tenderNoticeId: Joi.string().required(),
    days: Joi.number().required(),
  });

  protected readonly createTenderNoticeQuotation = async (
    req: Request,
    res: Response
  ) => {
    try {
      const authUser = req.authUser;
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }

      const payloadValue: ITenderNotice = await this.createTenderNoticeSchema
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
        authUser.role !== UserRole.GROUP_MANAGER &&
        authUser.role !== UserRole.TENDER_MANAGER
      ) {
        res.status(422).json({ message: "Not have permission to create." });
        return;
      }
      const newQuotation = await createTenderNotice(
        new TenderNotice({ ...payloadValue })
      );
      res.status(201).json({
        message: "Tender Notice created successfully",
        data: newQuotation,
      });
    } catch (error) {
      console.log("Error in createTenderQuotation ", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly addTenderNoticeDays = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const authUser = req.authUser;
      const payload = req.body;

      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }

      const payloadValue = await this.addTenderNoticeDaysSchema
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
        authUser.role !== UserRole.GROUP_MANAGER &&
        authUser.role !== UserRole.TENDER_MANAGER
      ) {
        res.status(422).json({ message: "Not have permission to create." });
        return;
      }

      const updatedNotice = await updateTenderNotice(
        payloadValue.tenderNoticeId,
        {
          days: payloadValue.days,
        }
      );

      if (!updatedNotice) {
        return res.status(404).json({ message: "Tender Notice not found." });
      }

      res.status(200).json({
        message: "Tender Notice days updated successfully",
        data: payloadValue,
      });
    } catch (error) {
      console.log("Error in addTenderNoticeDays ", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };
}
