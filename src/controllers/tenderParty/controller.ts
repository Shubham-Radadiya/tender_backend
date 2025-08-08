import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import {
  createTenderParty,
  deleteTenderPartyById,
  getTenderParty,
  getTenderPartyById,
  ITenderParty,
  TenderParty,
  updateTenderParty,
} from "../../modules/tenderParty";
import { UserRole } from "../../modules/user/schema";
import { sendNotification } from "../../helper/sendNotification";
import { NotificationType } from "../../modules/notification/schema";
import { getUser } from "../../modules/user";

export default class Controller {
  private readonly createTenderPartySchema = Joi.object({
    name: Joi.string().required().trim(),
    email: Joi.string().email().required().trim(),
    address: Joi.string().optional().trim(),
    createdAt: Joi.date()
      .optional()
      .default(() => new Date()),
    updatedAt: Joi.date().optional(),
  });

  private readonly updateTenderPartySchema = Joi.object({
    name: Joi.string().optional().trim(),
    email: Joi.string().email().required().trim(),
    address: Joi.string().optional().trim(),
    updatedAt: Joi.date()
      .optional()
      .default(() => new Date()),
  });

  protected readonly getTenderParty = async (req: Request, res: Response) => {
    try {
      const partyId = req.params.id;

      if (partyId) {
        const party = await getTenderPartyById(partyId);
        res.status(200).json({ message: "TenderParty Details", party });
        return;
      }
      const { data } = await getTenderParty();
      res.status(200).json({
        message: "TenderParty Listed",
        data,
      });
      return;
    } catch (error) {
      console.log("Error in getParty", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly createTenderParty = async (
    req: Request,
    res: Response
  ) => {
    try {
      const payload = req.body;
      const user = req.authUser;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
      const payloadValue: ITenderParty = await this.createTenderPartySchema
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
        res.status(422).json({ message: "Unauthorize Request." });
        return;
      }

      const newParty = await createTenderParty(
        new TenderParty({ ...payloadValue })
      );
      const adminDetails = await getUser(UserRole.ADMIN);
      await sendNotification(
        adminDetails?.[0]._id.toString(),
        NotificationType.PARTY_CREATED,
        `Create this email ${newParty.email || ""} Company`
      );

      res.status(201).json(newParty);
      return;
    } catch (error) {
      console.log("Error in createParty", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly updateTenderParty = async (
    req: Request,
    res: Response
  ) => {
    try {
      const partyId = req.params.id;
      const user = req.authUser;
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
      const payloadValue: ITenderParty = await this.updateTenderPartySchema
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

      const existingParty = await getTenderPartyById(partyId);
      if (!existingParty) {
        res.status(404).json({ message: "Party not found" });
        return;
      }

      const updated = await updateTenderParty(
        new TenderParty({ ...existingParty, ...payloadValue })
      );
      res.status(200).json(updated);
      return;
    } catch (error) {
      console.log("Error in updateTenderParty", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };

  protected readonly deleteTenderParty = async (
    req: Request,
    res: Response
  ) => {
    try {
      const partyId = req.params.id;
      const user = req.authUser;
      if (
        user.role !== UserRole.ADMIN &&
        user.role !== UserRole.COMPANY_MANAGER
      ) {
        res.status(422).json({ message: "Unauthorize Request." });
        return;
      }

      const existingParty = await getTenderPartyById(partyId);
      if (!existingParty) {
        res.status(404).json({ message: "Party not found" });
        return;
      }

      await deleteTenderPartyById(partyId);
      res.status(200).json({ message: "Party deleted successfully" });
      return;
    } catch (error) {
      console.log("Error in deleteParty", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };
}
