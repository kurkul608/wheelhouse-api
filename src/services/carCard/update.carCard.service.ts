import prisma from "../../prisma";
import { Prisma } from "@prisma/client";
import { CACHE_TTL, redisClient } from "../../redisClient/idnex";

export const updateCarCardService = async (
  carCarId: string,
  data: Prisma.CarCardUpdateInput,
): Promise<Prisma.CarCardGetPayload<any> | null> => {
  const cacheKey = `car-card-${carCarId}`;

  try {
    await prisma.carCard.update({ where: { id: carCarId }, data: data });

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      await redisClient.del(cacheKey);
    }

    const carCard = await prisma.carCard.findFirst({ where: { id: carCarId } });
    await redisClient.set(cacheKey, JSON.stringify(carCard), "EX", CACHE_TTL);

    return prisma.carCard.findUnique({ where: { id: carCarId } });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
