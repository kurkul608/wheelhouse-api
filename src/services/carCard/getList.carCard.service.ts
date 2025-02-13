import prisma from "../../prisma";
import { CACHE_TTL, redisClient } from "../../redisClient/idnex";
import { generateCarCardListKey } from "../../utils/redisKeys/generateCarCardListKey";
import { parseCarCardListKey } from "../../utils/redisKeys/parseCarCardListKey";

export type GetListCarCardParams = {
  limit: number;
  offset: number;
  inStock?: boolean;
  searchString?: string;
  carModelFilter?: string[];
  carBrandFilter?: string[];
  maxDateFilter?: number;
  minDateFilter?: number;
  sortOrder: string;
  sortBy: string;
};

export const getListCarCardService = async ({
  limit = 10,
  offset = 0,
  inStock,
  searchString,
  carModelFilter,
  carBrandFilter,
  maxDateFilter,
  minDateFilter,
  sortBy,
  sortOrder,
}: GetListCarCardParams) => {
  const cacheKey = generateCarCardListKey({
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
  });

  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    console.log("Cache getListCarCardService hit");
    return JSON.parse(cachedData);
  }

  const whereConditions: any = {
    isActive: true,
    ...(typeof inStock !== "undefined" && { inStock }),
  };

  const andConditions: any[] = [];

  if (
    searchString ||
    (carBrandFilter && carBrandFilter.length) ||
    (carModelFilter && carModelFilter.length)
  ) {
    const orConditions: any[] = [];

    if (searchString) {
      orConditions.push(
        {
          field: "model",
          value: { contains: searchString, mode: "insensitive" },
        },
        {
          field: "specification",
          value: { contains: searchString, mode: "insensitive" },
        },
      );
    }

    if (carBrandFilter && carBrandFilter.length) {
      carBrandFilter.forEach((brand) => {
        orConditions.push({
          field: "model",
          value: { contains: brand, mode: "insensitive" },
        });
      });
    }

    if (carModelFilter && carModelFilter.length) {
      carModelFilter.forEach((model) => {
        orConditions.push({
          field: "specification",
          value: { contains: model, mode: "insensitive" },
        });
      });
    }

    if (orConditions.length) {
      andConditions.push({
        specifications: {
          some: {
            OR: orConditions,
          },
        },
      });
    }
  }

  if (minDateFilter || maxDateFilter) {
    const yearCondition: any = {};
    if (minDateFilter) {
      yearCondition.gte = minDateFilter.toString();
    }
    if (maxDateFilter) {
      yearCondition.lte = maxDateFilter.toString();
    }

    andConditions.push({
      specifications: {
        some: {
          field: "year",
          value: yearCondition,
        },
      },
    });
  }

  if (andConditions.length) {
    whereConditions.AND = andConditions;
  }

  const carCards = await prisma.carCard.findMany({
    skip: offset,
    take: limit,
    include: {
      photos: true,
      specifications: { select: { field: true, fieldName: true, value: true } },
    },
    where: whereConditions,
    ...(sortOrder && sortBy
      ? {
          orderBy: {
            createdAt: sortOrder === "asc" ? "asc" : "desc",
          },
        }
      : {}),
  });

  await redisClient.set(cacheKey, JSON.stringify(carCards), "EX", CACHE_TTL);

  return carCards;
};
