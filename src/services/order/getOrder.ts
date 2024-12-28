import prisma from "../../prisma";
import { Prisma } from "@prisma/client";

export const getOrder = async (
  orderId: string,
): Promise<Prisma.OrderGetPayload<any> | null> => {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    return order;
  } catch (error) {
    console.log("Get order error: ", error);
    throw error;
  }
};
