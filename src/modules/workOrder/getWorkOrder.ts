import { WorkOrder } from ".";
import { WorkOrderModel } from "./schema";

export const getWorkOrder = async () => {
  const workOrder = await WorkOrderModel.find().populate({
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

  console.log("workOrder :", workOrder);
  return workOrder || null;
};
