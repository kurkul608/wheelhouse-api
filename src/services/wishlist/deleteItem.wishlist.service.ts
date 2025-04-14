import { prismaMongoClient } from "../../prisma";
import { getByUserWishlist } from "./getByUser.wishlist";

export async function deleteItemFromWishlist(
  userId: string,
  carCardId: string,
) {
  try {
    const [wishlist, carCard] = await Promise.all([
      prismaMongoClient.wishlist.findUnique({ where: { userId } }),
      prismaMongoClient.carCard.findUnique({ where: { id: carCardId } }),
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

    await prismaMongoClient.wishlist.update({
      where: { userId },
      data: {
        carCardIds: {
          set: wishlist.carCardIds.filter((id) => id !== carCardId),
        },
      },
    });

    const updatedWishlist = await getByUserWishlist(userId, true);

    return updatedWishlist;
  } catch (error) {
    console.error("Error deleting item to wishlist:", error);
    throw error;
  }
}
