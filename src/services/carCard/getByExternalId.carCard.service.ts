import prisma from "../../prisma";
import { Prisma } from "@prisma/client";

export const getByExternalIdCarCardService = async (
  externalId?: string,
): Promise<Prisma.CarCardGetPayload<any> | null> => {
  const carCard = await prisma.carCard.findFirst({ where: { externalId } });
  return carCard;
};
