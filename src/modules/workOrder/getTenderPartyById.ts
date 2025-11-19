import { WorkOrder } from ".";
import { WorkOrderModel } from "./schema";

/**
 *
 * @param _id workOrder id
 * @returns relevant workOrder record | null
 */
export const getWorkOrderById = async (_id: string) => {
  const workOrder = await WorkOrderModel.findById(_id);
  return workOrder ? new WorkOrder(workOrder) : null;
};
