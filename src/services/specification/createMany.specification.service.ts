import { prismaMongoClient } from "../../prisma";
import { Prisma } from "@prisma/client";

export const createManySpecificationService = async (
  specificationDtoList: Prisma.SpecificationCreateManyInput[],
): Promise<Prisma.SpecificationGetPayload<any>[]> => {
  await prismaMongoClient.specification.createMany({
    data: specificationDtoList,
  });
  const carCardIds = specificationDtoList.map((spec) => spec.carCardId);
  const specifications = prismaMongoClient.specification.findMany({
    where: { carCardId: { in: carCardIds } },
  });

  return specifications;
};
