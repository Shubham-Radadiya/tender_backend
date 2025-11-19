import { WorkOrderModel } from "./schema";

/**
 * will delete workOrder
 * @param _id
 */
export const deleteWorkOrderById = async (_id: string) => {
  await WorkOrderModel.findByIdAndDelete(_id);
};
