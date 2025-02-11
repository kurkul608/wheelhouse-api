import prisma from "../../prisma";
import { Prisma } from "@prisma/client";
import { CACHE_TTL, redisClient } from "../../redisClient/idnex";

export const getCarCardService = async (
  id: string,
): Promise<Prisma.CarCardGetPayload<any> | null> => {
  const cacheKey = `car-card-${id}`;

  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    console.log("Cache getCarCardService hit");
    return JSON.parse(cachedData);
  }

  const carCard = await prisma.carCard.findUnique({
    where: { id },
    include: {
      photos: true,
      specifications: {
        select: { field: true, fieldName: true, value: true, id: true },
      },
    },
  });

  await redisClient.set(cacheKey, JSON.stringify(carCard), "EX", CACHE_TTL);

  return carCard;
};
