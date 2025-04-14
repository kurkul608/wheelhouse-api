import { prismaMongoClient } from "../../prisma";

export async function addItemToBucket(userId: string, carCardId: string) {
  try {
    const bucket = await prismaMongoClient.bucket.findUnique({
      where: { userId },
    });

    if (!bucket) {
      throw new Error("Bucket not found for this user");
    }

    const bucketCarCardExist = await prismaMongoClient.bucketCarCard.findFirst({
      where: { carCardId, bucketId: bucket.id },
    });

    if (bucketCarCardExist) {
      throw new Error("CarCard is already in the bucket");
    }

    const bucketCarCard = await prismaMongoClient.bucketCarCard.create({
      data: {
        bucketId: bucket.id,
        carCardId,
      },
    });

    return bucketCarCard;
  } catch (error) {
    console.error("Error adding item to bucket:", error);
    throw error;
  }
}
