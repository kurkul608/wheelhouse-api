import { Ref } from "@prisma/client";
import prisma from "../../prisma";
export const getListRefService = async (): Promise<Ref[]> => {
  try {
    const refCodes = await prisma.ref.findMany();

    return refCodes;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
