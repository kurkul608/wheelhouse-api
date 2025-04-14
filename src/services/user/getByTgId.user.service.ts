import { Prisma } from "@prisma/client";
import { prismaMongoClient } from "../../prisma";
import { ONE_MONTH_CACHE_TTL, redisClient } from "../../redisClient";

export const getByTgIdUserService = async (
  userTgId: number,
  clearCache?: boolean,
): Promise<Prisma.UserGetPayload<any> | null> => {
  try {
    const cacheKey = `user:userTgId-${userTgId}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData && !clearCache) {
      console.log("Cache getByTgIdUserService hit");
      return JSON.parse(cachedData);
    }
    if (clearCache) {
      await redisClient.del(cacheKey);
    }
    const user = await prismaMongoClient.user.findUnique({
      where: { tgId: userTgId },
    });

    await redisClient.set(
      cacheKey,
      JSON.stringify(user),
      "EX",
      ONE_MONTH_CACHE_TTL,
    );

    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
