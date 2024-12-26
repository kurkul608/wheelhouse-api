import prisma from "../../prisma";

export async function deleteItemFromBucket(userId: string, carCardId: string) {
  try {
    const bucket = await prisma.bucket.findUnique({
      where: { userId },
    });

    if (!bucket) {
      throw new Error("Bucket not found for this user");
    }

    const bucketCarCardExist = await prisma.bucketCarCard.findFirst({
      where: { carCardId, bucketId: bucket.id },
    });

    if (!bucketCarCardExist) {
      throw new Error("CarCard is not in the bucket");
    }

    await prisma.bucketCarCard.delete({ where: { id: bucketCarCardExist.id } });

    return true;
  } catch (error) {
    console.error("Error deleting item to bucket:", error);
    throw error;
  }
}
