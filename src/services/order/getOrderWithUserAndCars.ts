import { prismaMongoClient } from "../../prisma";
import { Prisma } from "@prisma/client";

export const getOrderWithUserAndCars = async (
  orderId: string,
): Promise<Prisma.OrderGetPayload<{
  include: {
    user: true;
    carCards: { include: { specifications: true } };
    manager: true;
  };
}> | null> => {
  try {
    const order = await prismaMongoClient.order.findUnique({
      where: { id: orderId },
      include: {
        carCards: { include: { specifications: true } },
        user: true,
        manager: true,
      },
    });

    return order;
  } catch (error) {
    console.log("Get order error: ", error);
    throw error;
  }
};
