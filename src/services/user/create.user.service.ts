import { Prisma } from "@prisma/client";
import prisma from "../../prisma";
import { createBucket } from "../bucket/create.bucket.service";
import { createWishlistService } from "../wishlist/create.wishlist.service";

export const createUserService = async (
  userDto: Prisma.UserCreateInput,
): Promise<Prisma.UserGetPayload<any>> => {
  try {
    const user = await prisma.user.create({ data: userDto });
    const bucket = await createBucket(user.id);
    const wishlist = await createWishlistService(user.id);

    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
