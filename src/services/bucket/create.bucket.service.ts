import prisma from "../../prisma";
import { Prisma } from "@prisma/client";

export async function createBucket(
  userId: string,
): Promise<Prisma.BucketGetPayload<any>> {
  try {
    const existingBucket = await prisma.bucket.findUnique({
      where: { userId },
    });

    if (existingBucket) {
      throw new Error("Bucket already exists for this user");
    }

    const bucket = await prisma.bucket.create({
      data: {
        userId,
      },
    });

    return bucket;
  } catch (error) {
    console.error("Error creating bucket:", error);
    throw error;
  }
}
