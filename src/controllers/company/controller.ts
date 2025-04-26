import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import {
  IUser,
  User,
  getUserById,
  updateUser,
  getUser,
} from "../../modules/user";
import { UserRole } from "../../modules/user/schema";
import { Types } from "mongoose";
import { checkCompanyManagers } from "../../modules/user/checkCompanyManagers";

export default class Controller {
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
    }).optional(),
  });
  private readonly assignCompanyManagersSchema = Joi.object({
    companyManagerIds: Joi.array().items(Joi.string()).min(1).required(),
  });

  protected readonly update = async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
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

  protected readonly get = async (req: Request, res: Response) => {
    try {
      const companyId = req.params.id;
      if (companyId) {
        const company = await getUserById(companyId);
        res.status(200).json({ message: "Company Listed", company });
        return;
      }
      const companyList = await getUser(UserRole.COMPANY_MANAGER);
      res.status(200).json({ message: "Company Listed", companyList });
      return;
    } catch (error) {
      console.log("Error in getting the Company", error);
      res.status(500).json({ message: error.message });
      return;
    }
  };

  protected readonly assignCompanyManagersToGroupManager = async (
    req: Request,
    res: Response
  ) => {
    try {
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
      const payloadValue = await this.assignCompanyManagersSchema
        .validateAsync(payload)
        .then((value) => {
          console.log("VALUE", value);
          return value;
        })
        .catch((e) => {
          console.log(e);
          if (isError(e)) {
            return res.status(422).json(e);
          } else {
            return res.status(422).json({ message: e.message });
          }
        });
      console.log("payloadValue", payloadValue);
      if (!payloadValue) {
        return;
      }
      console.log("Worked");

      const groupManagerId = req.params.GmId;
      const groupManager = await getUserById(groupManagerId);
      if (!groupManager) {
        res.status(404).json({ message: "Group Manager not found" });
        return;
      }
      if (groupManager.role !== UserRole.GROUP_MANAGER) {
        res.status(400).json({ message: "User is not a Group Manager" });
        return;
      }

      const companyManagers = await checkCompanyManagers(
        payloadValue.companyManagerIds
      );

      if (companyManagers.length !== payloadValue?.companyManagerIds.length) {
        res
          .status(404)
          .json({ message: "One or more Company Managers not found" });
        return;
      }

      groupManager.managedCompanyManagers = [
        ...new Set([
          ...groupManager.managedCompanyManagers,
          ...payloadValue.companyManagerIds,
        ]),
      ];
      const updatedGroupManager = await updateUser(groupManager);

      res.status(200).json(updatedGroupManager);
      return;
    } catch (error) {
      console.log("Error in assignCompanyManagersToGroupManager:", error);
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
  };
  protected readonly assignCompanyManagersToBankManager = async (
    req: Request,
    res: Response
  ) => {
    try {
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
      const payloadValue = await this.assignCompanyManagersSchema
        .validateAsync(payload)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          if (isError(e)) {
            return res.status(422).json(e);
          } else {
            return res.status(422).json({ message: e.message });
          }
        });
      if (!payloadValue) {
        return;
      }

      const bankManagerId = req.params.BmId;
      const bankManager = await getUserById(bankManagerId);
      if (!bankManager) {
        res.status(404).json({ message: "Bank Manager not found" });
        return;
      }
      if (bankManager.role !== UserRole.BANK_MANAGER) {
        res.status(400).json({ message: "User is not a Bank Manager" });
        return;
      }

      const companyManagers = await checkCompanyManagers(
        payloadValue.companyManagerIds
      );

      if (companyManagers.length !== payloadValue?.companyManagerIds.length) {
        res
          .status(404)
          .json({ message: "One or more Company Managers not found" });
        return;
      }

      bankManager.managedCompanyManagers = [
        ...new Set([
          ...bankManager.managedCompanyManagers,
          ...payloadValue.companyManagerIds,
        ]),
      ];
      const updatedBankManager = await updateUser(bankManager);

      res.status(200).json(updatedBankManager);
      return;
    } catch (error) {
      console.log("Error in assignCompanyManagersToBankManager:", error);
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
  };
}
