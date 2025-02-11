import { Prisma } from "@prisma/client";
import prisma from "../../prisma";
import { createBucket } from "../bucket/create.bucket.service";
import { createWishlistService } from "../wishlist/create.wishlist.service";
import { ONE_MONTH_CACHE_TTL, redisClient } from "../../redisClient/idnex";

export const createUserService = async (
  userDto: Prisma.UserCreateInput,
): Promise<Prisma.UserGetPayload<any>> => {
  try {
    const user = await prisma.user.create({ data: userDto });
    const bucket = await createBucket(user.id);
    const wishlist = await createWishlistService(user.id);

    const cacheKey = `user:userTgId-${user.tgId}`;
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
