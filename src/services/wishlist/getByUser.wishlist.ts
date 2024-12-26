import prisma from "../../prisma";
import { Prisma } from "@prisma/client";

export const getByUserWishlist = async (
  userId: string,
): Promise<Prisma.WishlistGetPayload<{
  include: { WishlistCarCard: { include: { carCard: true } } };
}> | null> => {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      WishlistCarCard: {
        include: { carCard: { include: { specifications: true } } },
      },
    },
  });

  return wishlist;
};
