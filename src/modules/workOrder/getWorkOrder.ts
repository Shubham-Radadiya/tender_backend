import { WorkOrder } from ".";
import { WorkOrderModel } from "./schema";

export const getWorkOrder = async () => {
  const workOrder = await WorkOrderModel.find();
  return workOrder
    ? workOrder.map((item) => new WorkOrder(item))
    : null;
};
