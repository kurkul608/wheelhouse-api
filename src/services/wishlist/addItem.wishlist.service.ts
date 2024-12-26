import prisma from "../../prisma";

export async function addItemToWishlist(userId: string, carCardId: string) {
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

    if (wishlistCarCardExist) {
      throw new Error("CarCard is already in the wishlist");
    }

    const wishlistCarCard = await prisma.wishlistCarCard.create({
      data: {
        wishlistId: wishlist.id,
        carCardId,
      },
    });

    return wishlistCarCard;
  } catch (error) {
    console.error("Error adding item to wishlist:", error);
    throw error;
  }
}
