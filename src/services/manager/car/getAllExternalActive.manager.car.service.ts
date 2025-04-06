import prisma from "../../../prisma";

export const getAllExternalManagerCarService = async () => {
  try {
    const cars = await prisma.carCard.findMany({
      where: {
        isActive: true,
        externalId: {
          // @ts-ignore
          notIn: [null, ""],
        },
      },
    });
    return cars;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
