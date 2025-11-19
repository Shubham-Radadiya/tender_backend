import { WorkOrder } from ".";
import { WorkOrderModel } from "./schema";

/**
 * Create a new workOrder record
 * @param workOrder - WorkOrder object
 * @returns Created workOrder
 */
export const createWorkOrder = async (workOrder: WorkOrder) => {
  const newParty = await WorkOrderModel.create(workOrder.toJSON());
  return new WorkOrder(newParty.toObject());
};
