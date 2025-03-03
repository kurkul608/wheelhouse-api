import { Prisma, Ref } from "@prisma/client";
import prisma from "../../prisma";

export const createRefService = async (
  dto: Prisma.RefCreateInput,
): Promise<Ref | undefined> => {
  try {
    const ref = await prisma.ref.create({ data: dto });
    return ref;
  } catch (error) {
    console.error(error);
  }
};
