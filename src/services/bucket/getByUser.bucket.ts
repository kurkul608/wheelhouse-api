import prisma from "../../prisma";
import { Prisma } from "@prisma/client";
import { redisClient } from "../../redisClient";

export const getByUserBucket = async (
  userId: string,
): Promise<Prisma.BucketGetPayload<{
  include: {
    BucketCarCard: {
      include: { carCard: { include: { specifications: true } } };
    };
  };
}> | null> => {
  const cacheKey = `bucket:userId-${userId}`;

  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    console.log("Cache getByUserWishlist hit");
    return JSON.parse(cachedData);
  }

  const bucket = await prisma.bucket.findUnique({
    where: { userId },
    include: {
      BucketCarCard: {
        include: { carCard: { include: { specifications: true } } },
      },
    },
  });

  await redisClient.set(cacheKey, JSON.stringify(bucket));

  return bucket;
};
