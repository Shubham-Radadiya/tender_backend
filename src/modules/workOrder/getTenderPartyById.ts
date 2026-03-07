import { WorkOrder } from ".";
import { WorkOrderModel } from "./schema";

/**
 *
 * @param _id workOrder id
 * @returns relevant workOrder record | null
 */
export const getWorkOrderById = async (_id: string) => {
  const workOrder = await WorkOrderModel.findById(_id).populate({
    path: "tenderId",
    select: "companyAssigned department",
    populate: [
      {
        path: "companyAssigned",
        model: "user",
        select: "firstName lastName",
      },
      {
        path: "department",
        model: "department",
        select: "name",
      },
    ],
  });
  return workOrder ? workOrder : null;
};
