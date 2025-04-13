import prisma from "../../../prisma";
import { Prisma } from "@prisma/client";

export const getMessageListService = async (
  where?: Prisma.MessageWhereInput,
) => {
  try {
    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return messages;
  } catch (error) {
    throw error;
  }
};
