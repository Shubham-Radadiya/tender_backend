import { WorkOrder } from ".";
import { WorkOrderModel } from "./schema";

/**
 *
 * @param workOrder
 * @returns update WorkOrder record
 */
export const updateWorkOrder = async (workOrder: WorkOrder) => {
  await WorkOrderModel.findByIdAndUpdate(workOrder._id, workOrder.toJSON());
  return workOrder;
};
