import { prismaMongoClient } from "../../prisma";

export const addManagerOrderService = async (
  orderId: string,
  managerId: string,
) => {
  try {
    await prismaMongoClient.order.update({
      where: { id: orderId },
      data: { managerId },
    });
  } catch (error) {
    console.log("Adding manager to order error: ", error);
    throw error;
  }
};
