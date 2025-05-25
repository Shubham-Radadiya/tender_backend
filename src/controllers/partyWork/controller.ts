import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import { SHA256 } from "crypto-js";
import {
  createPartyWork,
  deletePartyWorkById,
  getPartyWork,
  getPartyWorkById,
  IPartyWork,
  PartyWork,
  updatePartyWork,
} from "../../modules/partyWork";

export default class Controller {
  private readonly createPartyWorkSchema = Joi.object({
    partyId: Joi.string().required(),
    tenderId: Joi.string().required(),
    workTitle: Joi.string().required(),
    workDescription: Joi.string().optional(),
    dueDate: Joi.date().required(),
    totalAmount: Joi.number().required(),
    status: Joi.string()
      .valid("progress", "completed", "terminated")
      .default("progress"),
  });

  private readonly updatePartyWorkSchema = Joi.object({
    partyId: Joi.string().optional(),
    tenderId: Joi.string().optional(),
    workTitle: Joi.string().optional(),
    workDescription: Joi.string().optional(),
    dueDate: Joi.date().optional(),
    totalAmount: Joi.number().optional(),
    status: Joi.string()
      .valid("progress", "completed", "terminated")
      .optional(),
  });

  protected readonly getPartyWork = async (req: Request, res: Response) => {
    try {
      const partyWorkId = req.params.id;
      if (partyWorkId) {
        const partyWork = await getPartyWorkById(partyWorkId);
        res.status(200).json({ message: "PartyWork Listed", partyWork });
        return;
      }
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const { partyWorkList, totalCount } = await getPartyWork(page, limit);
      res.status(200).json({
        message: "PartyWork Listed",
        partyWorkList,
        pagination: {
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          pageSize: limit,
        },
      });
      return;
    } catch (error) {
      console.log("Error in getPartyWork", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly createPartyWork = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
      const payloadValue: IPartyWork = await this.createPartyWorkSchema
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

      const newPartyWork = await createPartyWork(
        new PartyWork({ ...payloadValue })
      );
      res.status(201).json(newPartyWork);
      return;
    } catch (error) {
      console.log("Error in createPartyWork", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly updatePartyWork = async (req: Request, res: Response) => {
    try {
      const partyWorkId = req.params.id;
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
      const payloadValue: IPartyWork = await this.updatePartyWorkSchema
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
      const existingPartyWork = await getPartyWorkById(partyWorkId);
      if (!existingPartyWork) {
        res.status(404).json({ message: "PartyWork not found" });
        return;
      }

      const updated = await updatePartyWork(
        new PartyWork({ ...existingPartyWork, ...payloadValue })
      );
      res.status(200).json(updated);
      return;
    } catch (error) {
      console.log("Error in updatePartyWork", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };

  protected readonly deletePartyWork = async (req: Request, res: Response) => {
    try {
      const partyWorkId = req.params.id;
      const existingPartyWork = await getPartyWorkById(partyWorkId);
      if (!existingPartyWork) {
        res.status(404).json({ message: "PartyWork not found" });
        return;
      }

      await deletePartyWorkById(partyWorkId);
      res.status(200).json({ message: "PartyWork deleted successfully" });
      return;
    } catch (error) {
      console.log("Error in deletePartyWork", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };
}
