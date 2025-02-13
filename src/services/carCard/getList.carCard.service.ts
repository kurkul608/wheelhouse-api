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
    inStock,
    specifications: {
      some: {},
    },
  };

  if (searchString) {
    whereConditions.specifications = {
      some: {
        OR: [
          {
            field: "model",
            value: { contains: searchString, mode: "insensitive" },
          },
          {
            field: "specification",
            value: { contains: searchString, mode: "insensitive" },
          },
        ],
      },
    };
  }
  if (carBrandFilter) {
    if (!whereConditions.specifications.some.OR) {
      whereConditions.specifications.some.OR = [];
    }

    carBrandFilter.forEach((brand) => {
      whereConditions.specifications.some.OR.push({
        field: "model",
        value: { contains: brand, mode: "insensitive" },
      });
    });
  }
  if (carModelFilter) {
    if (!whereConditions.specifications.some.OR) {
      whereConditions.specifications.some.OR = [];
    }

    carModelFilter.forEach((model) => {
      whereConditions.specifications.some.OR.push({
        field: "specification",
        value: { contains: model, mode: "insensitive" },
      });
    });
  }
  if (minDateFilter) {
    if (!whereConditions.specifications.some.AND) {
      whereConditions.specifications.some.AND = [];
    }
    whereConditions.specifications.some.AND.push({
      field: "year",
      value: { gte: minDateFilter.toString() },
    });
  }

  if (maxDateFilter) {
    if (!whereConditions.specifications.some.AND) {
      whereConditions.specifications.some.AND = [];
    }
    whereConditions.specifications.some.AND.push({
      field: "year",
      value: { lte: maxDateFilter.toString() },
    });
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

  // await redisClient.set(cacheKey, JSON.stringify(carCards), "EX", CACHE_TTL);

  return carCards;
};
