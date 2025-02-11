export const CAR_CARD_PREFIX = "car-card:";

export const generateCarCardKey = (carCardId: string) =>
  `${CAR_CARD_PREFIX}${carCardId}`;
