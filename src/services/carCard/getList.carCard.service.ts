import prisma from "../../prisma";

export const getListCarCardService = async ({
  limit = 10,
  offset = 0,
  inStock,
}: {
  limit: number;
  offset: number;
  inStock?: boolean;
}) => {
  const carCards = await prisma.carCard.findMany({
    skip: offset,
    take: limit,
    include: {
      photos: true,
      specifications: { select: { field: true, fieldName: true, value: true } },
    },
    where: {
      isActive: true,
      inStock,
    },
  });
  return carCards;
};
