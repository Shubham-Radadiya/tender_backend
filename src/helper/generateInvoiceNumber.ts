import crypto from "crypto";
import { getBillsByCompanyAndTenderId } from "../modules/bill";

export const generateInvoiceNumber = async (
  authUser: any,
  tenderId: string
): Promise<string> => {
  // Extract initials
  const initials = `${authUser.firstName?.[0] ?? ''}${authUser.lastName?.[0] ?? ''}`.toUpperCase();

  // Generate a short random alphanumeric string (6 chars)
  const randomCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // e.g., 'A1B2C3'

  // Get existing bills for company+tender to compute sequence number
  const bills = await getBillsByCompanyAndTenderId(authUser._id, tenderId);
  const sequence = (bills.length + 1).toString().padStart(2, '0');

  // Format: XX-A1B2C3-01
  return `${initials}-${randomCode}-${sequence}`;
};