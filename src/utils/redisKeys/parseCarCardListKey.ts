import { GetListCarCardParams } from "../../services/carCard/getList.carCard.service";

export const parseCarCardListKey = (key: string): GetListCarCardParams => {
  const parts = key.split(":");

  if (parts.length !== 11 || parts[0] !== "carCards") {
    throw new Error("Invalid key format");
  }

  const [
    ,
    /* prefix */ limitStr,
    offsetStr,
    inStockStr,
    searchStringStr,
    carModelFilterStr,
    carBrandFilterStr,
    maxDateFilterStr,
    minDateFilterStr,
    sortBy,
    sortOrder,
  ] = parts;

  const limit = Number(limitStr);
  const offset = Number(offsetStr);
  const inStock =
    inStockStr === "true" ? true : inStockStr === "false" ? false : undefined;
  const searchString =
    searchStringStr === "undefined" || searchStringStr === ""
      ? ""
      : searchStringStr;
  const carModelFilter =
    carModelFilterStr === "undefined" || carModelFilterStr === ""
      ? undefined
      : carModelFilterStr.split(",");
  const carBrandFilter =
    carBrandFilterStr === "undefined" || carBrandFilterStr === ""
      ? undefined
      : carBrandFilterStr.split(",");
  const maxDateFilter =
    maxDateFilterStr === "undefined" || maxDateFilterStr === ""
      ? undefined
      : Number(maxDateFilterStr);
  const minDateFilter =
    minDateFilterStr === "undefined" || minDateFilterStr === ""
      ? undefined
      : Number(minDateFilterStr);

  return {
    limit,
    offset,
    inStock,
    searchString,
    carModelFilter,
    carBrandFilter,
    maxDateFilter,
    minDateFilter,
    sortBy,
    sortOrder,
  };
};
