import { prismaMongoClient } from "../../prisma";
import { Prisma } from "@prisma/client";

export const getByCarIdSpecificationService = async (
  carCardId: string,
): Promise<Prisma.SpecificationGetPayload<any>[]> => {
  const withCarId = Prisma.validator<Prisma.SpecificationFindManyArgs>()({
    where: { carCardId },
  });
  const specifications =
    await prismaMongoClient.specification.findMany(withCarId);

  return specifications;
};
