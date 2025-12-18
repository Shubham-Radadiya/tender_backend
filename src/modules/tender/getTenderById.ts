import { Tender } from ".";
import { TenderQuotationModel } from "../tenderQuotation/schema";
import { TenderModel, TenderStatus } from "./schema";

/**
 *
 * @param _id tender id
 * @returns relevant tender record | null
 */
export const getTenderById = async (_id: string) => {
  const tender = await TenderModel.findById(_id)
    .populate("category")
    .populate("department")
    .populate("history.by", "firstName lastName role")
    .lean();
  if (!tender) return null;
  const quotations = await TenderQuotationModel.find({ tenderId: _id })
    .populate(
      "companyId",
      "firstName lastName email phoneNumber profile companyDetails"
    )
    .lean();

  const enrichedQuotations = quotations.map((quotation) => {
    const enrichedItemRates = quotation.itemRates.map((rate) => {
      const itemDetail = tender.items.find(
        (item: any) => item._id.toString() === rate.itemId.toString()
      );
      return {
        ...rate,
        // itemDetail: itemDetail || null,
      };
    });
    return {
      ...quotation,
      itemRates: enrichedItemRates,
    };
  });

  return {
    ...new Tender(tender),
    quotations: enrichedQuotations,
  };
};

export const getTenderByCompany = async (companyAssigned: string) => {
  // const statuses = [
  //   TenderStatus.CM_ACCEPTED,
  //   TenderStatus.CM_PENDING,
  //   TenderStatus.CM_DECLINED,
  // ];
  const tender = await TenderModel.find({
    companyAssigned,
    // status: { $in: statuses },
  })
    .populate("category")
    .populate("department")
    .populate("history.by", "firstName lastName role")
    .lean();
  return tender ? tender.map((item) => new Tender(item)) : null;
};
