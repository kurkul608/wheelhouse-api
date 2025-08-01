import { prismaMongoClient } from "../../prisma";
import { Prisma } from "@prisma/client";
import { CACHE_TTL, redisClient } from "../../redisClient";
import { updateListCacheCarCardService } from "./updateListCache.carCard.service";
import { generateCarCardKey } from "../../utils/redisKeys/generateCarCardKey";
import { updateCarCacheCarCardService } from "./updateCarCache.carCard.service";
import { updateFileService } from "../file/update.file.service";
import { getCarCardService } from "./get.carCard.service";

export const updateCarCardService = async (
  carCarId: string,
  { photosIds, ...data }: Prisma.CarCardUpdateInput & { photosIds?: string[] },
): Promise<Prisma.CarCardGetPayload<any> | null> => {
  const cacheKey = generateCarCardKey(carCarId);

  try {
    await prismaMongoClient.carCard.update({
      where: { id: carCarId },
      data: data,
    });

    if (photosIds) {
      for (const photoId of photosIds) {
        const index = photosIds.indexOf(photoId);
        await updateFileService(photoId, { weight: index });
      }
    }

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      await redisClient.del(cacheKey);
    }

    updateListCacheCarCardService().catch((err) => {
      console.error("Ошибка при обработке ключей:", err);
    });
    updateCarCacheCarCardService(carCarId).catch((err) => {
      console.error("Ошибка при обработке ключей:", err);
    });

    return prismaMongoClient.carCard.findUnique({ where: { id: carCarId } });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
