import { prismaMongoClient } from "../../prisma";
import { Prisma } from "@prisma/client";
import { ONE_MONTH_CACHE_TTL, redisClient } from "../../redisClient";
import { generateWishlistKey } from "../../utils/redisKeys/generateWishlistKey";

export async function createWishlistService(
  userId: string,
): Promise<Prisma.WishlistGetPayload<any>> {
  try {
    const existingWishlist = await prismaMongoClient.wishlist.findUnique({
      where: { userId },
    });

    if (existingWishlist) {
      throw new Error("wishlist already exists for this user");
    }

    const wishlist = await prismaMongoClient.wishlist.create({
      data: {
        userId,
      },
    });

    const cacheKey = generateWishlistKey(userId);

    await redisClient.set(
      cacheKey,
      JSON.stringify(wishlist),
      "EX",
      ONE_MONTH_CACHE_TTL,
    );

    return wishlist;
  } catch (error) {
    console.error("Error creating wishlist:", error);
    throw error;
  }
}
