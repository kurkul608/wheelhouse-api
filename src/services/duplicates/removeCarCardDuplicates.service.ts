import { prismaMongoClient } from "../../prisma";

export const removeCarCardDuplicatesService = async () => {
  try {
    const carCards = await prismaMongoClient.carCard.findMany({
      where: { externalId: { not: null } },
      orderBy: { updatedAt: "desc" },
    });

    const grouped = carCards.reduce(
      (acc, card) => {
        if (card.externalId) {
          if (!acc[card.externalId]) {
            acc[card.externalId] = [];
          }
          acc[card.externalId].push(card);
        }
        return acc;
      },
      {} as Record<string, typeof carCards>,
    );
    // const duplicates: Array<[string, number]> = [];

    for (const externalId in grouped) {
      const cards = grouped[externalId];
      if (cards.length > 1) {
        // duplicates.push([cards[0].externalId || "", cards.length]);

        const cardToKeep = cards[0];
        const duplicates = cards.slice(1);

        for (const duplicate of duplicates) {
          await prismaMongoClient.specification.deleteMany({
            where: { carCardId: duplicate.id },
          });

          await prismaMongoClient.carCard.delete({
            where: { id: duplicate.id },
          });
        }
      }
    }

    // return duplicates;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
