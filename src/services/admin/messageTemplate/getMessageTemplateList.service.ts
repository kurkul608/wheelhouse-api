import { MessageTemplate } from "@prisma/client";
import { prismaMongoClient } from "../../../prisma";

export const getMessageTemplateListService = async (): Promise<
  MessageTemplate[]
> => {
  try {
    const messageTemplateList =
      await prismaMongoClient.messageTemplate.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    return messageTemplateList;
  } catch (error) {
    throw error;
  }
};
