import prisma from "../../prisma";

export async function deleteItemFromWishlist(
  userId: string,
  carCardId: string,
) {
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

    if (!wishlist.carCardIds.some((id) => id === carCardId)) {
      throw new Error("CarCard is not wishlist");
    }

    const updatedWishlist = await prisma.wishlist.update({
      where: { userId },
      data: {
        carCardIds: {
          set: wishlist.carCardIds.filter((id) => id !== carCardId),
        },
      },
    });

    return updatedWishlist;
  } catch (error) {
    console.error("Error deleting item to wishlist:", error);
    throw error;
  }
}
