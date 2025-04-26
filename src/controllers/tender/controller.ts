import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import { SHA256 } from "crypto-js";
import {
  createTender,
  deleteTenderById,
  getTender,
  getTenderById,
  getTenderForGM,
  ITender,
  Tender,
  updateTender,
} from "../../modules/tender";

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
      const tenderList = await getTenderForGM();
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
        new Tender({ ...payloadValue, createdBy: userId })
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
      };

      const updated = await updateTender(new Tender(mergedTender));
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
}
