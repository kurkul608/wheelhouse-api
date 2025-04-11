import { MessageTemplate, Prisma } from "@prisma/client";
import prisma from "../../../prisma";

export const updateMessageTemplateService = async (
  messageTemplateId: string,
  {
    photoIds,
    ...dto
  }: Prisma.MessageTemplateUpdateInput & { photoIds?: string[] },
): Promise<MessageTemplate> => {
  try {
    const existTemplate = await prisma.messageTemplate.findUnique({
      where: { id: messageTemplateId },
    });
    if (!existTemplate) {
      throw new Error("Message template not found");
    }

    if (photoIds && photoIds.length > 0) {
      const photos = await prisma.file.findMany({
        where: {
          id: { in: photoIds },
        },
      });

      if (photos.length !== photoIds.length) {
        throw new Error("Один или несколько файлов не найдены");
      }
    }

    const messageTemplate = await prisma.messageTemplate.update({
      where: { id: messageTemplateId },
      data: {
        ...dto,
        ...(photoIds && {
          photos: {
            set: photoIds.map((id) => ({ id })),
          },
        }),
      },
    });

    return messageTemplate;
  } catch (error) {
    throw error;
  }
};
