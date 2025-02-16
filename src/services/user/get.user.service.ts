import prisma from "../../prisma";
import { Prisma } from "@prisma/client";
import { generateUserKey } from "../../utils/redisKeys/generateUserKey";
import { redisClient } from "../../redisClient/idnex";

export const getUserService = async (
  userId: string,
  clearCache?: boolean,
): Promise<Prisma.UserGetPayload<any> | null> => {
  try {
    const userKey = generateUserKey(userId);
    const cachedData = await redisClient.get(userKey);
    if (cachedData && !clearCache) {
      console.log("User cache found!");
      return JSON.parse(cachedData);
    }
    if (clearCache) {
      await redisClient.del(userKey);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    await redisClient.set(userKey, JSON.stringify(user));
    return user;
  } catch (error) {
    console.log("Get user error: ", error);
    throw error;
  }
};
