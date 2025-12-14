import { NotificationModel } from "./schema/notification";
import { INotification } from "./types/notification";

interface PaginationParams {
  page: number;
  limit: number;
  isRead?: boolean;
}

interface PaginatedResponse {
  notifications: INotification[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const getPaginatedNotifications = async (
  userId: string,
  { page = 1, limit = 20, isRead = false }: PaginationParams
): Promise<PaginatedResponse> => {
  try {
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count of notifications for the user
    const total = await NotificationModel.countDocuments({ userId, isRead });

    // Get paginated notifications
    const notifications = await NotificationModel.find({ userId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      notifications,
      total,
      currentPage: page,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };
  } catch (error) {
    throw new Error(`Error fetching paginated notifications: ${error.message}`);
  }
};
