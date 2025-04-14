import { SQLiteClient } from "../../prisma";

export const getLogs = async (page: number, pageSize: number) => {
  const skip = (page - 1) * pageSize;
  return SQLiteClient.notificationLog.findMany({
    skip,
    take: pageSize,
    orderBy: { createdAt: "desc" },
  });
};
