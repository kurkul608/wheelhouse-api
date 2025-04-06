import { MessageTemplate, Prisma } from "@prisma/client";
import prisma from "../../../prisma";

export const getMessageTemplateService = async (
  messageTemplateId: string,
): Promise<MessageTemplate | null> => {
  try {
    const messageTemplate = await prisma.messageTemplate.findUnique({
      where: { id: messageTemplateId },
    });
    return messageTemplate;
  } catch (error) {
    throw error;
  }
};
