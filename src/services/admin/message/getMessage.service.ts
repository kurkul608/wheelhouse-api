import prisma from "../../../prisma";

export const getMessageService = async (messageId: string) => {
  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    return message;
  } catch (error) {
    throw error;
  }
};
