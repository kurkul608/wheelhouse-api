import prisma from "../../prisma";
import { bot } from "../../bot";

export const removeCarCardDuplicatesService = async () => {
  try {
    const carCards = await prisma.carCard.findMany({
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
    const duplicates: Array<[string, number]> = [];

    for (const externalId in grouped) {
      const cards = grouped[externalId];
      if (cards.length > 1) {
        duplicates.push([cards[0].externalId || "", cards.length]);
      }
    }
    return duplicates;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
