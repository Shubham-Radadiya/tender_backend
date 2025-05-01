import { TenderQuotation } from ".";
import { TenderQuotationModel } from "./schema";

/**
 * Get all quotations for a specific tender
 * @param tenderId - ID of the tender
 * @returns Array of quotations for the tender
 */
export const getTenderQuotationsByTenderId = async (tenderId: string) => {
  const quotations = await TenderQuotationModel.find({ tenderId })
    .populate("companyId", "firstName lastName email phoneNumber profile companyDetails")
    .lean();
  return quotations ? quotations.map(item => new TenderQuotation(item)) : [];
}; 