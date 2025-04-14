import { prismaMongoClient } from "../../prisma";
import { CACHE_TTL, redisClient } from "../../redisClient";
import { updateListCacheCarCardService } from "./updateListCache.carCard.service";
import { generateCarCardKey } from "../../utils/redisKeys/generateCarCardKey";
import { getCarCardService } from "./get.carCard.service";
import { updateCarCacheCarCardService } from "./updateCarCache.carCard.service";

export const removePhotoFromCarCard = async (
  carCardId: string,
  fileId: string,
) => {
  try {
    const cacheKey = generateCarCardKey(carCardId);
    const carCard = await prismaMongoClient.carCard.findUnique({
      where: { id: carCardId },
      include: {
        photos: {
          orderBy: {
            weight: "asc",
          },
        },
      },
    });

    if (!carCard) {
      throw new Error("CarCard not found");
    }

    const photoExists = carCard.photos.some((photo) => photo.id === fileId);

    if (!photoExists) {
      throw new Error("File is not associated with this CarCard");
    }

    await prismaMongoClient.carCard.update({
      where: { id: carCardId },
      data: {
        photos: {
          disconnect: { id: fileId },
        },
      },
    });

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      await redisClient.del(cacheKey);
    }

    await getCarCardService(carCardId);

    await redisClient.set(cacheKey, JSON.stringify(carCard), "EX", CACHE_TTL);

    updateListCacheCarCardService().catch((err) => {
      console.error("Ошибка при обработке ключей:", err);
    });
    updateCarCacheCarCardService(carCardId).catch((err) => {
      console.error("Ошибка при обработке ключей:", err);
    });

    return {
      success: true,
      message: "File disconnected from CarCard successfully",
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to disconnect file from CarCard");
  }
};
