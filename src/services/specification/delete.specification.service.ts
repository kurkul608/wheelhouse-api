import { prismaMongoClient } from "../../prisma";
import { updateCarCacheCarCardService } from "../carCard/updateCarCache.carCard.service";

export const deleteSpecificationService = async (specificationId: string) => {
  try {
    const spec = await prismaMongoClient.specification.findUnique({
      where: { id: specificationId },
    });
    if (!spec) {
      throw new Error("Specification not found");
    }

    await prismaMongoClient.specification.delete({
      where: { id: specificationId },
    });

    updateCarCacheCarCardService(spec.carCardId).catch((err) => {
      console.error("Ошибка при обработке ключей:", err);
    });

    return { success: true, message: "Specification deleted successfully" };
  } catch (error) {
    throw new Error(
      (error as { message: string }).message ||
        "Failed to delete specification",
    );
  }
};
