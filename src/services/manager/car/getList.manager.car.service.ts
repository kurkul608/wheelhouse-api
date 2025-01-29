import prisma from "../../../prisma";

interface GetListManagerCarService {
  searchString?: string;
  inStock?: boolean;
  isActive?: boolean;
}
export const getListManagerCarService = async ({
  searchString,
  inStock,
  isActive,
}: GetListManagerCarService) => {
  try {
    const whereConditions: any = {
      inStock,
      isActive,
    };

    if (searchString) {
      whereConditions.specifications = {
        some: {
          OR: [
            {
              field: "model",
              value: { contains: searchString, mode: "insensitive" },
            },
            {
              field: "specification",
              value: { contains: searchString, mode: "insensitive" },
            },
          ],
        },
      };
    }

    const cars = await prisma.carCard.findMany({
      include: { specifications: true, photos: true },
      where: whereConditions,
      // skip: offset,
      // take: limit,
    });

    return cars;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
