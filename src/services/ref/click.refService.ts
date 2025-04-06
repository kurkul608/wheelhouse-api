import prisma from "../../prisma";
import { getRefService } from "./get.refService";

export const clickRefService = async (refId: string) => {
  try {
    const ref = await prisma.ref.upsert({
      where: { id: refId },
      update: {
        clicks: { increment: 1 },
      },
      create: {
        id: refId,
        clicks: BigInt(1),
      },
    });
    return ref;
  } catch (error) {
    throw error;
  }
};
