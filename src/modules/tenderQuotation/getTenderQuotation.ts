import { TenderQuotation } from ".";
import { TenderQuotationModel } from "./schema";

export const getTenderQuotation = async () => {
  const tenderQuotation = await TenderQuotationModel.find();
  return tenderQuotation
    ? tenderQuotation.map((item) => new TenderQuotation(item))
    : null;
};
