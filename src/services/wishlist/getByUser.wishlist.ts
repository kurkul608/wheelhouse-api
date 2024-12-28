import prisma from "../../prisma";
import { Prisma } from "@prisma/client";

export const getByUserWishlist = async (
  userId: string,
): Promise<Prisma.WishlistGetPayload<{
  include: { carCards: { include: { specifications: true } } };
}> | null> => {
  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      carCards: {
        include: { specifications: true },
      },
    },
  });

  return wishlist;
};
