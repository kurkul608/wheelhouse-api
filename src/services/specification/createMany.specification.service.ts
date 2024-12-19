import prisma from "../../prisma";
import { Prisma } from "@prisma/client";

export const createManySpecificationService = async (
  specificationDtoList: Prisma.SpecificationCreateManyInput[],
) => {
  const specifications = await prisma.specification.createMany({
    data: specificationDtoList,
  });

  return specifications;
};
