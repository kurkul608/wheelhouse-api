import { Prisma } from "@prisma/client";
import prisma from "../../prisma";
import { updateListCacheCarCardService } from "./updateListCache.carCard.service";

export const createCarService = async (
  carCardDto: Prisma.CarCardCreateInput,
): Promise<Prisma.CarCardGetPayload<any>> => {
  const carCard = await prisma.carCard.create({
    data: { ...carCardDto, externalId: undefined },
  });

  updateListCacheCarCardService().catch((err) => {
    console.error("Ошибка при обработке ключей:", err);
  });

  return carCard;
};
