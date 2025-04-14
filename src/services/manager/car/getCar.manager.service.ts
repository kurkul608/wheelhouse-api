import { prismaMongoClient } from "../../../prisma";
import { Prisma } from "@prisma/client";

export const getCarManagerService = async (
  id: string,
): Promise<Prisma.CarCardGetPayload<any> | null | undefined> => {
  try {
    const carCard = await prismaMongoClient.carCard.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: {
            weight: "asc",
          },
        },
        specifications: {
          select: { field: true, fieldName: true, value: true, id: true },
        },
      },
    });

    return carCard;
  } catch (error) {
    console.error("Error getCarManagerService", error);
  }
};
