import { WorkOrderModel } from "./schema";

export const getWorkOrder = async () => {
  const workOrder = await WorkOrderModel.find().populate({
    path: "tenderId",
    select: "companyAssigned department items subject nameOfWork",
    populate: [
      {
        path: "companyAssigned",
        model: "user",
        select: "firstName lastName address phoneNumber name companyDetails profile",
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

  console.log("workOrder :", workOrder);
  return workOrder || null;
};
