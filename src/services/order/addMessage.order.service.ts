import prisma from "../../prisma";

export const addMessageOrderService = async (
  orderId: string,
  messageId: string,
) => {
  try {
    await prisma.order.update({ where: { id: orderId }, data: { messageId } });
  } catch (error) {
    console.log("Adding message error: ", error);
    throw error;
  }
};
