import prisma from "../../prisma";
import { Prisma } from "@prisma/client";
import {
  CACHE_TTL,
  ONE_MONTH_CACHE_TTL,
  redisClient,
} from "../../redisClient/idnex";

export const getByUserWishlist = async (
  userId: string,
): Promise<Prisma.WishlistGetPayload<{
  include: { carCards: { include: { specifications: true } } };
}> | null> => {
  const cacheKey = `wishlist:userId-${userId}`;

  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    console.log("Cache getByUserWishlist hit");
    return JSON.parse(cachedData);
  }

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      carCards: {
        include: { specifications: true },
      },
    },
  });

  await redisClient.set(
    cacheKey,
    JSON.stringify(wishlist),
    "EX",
    ONE_MONTH_CACHE_TTL,
  );

  return wishlist;
};
