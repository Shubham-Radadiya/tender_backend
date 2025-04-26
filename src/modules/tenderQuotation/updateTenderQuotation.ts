import { TenderQuotation } from ".";
import { TenderQuotationModel } from "./schema";

/**
 *
 * @param tenderQuotation
 * @returns update tenderQuotation record
 */
export const updateTenderQuotation = async (
  tenderQuotation: TenderQuotation
) => {
  await TenderQuotationModel.findByIdAndUpdate(
    tenderQuotation._id,
    tenderQuotation.toJSON()
  );
  return tenderQuotation;
};
