import { MessageTemplate, Prisma } from "@prisma/client";
import prisma from "../../../prisma";

export const updateMessageTemplateService = async (
  messageTemplateId: string,
  dto: Prisma.MessageTemplateUpdateInput,
): Promise<MessageTemplate> => {
  try {
    const existTemplate = await prisma.messageTemplate.findUnique({
      where: { id: messageTemplateId },
    });
    if (!existTemplate) {
      throw new Error("Message template not found");
    }

    const messageTemplate = await prisma.messageTemplate.update({
      where: { id: messageTemplateId },
      data: dto,
    });

    return messageTemplate;
  } catch (error) {
    throw error;
  }
};
