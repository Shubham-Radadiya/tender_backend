import { TenderQuotation } from ".";
import { TenderQuotationModel } from "./schema";

/**
 *
 * @param _id tenderQuotation id
 * @returns relevant tenderQuotation record | null
 */
export const getPopulatedTenderQuotationById = async (_id: string) => {
  const tenderQuotation = await TenderQuotationModel.findById(_id)
    .populate({
      path: 'tenderId', select: 'tenderNo name tenderType lastDate category department nameOfWork providedBy items status',
      populate: [{ path: 'category', select: 'name' }, { path: 'department', select: 'name' }]
    })
    .populate({ path: "companyId", select: 'firstName lastName email phoneNumber profile companyDetails' })
  return tenderQuotation ? new TenderQuotation(tenderQuotation) : null;
};
