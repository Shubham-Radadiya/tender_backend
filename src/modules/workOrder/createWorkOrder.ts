import { WorkOrder } from ".";
import { WorkOrderModel } from "./schema";

/**
 * Create a new workOrder record
 * @param workOrder - WorkOrder object
 * @returns Created workOrder
 */
export const createWorkOrder = async (workOrder: WorkOrder) => {
  const payload = {
    ...workOrder.toJSON(),
    isBillGenerated: workOrder.isBillGenerated ?? false,
  };
  const newParty = await WorkOrderModel.create(payload);
  return new WorkOrder(newParty.toObject());
};
