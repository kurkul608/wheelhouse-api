import { Prisma } from "@prisma/client";
import prisma from "../../prisma";

export const setDisableManyCarCardService = async (
  externalIdPart: string,
  externalIds: string[],
): Promise<Prisma.CarCardGetPayload<any>[]> => {
  const carCards = await prisma.carCard.findMany({
    where: {
      externalId: {
        startsWith: externalIdPart,
        notIn: externalIds,
      },
      isActive: true,
    },
  });

  await prisma.carCard.updateMany({
    where: {
      externalId: {
        startsWith: externalIdPart,
        notIn: externalIds,
      },
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });
  return carCards;
};
