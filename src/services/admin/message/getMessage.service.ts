import { prismaMongoClient } from "../../../prisma";

export const getMessageService = async (messageId: string) => {
  try {
    const message = await prismaMongoClient.message.findUnique({
      where: { id: messageId },
    });

    return message;
  } catch (error) {
    throw error;
  }
};
