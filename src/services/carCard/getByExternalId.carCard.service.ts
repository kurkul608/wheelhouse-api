import prisma from "../../prisma";
import { Prisma } from "@prisma/client";

export const getByExternalIdCarCardService = async (
  externalId: string,
): Promise<Prisma.CarCardGetPayload<{
  include: { specifications: true };
}> | null> => {
  const carCard = await prisma.carCard.findFirst({
    where: { externalId },
    include: { specifications: true },
  });
  return carCard;
};
