import prisma from "../../prisma";

export const getListCarCardService = async ({
  limit = 10,
  offset = 0,
}: {
  limit: number;
  offset: number;
}) => {
  const carCards = await prisma.carCard.findMany({
    skip: offset,
    take: limit,
    select: {
      id: true,
      externalId: true,
      inStock: true,
      photos: true,
      importedPhotos: true,
      description: true,
      price: true,
      currency: true,
      isActive: true,
      specifications: { select: { field: true, fieldName: true, value: true } },
    },
    where: {
      isActive: true,
    },
  });
  return carCards;
};
