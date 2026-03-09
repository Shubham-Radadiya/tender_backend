import { WorkOrder } from ".";
import { WorkOrderModel } from "./schema";

/**
 *
 * @param workOrder
 * @returns update WorkOrder record
 */
export const updateWorkOrder = async (workOrder: WorkOrder) => {
  console.log("workOrder :", workOrder);
  const updateData = workOrder.toJSON();
  delete updateData._id;
  const updated = await WorkOrderModel.findByIdAndUpdate(
    workOrder._id,
    updateData,
    { new: true },
  );
  console.log("updated :", updated);
  return updated;
};
