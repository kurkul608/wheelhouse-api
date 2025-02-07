import prisma from "../../prisma";
import { Prisma } from "@prisma/client";

export const getAllByExternalIdCarCardService = async (
  externalId: string,
  excludeIds?: string[],
): Promise<Prisma.CarCardGetPayload<any>[]> => {
  try {
    const carCards = await prisma.carCard.findMany({
      where: {
        externalId: {
          contains: externalId,
          mode: "insensitive",
        },
        id: {
          notIn: excludeIds,
        },
      },
    });

    return carCards;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
