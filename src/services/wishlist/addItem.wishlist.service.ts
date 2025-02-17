import prisma from "../../prisma";
import { getByUserWishlist } from "./getByUser.wishlist";

export async function addItemToWishlist(userId: string, carCardId: string) {
  try {
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

    if (wishlist.carCardIds.some((id) => id === carCardId)) {
      throw new Error("CarCard is already in the wishlist");
    }

    await prisma.wishlist.update({
      where: { userId },
      data: {
        carCardIds: {
          push: carCardId,
        },
      },
    });

    const updatedWishlist = await getByUserWishlist(userId, true);

    return updatedWishlist;
  } catch (error) {
    console.error("Error adding item to wishlist:", error);
    throw error;
  }
}
