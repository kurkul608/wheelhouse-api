import prisma from "../../prisma";

export const clickRefService = async (refId: string) => {
  try {
    const existingRef = await prisma.ref.findUnique({ where: { id: refId } });

    if (existingRef) {
      if (existingRef.clicks === null) {
        return await prisma.ref.update({
          where: { id: refId },
          data: { clicks: 1 },
        });
      } else {
        return await prisma.ref.update({
          where: { id: refId },
          data: { clicks: { increment: 1 } },
        });
      }
    }
  } catch (error) {
    throw error;
  }
};
