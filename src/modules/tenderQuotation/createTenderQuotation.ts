import { TenderQuotation } from ".";
import { TenderQuotationModel } from "./schema";

/**
 * Create a new tenderQuotation record
 * @param tenderQuotation - TenderQuotation object
 * @returns Created tenderQuotation
 */
export const createTenderQuotation = async (
  tenderQuotation: TenderQuotation
) => {
  const newTenderQuotation = await TenderQuotationModel.create(
    tenderQuotation.toJSON()
  );
  return new TenderQuotation(newTenderQuotation.toObject());
};
