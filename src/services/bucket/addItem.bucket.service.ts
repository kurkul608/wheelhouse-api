import prisma from "../../prisma";

export async function addItemToBucket(userId: string, carCardId: string) {
  try {
    const bucket = await prisma.bucket.findUnique({
      where: { userId },
    });

    const bucketCarCardExist = await prisma.bucketCarCard.findFirst({
      where: { carCardId },
    });

    if (!bucket) {
      throw new Error("Bucket not found for this user");
    }

    if (bucketCarCardExist) {
      throw new Error("CarCard is already in the bucket");
    }

    const bucketCarCard = await prisma.bucketCarCard.create({
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
