import { prismaMongoClient } from "../../../prisma";
import { Prisma } from "@prisma/client";

export const getMessageListService = async (
  where?: Prisma.MessageWhereInput,
) => {
  try {
    const messages = await prismaMongoClient.message.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return messages;
  } catch (error) {
    throw error;
  }
};
