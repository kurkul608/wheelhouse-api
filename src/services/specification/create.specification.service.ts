import { Prisma } from "@prisma/client";
import prisma from "../../prisma";

export const createSpecificationService = async (
  specificationDto: Prisma.SpecificationCreateInput,
): Promise<Prisma.SpecificationGetPayload<any>> => {
  const specification = await prisma.specification.create({
    data: { ...specificationDto },
  });

  return specification;
};
