import prisma from "../../prisma";
import { Prisma } from "@prisma/client";

export const getCarCardService = async (
  id: string,
): Promise<Prisma.CarCardGetPayload<any> | null> => {
  const carCard = await prisma.carCard.findUnique({
    where: { id },
    include: {
      photos: true,
      specifications: {
        select: { field: true, fieldName: true, value: true, id: true },
      },
    },
  });
  return carCard;
};
