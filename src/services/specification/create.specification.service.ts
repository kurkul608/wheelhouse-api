import { Prisma } from "@prisma/client";
import { prismaMongoClient } from "../../prisma";
import { updateListCacheCarCardService } from "../carCard/updateListCache.carCard.service";
import { updateCarCacheCarCardService } from "../carCard/updateCarCache.carCard.service";
import { updateCarCardService } from "../carCard/update.carCard.service";

export const createSpecificationService = async (
  specificationDto: Prisma.SpecificationCreateInput,
): Promise<Prisma.SpecificationGetPayload<any>> => {
  const specification = await prismaMongoClient.specification.create({
    data: { ...specificationDto },
  });

  const carCardId = (specificationDto as unknown as { carCardId: string })
    .carCardId;

  if (specificationDto.field === "model") {
    await updateCarCardService(carCardId, { carBrand: specificationDto.value });
  }
  if (specificationDto.field === "specification") {
    await updateCarCardService(carCardId, { carModel: specificationDto.value });
  }
  if (specificationDto.field === "year") {
    await updateCarCardService(carCardId, { carYear: specificationDto.value });
  }
  if (specificationDto.field === "vin") {
    await updateCarCardService(carCardId, { carVin: specificationDto.value });
  }

  updateListCacheCarCardService().catch((err) => {
    console.error("Ошибка при обработке ключей:", err);
  });

  if (carCardId) {
    updateCarCacheCarCardService(carCardId).catch((err) => {
      console.error("Ошибка при обработке ключей:", err);
    });
  }

  return specification;
};
