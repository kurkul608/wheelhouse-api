import prisma from "../../../prisma";

export const getListManagerCarService = async (
  inStock: boolean,
  isActive?: boolean,
) => {
  try {
    const cars = await prisma.carCard.findMany({
      include: { specifications: true },
      where: {
        inStock,
        isActive,
      },
    });
    return cars;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
