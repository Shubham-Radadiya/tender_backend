import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import { SHA256 } from "crypto-js";
import {
  IUser,
  User,
  createOTPAndUpdateUser,
  createUser,
  getPopulatedUser,
  getUserByEmail,
  updateUser,
  getUserById,
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
  private readonly forgotPasswordSchema = Joi.object({
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
  });
  private readonly verifyOtpSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.base": "Email must be a string.",
        "string.email": "Email must be a valid email address.",
        "any.required": "Email is required.",
      }),
    otp: Joi.number().integer().min(100000).max(999999).required().messages({
      "number.base": "OTP must be a number.",
      "number.min": "OTP must be a 6-digit number.",
      "number.max": "OTP must be a 6-digit number.",
      "any.required": "OTP is required.",
    }),
    newPassword: Joi.string()
      .required()
      .min(6)
      .custom((v) => {
        return SHA256(v).toString();
      }),
  }).external(async (value) => {
    const user: IUser = await UserModel.findOne({
      email: value.email,
      otp: value.otp,
      otpExpiry: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error("Invalid OTP or email, or OTP has expired.");
    }

    return value;
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

  protected readonly forgotPassword = async (req: Request, res: Response) => {
    try {
      const payload = req.body;

      if (!payload) {
        res.status(422).json({ message: "Invalid request body" });
        return;
      }

      const payloadValue: IUser = await this.forgotPasswordSchema.validateAsync(
        payload
      );

      if (!payloadValue) {
        res.status(422).json({ message: "Invalid email format" });
        return;
      }

      const user: IUser = await createOTPAndUpdateUser(payloadValue.email);

      if (!user) {
        res.status(422).json({ message: "User not found." });
        return;
      }

      // Send OTP to user's email (Add the actual email sending logic)
      // Example: await sendOtpEmail(user.email, user.otp);
      res
        .status(200)
        .json({ message: "OTP sent to your email.", otp: user.otp });
      return;
    } catch (error) {
      console.error("Error in forgotPassword", error);
      res.status(500).json({ error: error?.message });
      return;
    }
  };

  protected readonly verifyOtp = async (req: Request, res: Response) => {
    try {
      const { email, otp, newPassword } = req.body;

      if (!email || !otp || !newPassword) {
        res
          .status(400)
          .json({ message: "Email, OTP, and new password are required." });
        return;
      }

      const payloadValue = await this.verifyOtpSchema.validateAsync({
        email,
        otp,
        newPassword,
      });

      if (!payloadValue) {
        res.status(422).json({ message: "Invalid email format" });
        return;
      }

      const user = await UserModel.findOne({ email, otp });

      if (!user || user.otpExpiry.getTime() < Date.now()) {
        res.status(422).json({ message: "Invalid or expired OTP." });
        return;
      }

      user.password = payloadValue.newPassword;
      user.otp = null;
      user.otpExpiry = null;
      await user.save();

      res.status(200).json({ message: "Password reset successful." });
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
      const authUser = req?.authUser;
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

      if (payloadValue.email !== authUser?.email) {
        res.status(422).json({ message: "Invalid Email." });
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

  protected readonly logout = async (req: Request, res: Response) => {
    try {
      // Clear the auth cookie
      res.clearCookie("auth");
      // Remove the auth token from header
      res.removeHeader("x-auth-token");

      res.status(200).json({ message: "Logged out successfully" });
      return;
    } catch (error) {
      console.log("Error in logout", error);
      res.status(500).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly impersonate = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const adminUser = req.authUser;

      // Check if the requesting user is an admin
      if (adminUser.role !== UserRole.ADMIN) {
        res.status(403).json({ message: "Only admin can impersonate users" });
        return;
      }

      // Get the user to impersonate
      const userToImpersonate = await getUserById(userId);
      if (!userToImpersonate) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Generate token for the impersonated user
      const token = await generateToken(userToImpersonate._id);

      // Get populated user data
      const populatedUser = await getPopulatedUser(userToImpersonate._id);

      // Set the impersonation cookie and token
      res
        .cookie("auth", token, {
          expires: new Date("12/31/2100"),
          signed: true,
        })
        .cookie("impersonating", "true", {
          expires: new Date("12/31/2100"),
          signed: true,
        })
        .setHeader("x-auth-token", token)
        .status(200)
        .json({
          ...populatedUser,
          token,
          isImpersonating: true,
          originalAdminId: adminUser._id,
        });
      return;
    } catch (error) {
      console.log("Error in impersonate", error);
      res.status(500).json({
        error: error?.message,
      });
      return;
    }
  };

  protected readonly stopImpersonating = async (
    req: Request,
    res: Response
  ) => {
    try {
      const adminUser = req.authUser;

      // Check if currently impersonating
      if (!req.signedCookies.impersonating) {
        res
          .status(400)
          .json({ message: "Not currently impersonating any user" });
        return;
      }

      // Generate token for the admin
      const token = await generateToken(adminUser._id);

      // Get populated admin data
      const populatedAdmin = await getPopulatedUser(adminUser._id);

      // Clear impersonation cookie and set new admin token
      res
        .clearCookie("impersonating")
        .cookie("auth", token, {
          expires: new Date("12/31/2100"),
          signed: true,
        })
        .setHeader("x-auth-token", token)
        .status(200)
        .json({
          ...populatedAdmin,
          token,
          isImpersonating: false,
        });
      return;
    } catch (error) {
      console.log("Error in stopImpersonating", error);
      res.status(500).json({
        error: error?.message,
      });
      return;
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
