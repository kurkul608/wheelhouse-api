import { Prisma } from "@prisma/client";
import prisma from "../../prisma";
import { createBucket } from "../bucket/create.bucket.service";
import {
  CACHE_TTL,
  ONE_MONTH_CACHE_TTL,
  redisClient,
} from "../../redisClient/idnex";

export const getByTgIdUserService = async (
  userTgId: number,
): Promise<Prisma.UserGetPayload<any> | null> => {
  try {
    const cacheKey = `user:userTgId-${userTgId}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("Cache getByTgIdUserService hit");
      return JSON.parse(cachedData);
    }
    const user = await prisma.user.findUnique({ where: { tgId: userTgId } });

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
