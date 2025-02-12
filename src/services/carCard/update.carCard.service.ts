import prisma from "../../prisma";
import { Prisma } from "@prisma/client";
import { CACHE_TTL, redisClient } from "../../redisClient/idnex";
import { updateListCacheCarCardService } from "./updateListCache.carCard.service";
import { generateCarCardKey } from "../../utils/redisKeys/generateCarCardKey";

export const updateCarCardService = async (
  carCarId: string,
  data: Prisma.CarCardUpdateInput,
): Promise<Prisma.CarCardGetPayload<any> | null> => {
  const cacheKey = generateCarCardKey(carCarId);

  try {
    await prisma.carCard.update({ where: { id: carCarId }, data: data });

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      await redisClient.del(cacheKey);
    }

    const carCard = await prisma.carCard.findFirst({
      where: { id: carCarId },
      include: {
        photos: true,
        specifications: {
          select: { field: true, fieldName: true, value: true, id: true },
        },
      },
    });
    await redisClient.set(cacheKey, JSON.stringify(carCard), "EX", CACHE_TTL);

    updateListCacheCarCardService().catch((err) => {
      console.error("Ошибка при обработке ключей:", err);
    });

    return prisma.carCard.findUnique({ where: { id: carCarId } });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
