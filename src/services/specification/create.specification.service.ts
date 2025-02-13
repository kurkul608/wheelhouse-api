import { Prisma } from "@prisma/client";
import prisma from "../../prisma";
import { updateListCacheCarCardService } from "../carCard/updateListCache.carCard.service";
import { updateCarCacheCarCardService } from "../carCard/updateCarCache.carCard.service";

export const createSpecificationService = async (
  specificationDto: Prisma.SpecificationCreateInput,
): Promise<Prisma.SpecificationGetPayload<any>> => {
  const specification = await prisma.specification.create({
    data: { ...specificationDto },
  });

  updateListCacheCarCardService().catch((err) => {
    console.error("Ошибка при обработке ключей:", err);
  });
  if ((specificationDto as unknown as { carCardId: string }).carCardId) {
    updateCarCacheCarCardService(
      (specificationDto as unknown as { carCardId: string }).carCardId,
    ).catch((err) => {
      console.error("Ошибка при обработке ключей:", err);
    });
  }

  return specification;
};
