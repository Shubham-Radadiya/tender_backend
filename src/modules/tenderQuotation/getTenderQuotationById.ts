import { TenderQuotation } from ".";
import { TenderQuotationModel } from "./schema";

/**
 *
 * @param _id tenderQuotation id
 * @returns relevant tenderQuotation record | null
 */
export const getTenderQuotationById = async (_id: string) => {
  const tenderQuotation = await TenderQuotationModel.findById(_id);
  return tenderQuotation ? new TenderQuotation(tenderQuotation) : null;
};
