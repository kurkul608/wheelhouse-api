import { Prisma } from "@prisma/client";
import { prismaMongoClient } from "../../prisma";
import { updateListCacheCarCardService } from "./updateListCache.carCard.service";

export const createCarService = async (
  carCardDto: Prisma.CarCardCreateInput,
): Promise<Prisma.CarCardGetPayload<any>> => {
  const carCard = await prismaMongoClient.carCard.create({
    data: { ...carCardDto, externalId: undefined },
  });

  updateListCacheCarCardService().catch((err) => {
    console.error("Ошибка при обработке ключей:", err);
  });

  return carCard;
};
