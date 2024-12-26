import prisma from "../../prisma";

export async function deleteItemFromWishlist(
  userId: string,
  carCardId: string,
) {
  try {
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
    });

    if (!wishlist) {
      throw new Error("wishlist not found for this user");
    }

    const wishlistCarCardExist = await prisma.wishlistCarCard.findFirst({
      where: { carCardId, wishlistId: wishlist.id },
    });

    if (!wishlistCarCardExist) {
      throw new Error("CarCard is not in the wishlist");
    }

    await prisma.wishlistCarCard.delete({
      where: { id: wishlistCarCardExist.id },
    });

    return true;
  } catch (error) {
    console.error("Error deleting item to wishlist:", error);
    throw error;
  }
}
