import prisma from "../../prisma";
import { Prisma } from "@prisma/client";

export const getByUserBucket = async (
  userId: string,
): Promise<Prisma.BucketGetPayload<{
  include: {
    BucketCarCard: {
      include: { carCard: { include: { specifications: true } } };
    };
  };
}> | null> => {
  const bucket = await prisma.bucket.findUnique({
    where: { userId },
    include: {
      BucketCarCard: {
        include: { carCard: { include: { specifications: true } } },
      },
    },
  });

  return bucket;
};
