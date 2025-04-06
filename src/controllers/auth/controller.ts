import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import { AES, SHA256 } from "crypto-js";
import {
  IUser,
  User,
  getPopulatedUser,
  getUserByEmail,
  updateUser,
} from "../../modules/user";
import { generateToken } from "../../helper/jwtToken";

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
    pushToken: Joi.string().optional(),
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
}
