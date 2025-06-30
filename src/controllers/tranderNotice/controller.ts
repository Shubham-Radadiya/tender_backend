import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import { UserRole } from "../../modules/user/schema";
import { ITenderNotice, TenderNotice } from "../../modules/tenderNotice/types";
import { createTenderNotice } from "../../modules/tenderNotice";

export default class Controller {
  private readonly createTenderNoticeSchema = Joi.object({
    tenderId: Joi.string().required(),
    itemName: Joi.string().required(),
    quantity: Joi.number().required(),
    unit: Joi.string().required(),
    rate: Joi.number().required(),
    amount: Joi.number().required(),
    days: Joi.number().optional(),
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
        authUser.role !== UserRole.GROUP_MANAGER
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
}
