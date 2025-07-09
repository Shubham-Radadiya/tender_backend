import { TenderModel } from "./schema";
import { ITender } from "./types";

/**
 * Update a Tender document by ID
 * @param id - Tender ID to update
 * @param updateData - Partial tender data to update
 * @returns updated Tender document
 */
export const updateTenderById = async (id: string, updateData: any) => {
  try {
    const updatedTender = await TenderModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return updatedTender;
  } catch (error) {
    console.error("Error in updateTenderById:", error);
    throw error;
  }
};
