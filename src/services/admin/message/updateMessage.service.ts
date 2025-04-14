import { Prisma } from "@prisma/client";
import { prismaMongoClient } from "../../../prisma";

export const updateMessageService = async (
  messageId: string,
  dto: Prisma.MessageUpdateInput,
) => {
  try {
    const message = await prismaMongoClient.message.update({
      where: { id: messageId },
      data: dto,
    });

    return message;
  } catch (error) {
    throw error;
  }
};
