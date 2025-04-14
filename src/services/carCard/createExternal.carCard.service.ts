import { Prisma } from "@prisma/client";
import { prismaMongoClient } from "../../prisma";

export const createExternalCarService = async (
  carCardDto: Prisma.CarCardCreateInput,
): Promise<Prisma.CarCardGetPayload<any>> => {
  const carCard = await prismaMongoClient.carCard.create({
    data: { ...carCardDto },
  });

  return carCard;
};
