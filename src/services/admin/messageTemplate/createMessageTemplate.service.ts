import { MessageTemplate, Prisma } from "@prisma/client";
import prisma from "../../../prisma";

export const createMessageTemplateService = async (
  dto: Prisma.MessageTemplateCreateInput,
): Promise<MessageTemplate> => {
  try {
    const messageTemplate = await prisma.messageTemplate.create({ data: dto });
    return messageTemplate;
  } catch (error) {
    throw error;
  }
};
