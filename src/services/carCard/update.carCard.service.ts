import prisma from "../../prisma";
import { Prisma } from "@prisma/client";

export const updateCarCardService = async (
  carCarId: string,
  data: Prisma.CarCardUpdateInput,
): Promise<Prisma.CarCardGetPayload<any> | null> => {
  try {
    await prisma.carCard.update({ where: { id: carCarId }, data: data });

    return prisma.carCard.findUnique({ where: { id: carCarId } });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
