import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import { SHA256 } from "crypto-js";
import { createTransaction, deleteTransactionById, getTransaction, getTransactionById, ITransaction, Transaction, updateTransaction } from "../../modules/transaction";

export default class Controller {
  private readonly createTransactionSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    dob: Joi.date().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string()
      .min(6)
      .custom((v) => {
        return SHA256(v).toString();
      })
      .required(),
    phoneNumber: Joi.string().required(),
    profile: Joi.string().optional(),
    role: Joi.string()
      .valid(
        "ADMIN",
        "TENDER_MANAGER",
        "GROUP_MANAGER",
        "COMPANY_MANAGER",
        "BANK_MANAGER"
      )
      .required(),
    companyDetails: Joi.object({
      companyName: Joi.string(),
      businessEmail: Joi.string().email(),
      aadharNumber: Joi.string(),
      panNumber: Joi.string(),
      userName: Joi.string(),
      companyPhone: Joi.string(),
      gstUsername: Joi.string(),
      gstNumber: Joi.string(),
      ifscCode: Joi.string(),
      website: Joi.string(),
    }).optional(),
  });

  private readonly updateTransactionSchema = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    dob: Joi.date().optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .optional(),
    password: Joi.string().min(6).optional(),
    phoneNumber: Joi.string().optional(),
    profile: Joi.string().optional(),
    role: Joi.string()
      .valid(
        "ADMIN",
        "TENDER_MANAGER",
        "GROUP_MANAGER",
        "COMPANY_MANAGER",
        "BANK_MANAGER"
      )
      .optional(),
    companyDetails: Joi.object({
      companyName: Joi.string(),
      businessEmail: Joi.string().email(),
      aadharNumber: Joi.string(),
      panNumber: Joi.string(),
      userName: Joi.string(),
      companyPhone: Joi.string(),
      gstUsername: Joi.string(),
      gstNumber: Joi.string(),
      ifscCode: Joi.string(),
      website: Joi.string(),
    }).optional(),
  });

  protected readonly getTransaction = async (req: Request, res: Response) => {
    try {
      const transactionId = req.params.id;
      if (transactionId) {
        const transaction = await getTransactionById(transactionId)
        res.status(200).json({ message: "Transaction Listed", transaction });
        return;
      }
      const transactionList = await getTransaction()
      res.status(200).json({ message: "Transaction Listed", transactionList });
      return;
    } catch (error) {
      console.log("Error in getTransaction", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  }

  protected readonly createTransaction = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const payloadValue: ITransaction = await this.createTransactionSchema
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

      const newTransaction = await createTransaction(new Transaction({ ...payloadValue }));
      res.status(201).json(newTransaction);
      return;
    } catch (error) {
      console.log("Error in createTransaction", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly updateTransaction = async (req: Request, res: Response) => {
    try {
      const transactionId = req.params.id;
      const payload = req.body;

      const payloadValue: ITransaction = await this.updateTransactionSchema
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
      const existingTransaction = await getTransactionById(transactionId);
      if (!existingTransaction) {
        res.status(404).json({ message: "Transaction not found" });
        return;
      }

      const updated = await updateTransaction(
        new Transaction({ ...existingTransaction, ...payloadValue })
      );
      res.status(200).json(updated);
      return;
    } catch (error) {
      console.log("Error in updateTransaction", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };

  protected readonly deleteTransaction = async (req: Request, res: Response) => {
    try {
      const transactionId = req.params.id;
      const existingTransaction = await getTransactionById(transactionId);
      if (!existingTransaction) {
        res.status(404).json({ message: "Transaction not found" });
        return;
      }

      await deleteTransactionById(transactionId);
      res.status(200).json({ message: "Transaction deleted successfully" });
      return;
    } catch (error) {
      console.log("Error in deleteTransaction", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };
}
