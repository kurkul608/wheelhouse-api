import { prismaMongoClient } from "../../prisma";
import { Prisma } from "@prisma/client";

export const getByExternalIdCarCardService = async (
  externalId: string,
): Promise<Prisma.CarCardGetPayload<{
  include: { specifications: true };
}> | null> => {
  const carCard = await prismaMongoClient.carCard.findFirst({
    where: { externalId },
    include: { specifications: true },
  });
  return carCard;
};
