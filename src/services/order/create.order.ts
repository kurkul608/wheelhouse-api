import { Prisma } from "@prisma/client";
import { prismaMongoClient } from "../../prisma";

export const createOrder = async (
  carId: string,
  userId: string,
): Promise<Prisma.OrderGetPayload<any>> => {
  const order = await prismaMongoClient.order.create({
    data: { userId, carCardIds: [carId] },
  });

  return order;
};
