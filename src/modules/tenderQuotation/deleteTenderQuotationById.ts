import { TenderQuotationModel } from "./schema";

/**
 * will delete tenderQuotation
 * @param _id
 */
export const deleteTenderQuotationById = async (_id: string) => {
  await TenderQuotationModel.findByIdAndDelete(_id);
};
