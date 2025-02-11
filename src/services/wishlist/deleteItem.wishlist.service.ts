import prisma from "../../prisma";
import { ONE_MONTH_CACHE_TTL, redisClient } from "../../redisClient/idnex";

export async function deleteItemFromWishlist(
  userId: string,
  carCardId: string,
) {
  try {
    const cacheKey = `wishlist:userId-${userId}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      await redisClient.del(cacheKey);
    }

    const [wishlist, carCard] = await Promise.all([
      prisma.wishlist.findUnique({ where: { userId } }),
      prisma.carCard.findUnique({ where: { id: carCardId } }),
    ]);

    if (!wishlist) {
      throw new Error("wishlist not found for this user");
    }

    if (!carCard) {
      throw new Error(`CarCard с ID ${carCardId} не найден`);
    }

    if (!wishlist.carCardIds.some((id) => id === carCardId)) {
      throw new Error("CarCard is not wishlist");
    }

    await prisma.wishlist.update({
      where: { userId },
      data: {
        carCardIds: {
          set: wishlist.carCardIds.filter((id) => id !== carCardId),
        },
      },
    });

    const updatedWishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: {
        carCards: {
          include: { specifications: true },
        },
      },
    });

    await redisClient.set(
      cacheKey,
      JSON.stringify(updatedWishlist),
      "EX",
      ONE_MONTH_CACHE_TTL,
    );

    return updatedWishlist;
  } catch (error) {
    console.error("Error deleting item to wishlist:", error);
    throw error;
  }
}
