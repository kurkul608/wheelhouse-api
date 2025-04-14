import prisma from "../../prisma";
import { Prisma } from "@prisma/client";
import { CACHE_TTL, redisClient } from "../../redisClient";
import { generateCarCardKey } from "../../utils/redisKeys/generateCarCardKey";

export const getCarCardService = async (
  id: string,
  forceClear?: boolean,
): Promise<Prisma.CarCardGetPayload<any> | null> => {
  const cacheKey = generateCarCardKey(id);

  const cachedData = await redisClient.get(cacheKey);
  if (cachedData && !forceClear) {
    console.log("Cache getCarCardService hit");
    return JSON.parse(cachedData);
  }
  if (forceClear) {
    await redisClient.del(cacheKey);
  }

  const carCard = await prisma.carCard.findUnique({
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

  await redisClient.set(cacheKey, JSON.stringify(carCard), "EX", CACHE_TTL);

  return carCard;
};
