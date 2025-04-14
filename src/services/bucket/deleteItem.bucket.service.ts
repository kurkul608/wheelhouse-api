import { prismaMongoClient } from "../../prisma";

export async function deleteItemFromBucket(userId: string, carCardId: string) {
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

    if (!bucketCarCardExist) {
      throw new Error("CarCard is not in the bucket");
    }

    await prismaMongoClient.bucketCarCard.delete({
      where: { id: bucketCarCardExist.id },
    });

    return true;
  } catch (error) {
    console.error("Error deleting item to bucket:", error);
    throw error;
  }
}
