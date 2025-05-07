import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import { AES, SHA256 } from "crypto-js";
import {
  IUser,
  User,
  getUserById,
  createUser,
  updateUser,
  deleteUserById,
  getUser,
} from "../../modules/user";
import { UserRole } from "../../modules/user/schema";
import { checkCompanyManagers } from "../../modules/user/checkCompanyManagers";

export default class Controller {
  private readonly createUserSchema = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    dob: Joi.date().optional(),
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string()
      .min(6)
      .custom((v) => {
        return SHA256(v).toString();
      })
      .required(),
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
      annualTenderCap: Joi.number(),
    }).optional(),
    managedCompanyManagers: Joi.array().items(Joi.string()).optional(),
  }).custom((value, helpers) => {
    if (
      value.role === "COMPANY_MANAGER" &&
      (!value.companyDetails || value.companyDetails.annualTenderCap == null)
    ) {
      return helpers.error("any.custom", {
        message: `"annualTenderCap" is required inside companyDetails when role is COMPANY_MANAGER`,
      });
    }
    return value;
  });

  private readonly updateUserSchema = Joi.object({
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
      annualTenderCap: Joi.number(),
    }).optional(),
  });

  protected readonly get = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      if (userId) {
        const user = await getUserById(userId);
        res.status(200).json({ message: "User Listed", user });
        return;
      }
      const userList = await getUser();
      res.status(200).json({ message: "User Listed", userList });
      return;
    } catch (error) {
      console.log("Error in getting the User", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };

  protected readonly createUser = async (req: Request, res: Response) => {
    try {
      // Admin only
      const authUser = req.authUser;
      if (authUser.role !== UserRole.ADMIN) {
        res.status(403).json({ message: "Only admin can create users" });
        return;
      }

      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
      const payloadValue: IUser = await this.createUserSchema
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
        payloadValue.role === "GROUP_MANAGER" &&
        Array.isArray(payloadValue.managedCompanyManagers)
      ) {
        const validManagers = await checkCompanyManagers(
          payloadValue.managedCompanyManagers
        );

        if (
          !validManagers ||
          validManagers.length !== payloadValue.managedCompanyManagers.length
        ) {
          res.status(400).json({
            message:
              "All companyManagerIds must belong to users with role COMPANY_MANAGER",
          });
          return;
        }
      }

      const newUser = await createUser(new User({ ...payloadValue }));
      res.status(201).json(newUser);
      return;
    } catch (error) {
      console.log("Error in createUser", error);
      res.status(400).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly updateUser = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const payload = req.body;

      const payloadValue: IUser = await this.updateUserSchema
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
      const existingUser = await getUserById(userId);
      if (!existingUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const updated = await updateUser(
        new User({ ...existingUser, ...payloadValue })
      );
      res.status(200).json(updated);
      return;
    } catch (error) {
      console.log("Error in updateUser", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };

  protected readonly deleteUser = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const existingUser = await getUserById(userId);
      if (!existingUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      await deleteUserById(userId);
      res.status(200).json({ message: "User deleted successfully" });
      return;
    } catch (error) {
      console.log("Error in deleteUser", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };
}
