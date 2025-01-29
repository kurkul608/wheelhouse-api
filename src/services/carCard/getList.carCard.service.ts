import prisma from "../../prisma";

export const getListCarCardService = async ({
  limit = 10,
  offset = 0,
  inStock,
  searchString,
}: {
  limit: number;
  offset: number;
  inStock?: boolean;
  searchString?: string;
}) => {
  const whereConditions: any = {
    isActive: true,
    inStock,
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

  const carCards = await prisma.carCard.findMany({
    skip: offset,
    take: limit,
    include: {
      photos: true,
      specifications: { select: { field: true, fieldName: true, value: true } },
    },
    where: whereConditions,
  });
  return carCards;
};
