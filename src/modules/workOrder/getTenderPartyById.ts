import { WorkOrderModel } from "./schema";

/**
 *
 * @param _id workOrder id
 * @returns relevant workOrder record | null
 */
export const getWorkOrderById = async (_id: string) => {
  const workOrder = await WorkOrderModel.findById(_id).populate({
    path: "tenderId",
    select: "companyAssigned department items subject nameOfWork",
    populate: [
      {
        path: "companyAssigned",
        model: "user",
        select:
          "firstName lastName address phoneNumber name companyDetails profile",
      },
      {
        path: "department",
        model: "department",
        select: "name",
      },
      {
        path: "items.unit",
        model: "unit",
        select: "name",
      },
    ],
  });
  return workOrder ? workOrder : null;
};
