import { MessageTemplate, Prisma } from "@prisma/client";
import { prismaMongoClient } from "../../../prisma";

export const getMessageTemplateService = async (
  messageTemplateId: string,
): Promise<MessageTemplate | null> => {
  try {
    const messageTemplate = await prismaMongoClient.messageTemplate.findUnique({
      where: { id: messageTemplateId },
      include: { photos: true },
    });
    return messageTemplate;
  } catch (error) {
    throw error;
  }
};
