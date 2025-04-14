import { Prisma, Ref } from "@prisma/client";
import { prismaMongoClient } from "../../prisma";

export const createRefService = async (
  dto: Prisma.RefCreateInput,
): Promise<Ref | undefined> => {
  try {
    const ref = await prismaMongoClient.ref.create({ data: dto });
    return ref;
  } catch (error) {
    console.error(error);
  }
};
