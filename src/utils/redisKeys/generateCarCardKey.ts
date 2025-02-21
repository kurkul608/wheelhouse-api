export const CAR_CARD_PREFIX = "car-card-2025-02-21:";

export const generateCarCardKey = (carCardId: string) =>
  `${CAR_CARD_PREFIX}${carCardId}`;
