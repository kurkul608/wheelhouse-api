import { MessageTemplate } from "@prisma/client";
import prisma from "../../../prisma";

export const getMessageTemplateListService = async (): Promise<
  MessageTemplate[]
> => {
  try {
    const messageTemplateList = await prisma.messageTemplate.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return messageTemplateList;
  } catch (error) {
    throw error;
  }
};
