import { MessageTemplate, Prisma } from "@prisma/client";
import { prismaMongoClient } from "../../../prisma";

export const createMessageTemplateService = async ({
  photoIds,
  ...dto
}: Prisma.MessageTemplateCreateInput & {
  photoIds?: string[];
}): Promise<MessageTemplate> => {
  try {
    if (photoIds && photoIds.length > 0) {
      const photos = await prismaMongoClient.file.findMany({
        where: {
          id: { in: photoIds },
        },
      });

      if (photos.length !== photoIds.length) {
        throw new Error("Один или несколько файлов не найдены");
      }
    }

    const messageTemplate = await prismaMongoClient.messageTemplate.create({
      data: {
        ...dto,
        ...(photoIds
          ? {
              photos: {
                connect: photoIds.map((id) => ({ id })),
              },
            }
          : {}),
      },
    });
    return messageTemplate;
  } catch (error) {
    throw error;
  }
};
