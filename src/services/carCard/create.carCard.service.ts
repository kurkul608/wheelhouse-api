import { Prisma } from "@prisma/client";
import prisma from "../../prisma";

export const createCarService = async (
  carCardDto: Prisma.CarCardCreateInput,
): Promise<Prisma.CarCardGetPayload<any>> => {
  const carCard = await prisma.carCard.create({ data: carCardDto });

  return carCard;
};
