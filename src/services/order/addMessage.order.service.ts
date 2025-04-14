import { prismaMongoClient } from "../../prisma";

export const addMessageOrderService = async (
  orderId: string,
  messageId: string,
) => {
  try {
    await prismaMongoClient.order.update({
      where: { id: orderId },
      data: { messageId },
    });
  } catch (error) {
    console.log("Adding message error: ", error);
    throw error;
  }
};
