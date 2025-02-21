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

    const cars = await prisma.carCard.findMany({
      include: {
        photos: {
          orderBy: {
            weight: "asc",
          },
        },
      },
      where: {
        inStock,
        isActive,
        OR: [
          {
            carModel: {
              contains: searchString,
              mode: "insensitive",
            },
          },
          {
            carBrand: {
              contains: searchString,
              mode: "insensitive",
            },
          },
          {
            carVin: {
              contains: searchString,
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return cars;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
