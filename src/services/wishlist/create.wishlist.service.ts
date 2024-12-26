import prisma from "../../prisma";
import { Prisma } from "@prisma/client";

export async function createWishlistService(
  userId: string,
): Promise<Prisma.WishlistGetPayload<any>> {
  try {
    const existingWishlist = await prisma.wishlist.findUnique({
      where: { userId },
    });

    if (existingWishlist) {
      throw new Error("wishlist already exists for this user");
    }

    const wishlist = await prisma.wishlist.create({
      data: {
        userId,
      },
    });

    return wishlist;
  } catch (error) {
    console.error("Error creating wishlist:", error);
    throw error;
  }
}
