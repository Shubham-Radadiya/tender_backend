import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
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

  protected readonly update = async (req: Request, res: Response) => {
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
}
