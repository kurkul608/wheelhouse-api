import { Prisma } from "@prisma/client";
import { prismaMongoClient } from "../../prisma";
import { createBucket } from "../bucket/create.bucket.service";
import { createWishlistService } from "../wishlist/create.wishlist.service";
import { ONE_MONTH_CACHE_TTL, redisClient } from "../../redisClient";
import { getRefService } from "../ref/get.refService";

export const createUserService = async (
  userDto: Prisma.UserCreateInput,
  refId?: string,
): Promise<Prisma.UserGetPayload<any>> => {
  const ref = refId ? await getRefService(refId) : null;
  console.log(ref);
  try {
    const user = await prismaMongoClient.user.create({
      data: { ...userDto, ...(ref ? { Ref: { connect: { id: refId } } } : {}) },
    });
    const bucket = await createBucket(user.id);
    const wishlist = await createWishlistService(user.id);

    const cacheKey = `user:userTgId-${user.tgId}`;
    await redisClient.set(
      cacheKey,
      JSON.stringify(user),
      "EX",
      ONE_MONTH_CACHE_TTL,
    );
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
