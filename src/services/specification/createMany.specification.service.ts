import prisma from "../../prisma";
import { Prisma } from "@prisma/client";

export const createManySpecificationService = async (
  specificationDtoList: Prisma.SpecificationCreateManyInput[],
): Promise<Prisma.SpecificationGetPayload<any>[]> => {
  await prisma.specification.createMany({
    data: specificationDtoList,
  });
  const carCardIds = specificationDtoList.map((spec) => spec.carCardId);
  const specifications = prisma.specification.findMany({
    where: { carCardId: { in: carCardIds } },
  });

  return specifications;
};
