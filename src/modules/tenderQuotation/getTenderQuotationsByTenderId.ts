import { TenderQuotation } from ".";
import { TenderQuotationModel } from "./schema";

/**
 * Get all quotations for a specific tender
 * @param tenderId - ID of the tender
 * @returns Array of quotations for the tender
 */
export const getTenderQuotationsByTenderId = async (tenderId: string) => {
  const quotations = await TenderQuotationModel.find({ tenderId })
    .populate({
      path: 'tenderId', select: 'tenderNo name tenderType lastDate category department nameOfWork providedBy items status',
      populate: [{ path: 'category', select: 'name' }, { path: 'department', select: 'name' }]
    })
    .populate({ path: "companyId", select: 'firstName lastName email phoneNumber profile companyDetails' })
    .lean();
  return quotations ? quotations.map((item) => new TenderQuotation(item)) : [];
};

/**
 * Get quotation for a specific tender
 * @param tenderId - ID of the tender
 * @returns Array of quotations for the tender
 */
export const getTenderQuotationByTenderId = async (tenderId: string) => {
  const quotation = await TenderQuotationModel.findOne({ tenderId })
    .populate({
      path: 'tenderId', select: 'tenderNo name tenderType lastDate category department nameOfWork providedBy items status',
      populate: [{ path: 'category', select: 'name' }, { path: 'department', select: 'name' }]
    })
    .populate({ path: "companyId", select: 'firstName lastName email phoneNumber profile companyDetails' })
    .lean();
  return new TenderQuotation(quotation);
};
