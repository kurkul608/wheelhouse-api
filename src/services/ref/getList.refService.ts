import { Ref } from "@prisma/client";
import { prismaMongoClient } from "../../prisma";
export const getListRefService = async (): Promise<Ref[]> => {
  try {
    const refCodes = await prismaMongoClient.ref.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return refCodes;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
