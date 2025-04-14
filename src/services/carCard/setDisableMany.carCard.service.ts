import { Prisma } from "@prisma/client";
import { prismaMongoClient } from "../../prisma";

export const setDisableManyCarCardService = async (
  externalIds: string[],
): Promise<Prisma.CarCardGetPayload<any>[]> => {
  try {
    await prismaMongoClient.carCard.updateMany({
      where: {
        externalId: {
          in: externalIds,
        },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    const carCards = await prismaMongoClient.carCard.findMany({
      where: { externalId: { in: externalIds } },
    });

    return carCards;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
