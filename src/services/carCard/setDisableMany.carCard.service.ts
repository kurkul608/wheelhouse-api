import { Prisma } from "@prisma/client";
import prisma from "../../prisma";

export const setDisableManyCarCardService = async (
  externalIds: string[],
): Promise<void> => {
  await prisma.carCard.updateMany({
    where: {
      externalId: {
        startsWith: "weltcar-",
        notIn: externalIds,
      },
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });
};
