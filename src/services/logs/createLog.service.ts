import { SQLiteClient } from "../../prisma";

export const createLog = async (
  campaignId: string,
  userId: string,
  status: string,
) => {
  return SQLiteClient.notificationLog.create({
    data: { campaignId, userId, status },
  });
};
