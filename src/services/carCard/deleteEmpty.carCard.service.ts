import prisma from "../../prisma";

export const deleteEmptyCarCardService = async () => {
  const carCards = await prisma.carCard.findMany({
    where: {
      externalId: { equals: null },
    },
  });
  console.log(carCards[7]);
  console.log(carCards.length);
  // await prisma.specification.deleteMany({
  //   where: { carCardId: { in: carCards.map((carCard) => carCard.id) } },
  // });
  // await prisma.carCard.deleteMany({
  //   where: { externalId: null },
  // });
};
