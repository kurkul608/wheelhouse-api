import { prismaMongoClient } from "../../prisma";
import { Prisma } from "@prisma/client";
import { ONE_MONTH_CACHE_TTL, redisClient } from "../../redisClient";
import { generateWishlistKey } from "../../utils/redisKeys/generateWishlistKey";

export const getByUserWishlist = async (
  userId: string,
  forceClear?: boolean,
): Promise<Prisma.WishlistGetPayload<{
  include: { carCards: { include: { specifications: true } } };
}> | null> => {
  const cacheKey = generateWishlistKey(userId);

  const cachedData = await redisClient.get(cacheKey);
  if (cachedData && !forceClear) {
    console.log("Cache getByUserWishlist hit");
    return JSON.parse(cachedData);
  }
  if (forceClear) {
    await redisClient.del(cacheKey);
  }

  const wishlist = await prismaMongoClient.wishlist.findUnique({
    where: { userId },
    include: {
      carCards: {
        include: {
          specifications: true,
          photos: {
            orderBy: {
              weight: "asc",
            },
          },
        },
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
