import { Prisma } from "@prisma/client";
import prisma from "../../prisma";

export const createOrder = async (
  carId: string,
  userId: string,
): Promise<Prisma.OrderGetPayload<any>> => {
  const order = await prisma.order.create({
    data: { userId, carCardIds: [carId] },
  });

  return order;
};
