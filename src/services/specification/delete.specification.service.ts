import prisma from "../../prisma";
import { updateCarCacheCarCardService } from "../carCard/updateCarCache.carCard.service";

export const deleteSpecificationService = async (specificationId: string) => {
  try {
    const spec = await prisma.specification.findUnique({
      where: { id: specificationId },
    });
    if (!spec) {
      throw new Error("Specification not found");
    }

    await prisma.specification.delete({
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
