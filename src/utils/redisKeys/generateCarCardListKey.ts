import { GetListCarCardParams } from "../../services/carCard/getList.carCard.service";

export const CAR_CARD_LIST_PREFIX = "carCards-030425:";

export const generateCarCardListKey = ({
  inStock,
  carBrandFilter,
  carModelFilter,
  maxDateFilter,
  minDateFilter,
  sortBy,
  sortOrder,
  offset,
  searchString,
  limit,
}: GetListCarCardParams): string =>
  `${CAR_CARD_LIST_PREFIX}${limit}:${offset}:${inStock}:${searchString}:${carModelFilter?.join(",")}:${carBrandFilter?.join(",")}:${maxDateFilter}:${minDateFilter}:${sortBy}:${sortOrder}`;
