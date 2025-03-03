import prisma from "../../prisma";
import { Ref } from "@prisma/client";

export const getRefService = async (
  refId: string,
): Promise<Ref | null | undefined> => {
  try {
    const ref = await prisma.ref.findUnique({ where: { id: refId } });
    return ref;
  } catch (error) {
    console.error(error);
  }
};
