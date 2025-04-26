import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import { AES, SHA256 } from "crypto-js";
import {
  IUser,
  User,
  createUser,
  getPopulatedUser,
  getUserByEmail,
  updateUser,
} from "../../modules/user";
import { generateToken } from "../../helper/jwtToken";
import { UserModel, UserRole } from "../../modules/user/schema";

export default class Controller {
  private readonly loginSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .external(async (v: string) => {
        const user: IUser = await getUserByEmail(v);
        if (!user) {
          throw new Error("This email address is does not exists.");
        }
        return v;
      }),
    password: Joi.string()
      .required()
      .min(6)
      .custom((v) => {
        return SHA256(v).toString();
      }),
  });
  private readonly resetPasswordSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .external(async (v: string) => {
        const user: IUser = await getUserByEmail(v);
        if (!user) {
          throw new Error("This email address is does not exists.");
        }
        return v;
      }),
    newPassword: Joi.string()
      .required()
      .min(6)
      .custom((v) => {
        return SHA256(v).toString();
      }),
    confirmPassword: Joi.string().required(),
  });

  protected readonly login = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
      const payloadValue: IUser = await this.loginSchema
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

      const user: IUser = await getUserByEmail(payloadValue.email);
      if (!user) {
        res.status(422).json({ message: "User Not Found!" });
        return;
      }

      if (payloadValue.password !== user.password) {
        res.status(401).json({ message: "Invalid password" });
        return;
      }
      const populatedUser = await getPopulatedUser(user._id);

      const token = await generateToken(user._id);
      res
        .cookie("auth", token, {
          expires: new Date("12/31/2100"),
          signed: true,
        })
        .setHeader("x-auth-token", token)
        .status(200)
        .json({ ...populatedUser, token });
      return;
    } catch (error) {
      console.log("Error in login", error);
      res.status(500).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly resetPassword = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
      }
      if (payload.newPassword !== payload.confirmPassword) {
        res.status(403).json({
          message: "Confirm password must match the new password",
        });
        return;
      }

      const payloadValue = await this.resetPasswordSchema
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

      const user: User = await getUserByEmail(payloadValue.email);
      if (!user) {
        res.status(422).json({
          message: "Entered email has not been registered!",
        });
        return;
      }

      const toUpdateUser = new User({
        ...user.toJSON(),
        password: payloadValue.newPassword,
      });

      const updatedUser = await updateUser(toUpdateUser);

      const populatedUser = await getPopulatedUser(updatedUser._id);

      res.status(200).json(populatedUser);
    } catch (error) {
      console.log("########## Error in Reset Password", error);
      res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly addUsers = async (req: Request, res: Response) => {
    try {
      const defaultUsers = [
        {
          firstName: "ADMIN",
          lastName: "test",
          email: "admin@gmail.com",
          role: UserRole.ADMIN,
        },
        {
          firstName: "TM",
          lastName: "test",
          email: "tm@gmail.com",
          role: UserRole.TENDER_MANAGER,
        },
        {
          firstName: "GM",
          lastName: "test",
          email: "gm@gmail.com",
          role: UserRole.GROUP_MANAGER,
        },
        {
          firstName: "Sahjanand",
          lastName: "Enterprise",
          email: "cm@gmail.com",
          role: UserRole.COMPANY_MANAGER,
        },
        {
          firstName: "BM",
          lastName: "test",
          email: "bm@gmail.com",
          role: UserRole.BANK_MANAGER,
        },
      ];

      const hashedPassword = await SHA256("admin@123").toString();

      const promises = defaultUsers.map(async (user) => {
        const existingUser = await UserModel.findOne({ email: user.email });

        const commonFields: any = {
          ...user,
          password: hashedPassword,
          dob: new Date("1000-01-11"),
          phoneNumber: "1234567890",
          address: "5th lorem ipsum",
          city: "ABC",
          state: "Gujarat",
          profile:
            "https://fastly.picsum.photos/id/674/200/300.webp?hmac=JC6maMsnZpQnPL0Goni0akBwySwzftv6rI94aPPBhpA",
        };

        if (existingUser) {
          if (
            user.role === UserRole.COMPANY_MANAGER &&
            !existingUser?.companyDetails?.annualTenderCap
          ) {
            if (!commonFields.companyDetails) {
              commonFields.companyDetails = {};
            }
            commonFields.companyDetails.annualTenderCap = 10000;
          }
          await UserModel.findByIdAndUpdate(existingUser._id, commonFields);
          return { ...commonFields, _id: existingUser._id, updated: true };
        } else {
          if (user.role === UserRole.COMPANY_MANAGER) {
            if (!commonFields.companyDetails) {
              commonFields.companyDetails = {};
            }
            commonFields.companyDetails.annualTenderCap = 10000;
          }
          const created = await createUser(new User(commonFields));
          return { ...created, updated: false };
        }
      });

      const results = await Promise.all(promises);

      res.status(200).json({
        message: "Users processed successfully",
        data: results,
      });
    } catch (error) {
      console.log("########## Error in Adding Users", error);
      res.status(500).json({
        message: "Something happened wrong try again after sometime.",
        error: _get(error, "message"),
      });
    }
  };
}
